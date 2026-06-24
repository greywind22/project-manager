import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, type Mocked } from 'vitest';
import { useProject, useProjectMutations } from './useProject';
import { projectsApi } from '../../../types/api';

vi.mock('../../../types/api', () => ({
  projectsApi: {
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const mockApi = projectsApi as Mocked<typeof projectsApi>;

const mockProject = {
  id: '1',
  title: 'Test Project',
  status: 'In Progress',
  address: '1 Test St',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  assets: [],
  customFields: [],
};

describe('useProject', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches project by id on mount', async () => {
    mockApi.get.mockResolvedValue(mockProject);

    const { result } = renderHook(() => useProject('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi.get).toHaveBeenCalledWith('1');
    expect(result.current.project).toEqual(mockProject);
  });

  it('sets error on failed fetch', async () => {
    mockApi.get.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useProject('1'));

    await waitFor(() => {
      expect(result.current.error).toBe('Not found');
    });

    expect(result.current.project).toBeNull();
  });

  it('refetch re-calls the API', async () => {
    mockApi.get.mockResolvedValue(mockProject);

    const { result } = renderHook(() => useProject('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.refetch();

    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledTimes(2);
    });
  });
});

describe('useProjectMutations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('createProject calls api with correct data', async () => {
    mockApi.create.mockResolvedValue(mockProject);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useProjectMutations({ onSuccess }));

    await result.current.createProject({ title: 'New', status: 'In Progress' });

    await waitFor(() => {
      expect(mockApi.create).toHaveBeenCalledWith({ title: 'New', status: 'In Progress' });
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('updateProject calls api with correct id and data', async () => {
    mockApi.update.mockResolvedValue(mockProject);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useProjectMutations({ onSuccess }));

    await result.current.updateProject('1', { status: 'Complete' });

    await waitFor(() => {
      expect(mockApi.update).toHaveBeenCalledWith('1', { status: 'Complete' });
    });
  });

  it('removeProject calls api with correct id', async () => {
    mockApi.remove.mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useProjectMutations({ onSuccess }));

    await result.current.removeProject('1');

    await waitFor(() => {
      expect(mockApi.remove).toHaveBeenCalledWith('1');
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('returns error message when mutation fails', async () => {
    mockApi.create.mockRejectedValue(new Error('Server error'));
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useProjectMutations({ onSuccess }));

    const error = await result.current.createProject({ title: 'New', status: 'In Progress' });

    expect(error).toBe('Server error');
    expect(onSuccess).not.toHaveBeenCalled();
  });
});