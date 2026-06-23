import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { IStorageService, MulterFile } from '../storage/storage.interface';
import { STORAGE_SERVICE } from '../storage/storage.interface';
import { AssetType } from '@prisma/client';

// Static thumbnail paths served by the frontend (frontend/public/thumbnails/).
// SHORTCUT: These are static fallback images rather than generated thumbnails.
// With more time: generate real thumbnails on upload (e.g. pdf-thumbnail for docs,
// microlink.io og:image for links).
const THUMBNAILS = {
  LINK: '/thumbnails/link.png',
  DOCUMENT: '/thumbnails/document.png',
  PHOTO: '/thumbnails/image.png',
  YOUTUBE: '/thumbnails/youtube.png',
  VIMEO: '/thumbnails/vimeo.png',
} as const;

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
  ) {}

  // -------------------------------------------------------------------------
  // Create a LINK asset
  // -------------------------------------------------------------------------
  async createLink(
    projectId: string,
    data: { name: string; url: string; label?: string },
  ) {
    await this.assertProjectExists(projectId);
    return this.prisma.asset.create({
      data: {
        projectId,
        type: AssetType.LINK,
        name: data.name,
        thumbnailUrl: THUMBNAILS.LINK,
        assetLink: {
          create: { url: data.url, label: data.label },
        },
      },
      include: { assetLink: true },
    });
  }

  // -------------------------------------------------------------------------
  // Update a LINK asset
  // -------------------------------------------------------------------------
  async updateLink(
    projectId: string,
    assetId: string,
    data: { name?: string; url?: string; label?: string },
  ) {
    await this.assertAssetExists(projectId, assetId);
    return this.prisma.asset.update({
      where: { id: assetId },
      data: {
        ...(data.name && { name: data.name }),
        assetLink: {
          update: {
            ...(data.url && { url: data.url }),
            ...(data.label && { label: data.label }),
          },
        },
      },
      include: { assetLink: true },
    });
  }

  // -------------------------------------------------------------------------
  // Create a FILE asset (DOCUMENT or PHOTO)
  // -------------------------------------------------------------------------
  async createFile(
    projectId: string,
    data: { name: string; type: 'DOCUMENT' | 'PHOTO' },
    file: MulterFile,
  ) {
    await this.assertProjectExists(projectId);

    const filename = await this.storage.save(file);
    const url = this.storage.getUrl(filename);

    const thumbnailUrl = file.mimetype.startsWith('image/')
      ? url
      : THUMBNAILS.DOCUMENT;

    return this.prisma.asset.create({
      data: {
        projectId,
        type: data.type === 'DOCUMENT' ? AssetType.DOCUMENT : AssetType.PHOTO,
        name: data.name,
        thumbnailUrl,
        assetFile: {
          create: {
            filePath: filename,
            mimeType: file.mimetype,
            sizeBytes: file.size,
          },
        },
      },
      include: { assetFile: true },
    });
  }

  // -------------------------------------------------------------------------
  // Update a FILE asset — replaces the file on disk and updates the DB record.
  // Delete old file first, then save new file, then update DB atomically.
  // TRADEOFF: if the DB update fails after the file is saved, the new file
  // will be orphaned on disk. A proper solution would use a transaction with
  // compensating actions, but that's out of scope here.
  // -------------------------------------------------------------------------
  async updateFile(
    projectId: string,
    assetId: string,
    data: { name?: string },
    file: MulterFile,
  ) {
    const asset = await this.assertAssetExists(projectId, assetId);

    if (!asset.assetFile) {
      throw new NotFoundException(`Asset ${assetId} has no file to replace`);
    }

    // Delete old file from disk
    await this.storage.delete(asset.assetFile.filePath);

    // Save new file
    const filename = await this.storage.save(file);
    const url = this.storage.getUrl(filename);

    const thumbnailUrl = file.mimetype.startsWith('image/')
      ? url
      : THUMBNAILS.DOCUMENT;

    return this.prisma.asset.update({
      where: { id: assetId },
      data: {
        name: data.name ?? asset.name,
        thumbnailUrl,
        assetFile: {
          update: {
            filePath: filename,
            mimeType: file.mimetype,
            sizeBytes: file.size,
          },
        },
      },
      include: { assetFile: true },
    });
  }

  // -------------------------------------------------------------------------
  // Create a VIDEO asset (external URL only)
  // -------------------------------------------------------------------------
  async createVideo(
    projectId: string,
    data: { name: string; externalUrl: string },
  ) {
    await this.assertProjectExists(projectId);

    const platform = this.detectVideoPlatform(data.externalUrl);
    const thumbnailUrl = this.extractVideoThumbnail(data.externalUrl, platform)
      ?? THUMBNAILS[platform as keyof typeof THUMBNAILS]
      ?? THUMBNAILS.LINK;

    return this.prisma.asset.create({
      data: {
        projectId,
        type: AssetType.VIDEO,
        name: data.name,
        thumbnailUrl,
        assetVideo: {
          create: { externalUrl: data.externalUrl, platform },
        },
      },
      include: { assetVideo: true },
    });
  }

  // -------------------------------------------------------------------------
  // Update a VIDEO asset
  // -------------------------------------------------------------------------
  async updateVideo(
    projectId: string,
    assetId: string,
    data: { name?: string; externalUrl?: string },
  ) {
    await this.assertAssetExists(projectId, assetId);

    let thumbnailUrl: string | undefined;
    if (data.externalUrl) {
      const platform = this.detectVideoPlatform(data.externalUrl);
      thumbnailUrl = this.extractVideoThumbnail(data.externalUrl, platform)
        ?? THUMBNAILS[platform as keyof typeof THUMBNAILS]
        ?? THUMBNAILS.LINK;
    }

    return this.prisma.asset.update({
      where: { id: assetId },
      data: {
        ...(data.name && { name: data.name }),
        ...(thumbnailUrl && { thumbnailUrl }),
        assetVideo: {
          update: {
            ...(data.externalUrl && { externalUrl: data.externalUrl }),
            ...(data.externalUrl && {
              platform: this.detectVideoPlatform(data.externalUrl),
            }),
          },
        },
      },
      include: { assetVideo: true },
    });
  }

  // -------------------------------------------------------------------------
  // Delete an asset — works for all types
  // -------------------------------------------------------------------------
  async remove(projectId: string, assetId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id: assetId, projectId },
      include: { assetFile: true },
    });

    if (!asset) throw new NotFoundException(`Asset ${assetId} not found`);

    if (asset.assetFile) {
      await this.storage.delete(asset.assetFile.filePath);
    }

    await this.prisma.asset.delete({ where: { id: assetId } });
  }

  // -------------------------------------------------------------------------
  // List all assets for a project
  // -------------------------------------------------------------------------
  async findByProject(projectId: string) {
    await this.assertProjectExists(projectId);
    return this.prisma.asset.findMany({
      where: { projectId },
      include: {
        assetLink: true,
        assetFile: true,
        assetVideo: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  private async assertProjectExists(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
  }

  private async assertAssetExists(projectId: string, assetId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id: assetId, projectId },
      include: { assetFile: true },
    });
    if (!asset) throw new NotFoundException(`Asset ${assetId} not found`);
    return asset;
  }

  private detectVideoPlatform(url: string) {
    if (url.includes('youtube.com') || url.includes('youtu.be'))
      return 'YOUTUBE' as const;
    if (url.includes('vimeo.com')) return 'VIMEO' as const;
    return 'OTHER' as const;
  }

  private extractVideoThumbnail(url: string, platform: string): string | null {
    if (platform === 'YOUTUBE') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return null;
  }
}