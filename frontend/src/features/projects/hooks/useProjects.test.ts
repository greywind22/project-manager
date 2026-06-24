import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, type Mocked } from 'vitest';
import { useProjects } from './useProjects';
import { projectsApi } from '../../../types/api';

vi.mock('../../../types/api', () => ({
  projectsApi: {
    list: vi.fn(),
  },
}));

// Mocked<T> replaces all methods with vi.fn() types — no unsafe casting needed
const mockProjectsApi = projectsApi as Mocked<typeof projectsApi>;

const mockProjects = [
  {
    id: '1',
    title: 'Test Project',
    status: 'In Progress',
    address: '1 Test St',
    createdAt: new Date().toISOString(),
    _count: { assets: 0 },
  },
];

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in a loading state', () => {
    mockProjectsApi.list.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useProjects());

    expect(result.current.loading).toBe(true);
    expect(result.current.projects).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('populates projects on successful fetch', async () => {
    mockProjectsApi.list.mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.projects).toEqual(mockProjects);
    expect(result.current.error).toBeNull();
  });

  it('sets error message on failed fetch', async () => {
    mockProjectsApi.list.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.projects).toEqual([]);
  });

  it('refetch calls the API again and updates projects', async () => {
    mockProjectsApi.list.mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updatedProjects = [...mockProjects, { ...mockProjects[0], id: '2', title: 'Second Project' }];
    mockProjectsApi.list.mockResolvedValue(updatedProjects);

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.projects).toHaveLength(2);
    });

    expect(mockProjectsApi.list).toHaveBeenCalledTimes(2);
  });
});