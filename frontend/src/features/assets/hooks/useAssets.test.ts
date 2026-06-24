import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, type Mocked } from 'vitest';
import { useAssets } from './useAssets';
import { assetsApi } from '../../../types/api';
import type { Asset } from '../../../types';

vi.mock('../../../types/api', () => ({
  assetsApi: {
    createLink: vi.fn(),
    updateLink: vi.fn(),
    createFile: vi.fn(),
    updateFile: vi.fn(),
    createVideo: vi.fn(),
    updateVideo: vi.fn(),
    remove: vi.fn(),
  },
}));

const mockApi = assetsApi as Mocked<typeof assetsApi>;

const PROJECT_ID = 'project-1';
const ASSET_ID = 'asset-1';

const mockAsset: Asset = {
  id: ASSET_ID,
  projectId: PROJECT_ID,
  type: 'LINK',
  name: 'Test Asset',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('useAssets', () => {
  beforeEach(() => vi.clearAllMocks());

  it('addLink calls API with correct params and triggers onSuccess', async () => {
    mockApi.createLink.mockResolvedValue(mockAsset);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useAssets({ projectId: PROJECT_ID, onSuccess }));

    await result.current.addLink({ name: 'Test', url: 'https://example.com' });

    await waitFor(() => {
      expect(mockApi.createLink).toHaveBeenCalledWith(PROJECT_ID, {
        name: 'Test',
        url: 'https://example.com',
      });
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('updateLink calls API with correct params', async () => {
    mockApi.updateLink.mockResolvedValue(mockAsset);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useAssets({ projectId: PROJECT_ID, onSuccess }));

    await result.current.updateLink(ASSET_ID, { url: 'https://new.com', label: null });

    await waitFor(() => {
      expect(mockApi.updateLink).toHaveBeenCalledWith(PROJECT_ID, ASSET_ID, {
        url: 'https://new.com',
        label: null,
      });
    });
  });

  it('removeAsset calls API with correct params', async () => {
    mockApi.remove.mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useAssets({ projectId: PROJECT_ID, onSuccess }));

    await result.current.removeAsset(ASSET_ID);

    await waitFor(() => {
      expect(mockApi.remove).toHaveBeenCalledWith(PROJECT_ID, ASSET_ID);
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('addVideo calls API with correct params', async () => {
    mockApi.createVideo.mockResolvedValue(mockAsset);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useAssets({ projectId: PROJECT_ID, onSuccess }));

    await result.current.addVideo({
      name: 'Test Video',
      externalUrl: 'https://youtube.com/watch?v=123',
    });

    await waitFor(() => {
      expect(mockApi.createVideo).toHaveBeenCalledWith(PROJECT_ID, {
        name: 'Test Video',
        externalUrl: 'https://youtube.com/watch?v=123',
      });
    });
  });

  it('returns error message when mutation fails', async () => {
    mockApi.createLink.mockRejectedValue(new Error('Upload failed'));
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useAssets({ projectId: PROJECT_ID, onSuccess }));

    const error = await result.current.addLink({ name: 'Test', url: 'https://example.com' });

    expect(error).toBe('Upload failed');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('sets loading to true during mutation and false after', async () => {
    let resolve!: (value: Asset) => void;
    mockApi.createLink.mockReturnValue(new Promise<Asset>((r) => { resolve = r; }));
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useAssets({ projectId: PROJECT_ID, onSuccess }));

    result.current.addLink({ name: 'Test', url: 'https://example.com' });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    resolve!(mockAsset);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});