import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_SERVICE } from '../storage/storage.interface';

// Unit tests isolate the service from its dependencies by replacing them
// with mocks. This means we're testing the service logic only —
// not Prisma, not the file system, not the database.

// jest.fn() creates a mock function that records calls and can return
// preset values. We use it to simulate Prisma and StorageService.

const mockPrisma = {
  project: {
    findUnique: jest.fn(),
  },
  asset: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
};

const mockStorage = {
  save: jest.fn(),
  delete: jest.fn(),
  getUrl: jest.fn(),
};

describe('AssetsService', () => {
  let service: AssetsService;

  beforeEach(async () => {
    // Reset all mocks before each test so calls don't bleed between tests
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: STORAGE_SERVICE, useValue: mockStorage },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
  });

  // -------------------------------------------------------------------------
  // Platform detection
  // These are private methods so we test them indirectly via createVideo.
  // -------------------------------------------------------------------------
  describe('createVideo — platform detection', () => {
    beforeEach(() => {
      // Make assertProjectExists pass
      mockPrisma.project.findUnique.mockResolvedValue({ id: 'project-1' });
      mockPrisma.asset.create.mockResolvedValue({});
    });

    it('detects YouTube from youtube.com URL', async () => {
      await service.createVideo('project-1', {
        name: 'Test',
        externalUrl: 'https://youtube.com/watch?v=abc123',
      });

      expect(mockPrisma.asset.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            // YouTube thumbnail should be extracted from the URL
            thumbnailUrl: 'https://img.youtube.com/vi/abc123/hqdefault.jpg',
            assetVideo: {
              create: expect.objectContaining({ platform: 'YOUTUBE' }),
            },
          }),
        }),
      );
    });

    it('detects YouTube from youtu.be short URL', async () => {
      await service.createVideo('project-1', {
        name: 'Test',
        externalUrl: 'https://youtu.be/abc123',
      });

      expect(mockPrisma.asset.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            thumbnailUrl: 'https://img.youtube.com/vi/abc123/hqdefault.jpg',
            assetVideo: {
              create: expect.objectContaining({ platform: 'YOUTUBE' }),
            },
          }),
        }),
      );
    });

    it('detects Vimeo and falls back to static thumbnail', async () => {
      await service.createVideo('project-1', {
        name: 'Test',
        externalUrl: 'https://vimeo.com/123456',
      });

      expect(mockPrisma.asset.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            // Vimeo has no CDN thumbnail — falls back to static
            thumbnailUrl: '/thumbnails/vimeo.png',
            assetVideo: {
              create: expect.objectContaining({ platform: 'VIMEO' }),
            },
          }),
        }),
      );
    });

    it('falls back to link thumbnail for unknown video platform', async () => {
      await service.createVideo('project-1', {
        name: 'Test',
        externalUrl: 'https://unknown-video-site.com/video/123',
      });

      expect(mockPrisma.asset.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            thumbnailUrl: '/thumbnails/link.png',
            assetVideo: {
              create: expect.objectContaining({ platform: 'OTHER' }),
            },
          }),
        }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // createLink
  // -------------------------------------------------------------------------
  describe('createLink', () => {
    it('throws NotFoundException when project does not exist', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.createLink('non-existent', { name: 'Test', url: 'https://example.com' }),
      ).rejects.toThrow('non-existent');
    });

    it('creates a link asset with the static link thumbnail', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({ id: 'project-1' });
      mockPrisma.asset.create.mockResolvedValue({});

      await service.createLink('project-1', {
        name: 'Test Link',
        url: 'https://example.com',
      });

      expect(mockPrisma.asset.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            thumbnailUrl: '/thumbnails/link.png',
            type: 'LINK',
          }),
        }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // createFile — thumbnail logic
  // -------------------------------------------------------------------------
  describe('createFile — thumbnail logic', () => {
    beforeEach(() => {
      mockPrisma.project.findUnique.mockResolvedValue({ id: 'project-1' });
      mockPrisma.asset.create.mockResolvedValue({});
      mockStorage.save.mockResolvedValue('test-file.png');
      mockStorage.getUrl.mockReturnValue('/uploads/test-file.png');
    });

    it('uses the file URL as thumbnail for image files', async () => {
      await service.createFile(
        'project-1',
        { name: 'Photo', type: 'PHOTO' },
        { mimetype: 'image/png', originalname: 'photo.png', buffer: Buffer.from(''), size: 100 } as any,
      );

      expect(mockPrisma.asset.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            thumbnailUrl: '/uploads/test-file.png',
          }),
        }),
      );
    });

    it('uses static document thumbnail for non-image files', async () => {
      await service.createFile(
        'project-1',
        { name: 'Doc', type: 'DOCUMENT' },
        { mimetype: 'application/pdf', originalname: 'doc.pdf', buffer: Buffer.from(''), size: 100 } as any,
      );

      expect(mockPrisma.asset.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            thumbnailUrl: '/thumbnails/document.png',
          }),
        }),
      );
    });
  });
});