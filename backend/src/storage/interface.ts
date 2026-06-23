// Multer v2 does not ship TypeScript definitions and @types/multer targets v1.
// We define the fields we actually use rather than importing an incompatible type.
export interface MulterFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// This interface is the contract for file storage.
// Any storage backend (local disk, S3, GCS) must implement these methods.
// NestJS services depend on this interface, not on a concrete implementation,
// which is what makes swapping storage backends a one-line change.
export interface IStorageService {
  save(file: MulterFile): Promise<string>;
  delete(filePath: string): Promise<void>;
  getUrl(filePath: string): string;
}

// Token used for NestJS dependency injection.
// Because interfaces don't exist at runtime in JS, we need a string token
// to tell NestJS which implementation to inject when IStorageService is requested.
export const STORAGE_SERVICE = 'STORAGE_SERVICE';