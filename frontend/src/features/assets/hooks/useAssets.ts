import { useState } from 'react';
import { assetsApi } from '../../../types/api';
import type {
  CreateLinkAssetRequest,
  UpdateLinkAssetRequest,
  CreateFileAssetRequest,
  UpdateFileAssetRequest,
  CreateVideoAssetRequest,
  UpdateVideoAssetRequest,
} from '../../../types';

// useAssets provides mutation functions for asset CRUD.
// It does not manage fetching — that's handled by useProject which
// fetches the full project (including assets) and exposes refetch().
//
// Each mutation function:
// 1. Sets loading state
// 2. Calls the API
// 3. On success: calls onSuccess() which triggers a refetch in the parent
// 4. On error: returns the error message for the caller to display via toast

interface UseAssetsOptions {
  projectId: string;
  // Called after a successful mutation so the parent can refetch the project
  onSuccess: () => void;
}

export function useAssets({ projectId, onSuccess }: UseAssetsOptions) {
  const [loading, setLoading] = useState(false);

  // Generic mutation wrapper — handles loading state and calls onSuccess
  async function mutate<T>(fn: () => Promise<T>): Promise<string | null> {
    setLoading(true);
    try {
      await fn();
      onSuccess();
      return null; // null means no error
    } catch (err) {
      return (err as Error).message;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,

    addLink: (data: CreateLinkAssetRequest) =>
      mutate(() => assetsApi.createLink(projectId, data)),

    updateLink: (assetId: string, data: UpdateLinkAssetRequest) =>
      mutate(() => assetsApi.updateLink(projectId, assetId, data)),

    addFile: (data: CreateFileAssetRequest) =>
      mutate(() => assetsApi.createFile(projectId, data)),

    updateFile: (assetId: string, data: UpdateFileAssetRequest) =>
      mutate(() => assetsApi.updateFile(projectId, assetId, data)),

    addVideo: (data: CreateVideoAssetRequest) =>
      mutate(() => assetsApi.createVideo(projectId, data)),

    updateVideo: (assetId: string, data: UpdateVideoAssetRequest) =>
      mutate(() => assetsApi.updateVideo(projectId, assetId, data)),

    removeAsset: (assetId: string) =>
      mutate(() => assetsApi.remove(projectId, assetId)),
  };
}