import { Module } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';
import { STORAGE_SERVICE } from './storage.interface';

@Module({
  providers: [
    {
      // When something asks for STORAGE_SERVICE token via injection,
      // NestJS will provide LocalStorageService.
      // To switch to S3: replace LocalStorageService with S3StorageService here.
      provide: STORAGE_SERVICE,
      useClass: LocalStorageService,
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}