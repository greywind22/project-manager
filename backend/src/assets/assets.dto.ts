import { AssetType, VideoPlatform } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';

// Used when creating a LINK asset
export class CreateLinkAssetDto {
  @IsEnum(AssetType)
  type: 'LINK';

  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  label?: string;
}

// Used when creating a VIDEO asset
export class CreateVideoAssetDto {
  @IsEnum(AssetType)
  type: 'VIDEO';

  @IsString()
  name: string;

  @IsUrl()
  externalUrl: string;

  @IsOptional()
  @IsEnum(VideoPlatform)
  platform?: VideoPlatform;
}

// FILE assets (DOCUMENT, PHOTO) come in via multipart/form-data.
// The file itself is handled by Multer middleware, not by this DTO.
// This DTO covers the non-file fields sent alongside the file.
export class CreateFileAssetDto {
  @IsEnum(AssetType)
  type: 'DOCUMENT' | 'PHOTO';

  @IsString()
  name: string;
}