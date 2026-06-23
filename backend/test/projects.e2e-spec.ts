import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test', override: true });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { truncateTables, createTestProject, testPrisma } from './db-helpers';

describe('Projects E2E', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
    await testPrisma.$disconnect();
  });

  // -------------------------------------------------------------------------
  // GET /api/projects
  // -------------------------------------------------------------------------
  describe('GET /api/projects', () => {
    it('returns an empty list when there are no projects', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/projects')
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('returns a list of projects with asset counts', async () => {
      await createTestProject();
      await createTestProject();

      const res = await request(app.getHttpServer())
        .get('/api/projects')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('_count');
      expect(res.body[0]._count).toHaveProperty('assets');
    });
  });

  // -------------------------------------------------------------------------
  // GET /api/projects/:id
  // -------------------------------------------------------------------------
  describe('GET /api/projects/:id', () => {
    it('returns a project with its assets and custom fields', async () => {
      const project = await createTestProject();

      await testPrisma.customField.create({
        data: {
          projectId: project.id,
          key: 'Internal',
          value: 'TYPE 4',
          valueType: 'TEXT',
        },
      });

      await testPrisma.asset.create({
        data: {
          projectId: project.id,
          type: 'LINK',
          name: 'Test Link',
          thumbnailUrl: '/thumbnails/link.png',
          assetLink: { create: { url: 'https://example.com' } },
        },
      });

      const res = await request(app.getHttpServer())
        .get(`/api/projects/${project.id}`)
        .expect(200);

      expect(res.body.id).toBe(project.id);
      expect(res.body.assets).toHaveLength(1);
      expect(res.body.assets[0].type).toBe('LINK');
      expect(res.body.customFields).toHaveLength(1);
      expect(res.body.customFields[0].key).toBe('Internal');
    });

    it('returns 404 for a non-existent project', async () => {
      await request(app.getHttpServer())
        .get('/api/projects/non-existent-id')
        .expect(404);
    });
  });

  // -------------------------------------------------------------------------
  // POST /api/projects
  // -------------------------------------------------------------------------
  describe('POST /api/projects', () => {
    it('creates a project and returns it', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/projects')
        .send({
          title: 'New Project',
          status: 'In Progress',
          address: '1 Test St, Sydney NSW',
          bookingId: '10001',
          customerRef: 'SG10001',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('New Project');
      expect(res.body.status).toBe('In Progress');
      expect(res.body.bookingId).toBe('10001');
    });

    it('returns 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/api/projects')
        .send({ address: 'Missing title and status' })
        .expect(400);
    });
  });

  // -------------------------------------------------------------------------
  // PATCH /api/projects/:id
  // -------------------------------------------------------------------------
  describe('PATCH /api/projects/:id', () => {
    it('updates a project and returns the updated version', async () => {
      const project = await createTestProject();

      const res = await request(app.getHttpServer())
        .patch(`/api/projects/${project.id}`)
        .send({ status: 'Complete' })
        .expect(200);

      expect(res.body.status).toBe('Complete');
      expect(res.body.title).toBe(project.title); // unchanged
    });

    it('returns 404 for a non-existent project', async () => {
      await request(app.getHttpServer())
        .patch('/api/projects/non-existent-id')
        .send({ status: 'Complete' })
        .expect(404);
    });
  });

  // -------------------------------------------------------------------------
  // DELETE /api/projects/:id
  // -------------------------------------------------------------------------
  describe('DELETE /api/projects/:id', () => {
    it('deletes a project and removes it from the database', async () => {
      const project = await createTestProject();

      await request(app.getHttpServer())
        .delete(`/api/projects/${project.id}`)
        .expect(200);

      const deleted = await testPrisma.project.findUnique({
        where: { id: project.id },
      });
      expect(deleted).toBeNull();
    });

    it('deletes a project and cascades to its assets', async () => {
      const project = await createTestProject();

      const asset = await testPrisma.asset.create({
        data: {
          projectId: project.id,
          type: 'LINK',
          name: 'Test Link',
          thumbnailUrl: '/thumbnails/link.png',
          assetLink: { create: { url: 'https://example.com' } },
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/projects/${project.id}`)
        .expect(200);

      const deletedAsset = await testPrisma.asset.findUnique({
        where: { id: asset.id },
      });
      expect(deletedAsset).toBeNull();
    });

    it('returns 404 for a non-existent project', async () => {
      await request(app.getHttpServer())
        .delete('/api/projects/non-existent-id')
        .expect(404);
    });
  });
});