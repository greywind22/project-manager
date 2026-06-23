import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import type { MulterFile } from '../storage/storage.interface';

@Controller('projects/:projectId/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // GET /projects/:projectId/assets
  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.assetsService.findByProject(projectId);
  }

  // POST /projects/:projectId/assets/links
  @Post('links')
  createLink(
    @Param('projectId') projectId: string,
    @Body() body: { name: string; url: string; label?: string },
  ) {
    return this.assetsService.createLink(projectId, body);
  }

  // PATCH /projects/:projectId/assets/:assetId/links
  @Patch(':assetId/links')
  updateLink(
    @Param('projectId') projectId: string,
    @Param('assetId') assetId: string,
    @Body() body: { name?: string; url?: string; label?: string },
  ) {
    return this.assetsService.updateLink(projectId, assetId, body);
  }

  // POST /projects/:projectId/assets/videos
  @Post('videos')
  createVideo(
    @Param('projectId') projectId: string,
    @Body() body: { name: string; externalUrl: string },
  ) {
    return this.assetsService.createVideo(projectId, body);
  }

  // PATCH /projects/:projectId/assets/:assetId/videos
  @Patch(':assetId/videos')
  updateVideo(
    @Param('projectId') projectId: string,
    @Param('assetId') assetId: string,
    @Body() body: { name?: string; externalUrl?: string },
  ) {
    return this.assetsService.updateVideo(projectId, assetId, body);
  }

  // POST /projects/:projectId/assets/files
  @Post('files')
  @UseInterceptors(FileInterceptor('file'))
  createFile(
    @Param('projectId') projectId: string,
    @Body() body: { name: string; type: 'DOCUMENT' | 'PHOTO' },
    @UploadedFile() file: MulterFile,
  ) {
    return this.assetsService.createFile(projectId, body, file);
  }

  // PATCH /projects/:projectId/assets/:assetId/files
  // Replaces the existing file on disk and updates the DB record.
  @Patch(':assetId/files')
  @UseInterceptors(FileInterceptor('file'))
  updateFile(
    @Param('projectId') projectId: string,
    @Param('assetId') assetId: string,
    @Body() body: { name?: string },
    @UploadedFile() file: MulterFile,
  ) {
    return this.assetsService.updateFile(projectId, assetId, body, file);
  }

  // DELETE /projects/:projectId/assets/:assetId
  @Delete(':assetId')
  remove(
    @Param('projectId') projectId: string,
    @Param('assetId') assetId: string,
  ) {
    return this.assetsService.remove(projectId, assetId);
  }
}