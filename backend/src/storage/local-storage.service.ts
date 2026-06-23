import { Injectable } from '@nestjs/common';
import { IStorageService, MulterFile } from './storage.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

// SHORTCUT: Files are stored on local disk.
// TO SWAP TO S3: Create an S3StorageService implementing IStorageService,
// inject it in StorageModule instead. Nothing else changes.
@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly uploadDir = process.env.UPLOAD_DIR ?? './uploads';

  async save(file: MulterFile): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    // Prefix with timestamp to guarantee uniqueness and avoid collisions.
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, filename);

    await fs.writeFile(filePath, file.buffer);

    // Return just the filename — this is what we store in the DB.
    return filename;
  }

  async delete(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);
    // Ignore "file not found" errors to make delete idempotent (safe to call twice).
    await fs.unlink(filePath).catch((err) => {
      if (err.code !== 'ENOENT') throw err;
    });
  }

  getUrl(filename: string): string {
    // Returns a URL the frontend can use to fetch the file.
    // The backend serves /uploads/* as static files (configured in main.ts).
    return `/uploads/${filename}`;
  }
}