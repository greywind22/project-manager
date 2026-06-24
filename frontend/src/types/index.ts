// These types mirror the Prisma schema.
// SHORTCUT: Manually maintained — see DECISIONS.md for why and the alternative approach.

export type AssetType = 'LINK' | 'DOCUMENT' | 'PHOTO' | 'VIDEO';
export type CustomFieldType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE';
export type VideoPlatform = 'YOUTUBE' | 'VIMEO' | 'OTHER';

// ---------------------------------------------------------------------------
// Response types — shape of data returned by the API
// ---------------------------------------------------------------------------
export interface AssetLink {
  id: string;
  assetId: string;
  url: string;
  label?: string;
}

export interface AssetFile {
  id: string;
  assetId: string;
  filePath: string;
  mimeType: string;
  sizeBytes?: number;
}

export interface AssetVideo {
  id: string;
  assetId: string;
  externalUrl: string;
  platform: VideoPlatform;
}

export interface Asset {
  id: string;
  projectId: string;
  type: AssetType;
  name: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  assetLink?: AssetLink;
  assetFile?: AssetFile;
  assetVideo?: AssetVideo;
}

export interface CustomField {
  id: string;
  projectId: string;
  key: string;
  value: unknown;
  valueType: CustomFieldType;
}

export interface Project {
  id: string;
  title: string;
  status: string;
  bookedDate?: string;
  bookingId?: string;
  customerRef?: string;
  address?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  assets: Asset[];
  customFields: CustomField[];
}

export interface ProjectSummary {
  id: string;
  title: string;
  status: string;
  bookedDate?: string;
  bookingId?: string;
  customerRef?: string;
  address?: string;
  createdAt: string;
  _count: { assets: number };
}

// ---------------------------------------------------------------------------
// Request types — shape of data sent to the API
// ---------------------------------------------------------------------------
export interface CreateProjectRequest {
  title: string;
  status: string;
  bookedDate?: string;
  bookingId?: string;
  customerRef?: string;
  address?: string;
  description?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  status?: string;
  bookedDate?: string;
  bookingId?: string;
  customerRef?: string;
  address?: string;
  description?: string;
}

export interface CreateLinkAssetRequest {
  name: string;
  url: string;
  label?: string;
}

export interface UpdateLinkAssetRequest {
  name?: string;
  url?: string;
  label?: string;
}

export interface CreateFileAssetRequest {
  name: string;
  type: 'DOCUMENT' | 'PHOTO';
  file: File;
}

export interface UpdateFileAssetRequest {
  name?: string;
  file: File;
}

export interface CreateVideoAssetRequest {
  name: string;
  externalUrl: string;
}

export interface UpdateVideoAssetRequest {
  name?: string;
  externalUrl?: string;
}