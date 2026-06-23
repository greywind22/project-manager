import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test', override: true });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { truncateTables, createTestProject, testPrisma } from './db-helpers';

// supertest is a library that lets us make HTTP requests to a NestJS app
// in tests without starting a real server. It wraps the app and sends
// requests directly to it.
describe('Assets E2E', () => {
  let app: INestApplication;
  let projectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  beforeEach(async () => {
    await truncateTables();
    const project = await createTestProject();
    projectId = project.id;
  });

  afterAll(async () => {
    await app.close();
    await testPrisma.$disconnect();
  });

  describe('POST /api/projects/:projectId/assets/links', () => {
    it('creates a link asset and returns it', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/projects/${projectId}/assets/links`)
        .send({ name: 'Matterport', url: 'https://matterport.com' })
        .expect(201);

      expect(res.body.type).toBe('LINK');
      expect(res.body.assetLink.url).toBe('https://matterport.com');
      expect(res.body.thumbnailUrl).toBe('/thumbnails/link.png');
    });

    it('returns 404 when project does not exist', async () => {
      await request(app.getHttpServer())
        .post('/api/projects/non-existent-id/assets/links')
        .send({ name: 'Test', url: 'https://example.com' })
        .expect(404);
    });
  });

  describe('PATCH /api/projects/:projectId/assets/:assetId/links', () => {
    it('updates a link asset url and name', async () => {
      const created = await testPrisma.asset.create({
        data: {
          projectId,
          type: 'LINK',
          name: 'Old Name',
          thumbnailUrl: '/thumbnails/link.png',
          assetLink: { create: { url: 'https://old.com' } },
        },
      });

      const res = await request(app.getHttpServer())
        .patch(`/api/projects/${projectId}/assets/${created.id}/links`)
        .send({ name: 'New Name', url: 'https://new.com' })
        .expect(200);

      expect(res.body.name).toBe('New Name');
      expect(res.body.assetLink.url).toBe('https://new.com');
    });
  });

  describe('DELETE /api/projects/:projectId/assets/:assetId', () => {
    it('deletes an asset and removes it from the database', async () => {
      const asset = await testPrisma.asset.create({
        data: {
          projectId,
          type: 'LINK',
          name: 'To Delete',
          thumbnailUrl: '/thumbnails/link.png',
          assetLink: { create: { url: 'https://example.com' } },
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/projects/${projectId}/assets/${asset.id}`)
        .expect(200);

      const deleted = await testPrisma.asset.findUnique({
        where: { id: asset.id },
      });
      expect(deleted).toBeNull();
    });

    it('returns 404 when asset does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/api/projects/${projectId}/assets/non-existent-id`)
        .expect(404);
    });
  });
});