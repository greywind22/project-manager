import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '../../../types/api';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '../../../types';

// useProject fetches a single project by id, including all its assets
// and custom fields.
// refetch() is exposed so mutations (add/delete asset) can trigger a re-fetch
// to keep the UI in sync with the server.
export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // refetch is wrapped in useCallback so its reference stays stable.
  // This means we can safely pass it as a dependency to useEffect without
  // causing infinite re-renders.
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);

    projectsApi
      .get(id)
      .then((data) => {
        setProject(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]); // Re-create if id changes

  useEffect(() => {
    refetch();
  }, [refetch]);

  // refetch is for callers that want to trigger a re-fetch after a mutation.
  return { project, loading, error, refetch };
}

interface UseProjectMutationsOptions {
  // Called after a successful mutation so the parent can refetch or redirect
  onSuccess: () => void;
}

export function useProjectMutations({ onSuccess }: UseProjectMutationsOptions) {
  const [loading, setLoading] = useState(false);

  // Generic wrapper — handles loading state and calls onSuccess
  async function run<T>(fn: () => Promise<T>): Promise<string | null> {
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

    createProject: (data: CreateProjectRequest) =>
      run(() => projectsApi.create(data)),

    updateProject: (id: string, data: UpdateProjectRequest) =>
      run(() => projectsApi.update(id, data)),

    removeProject: (id: string) =>
      run(() => projectsApi.remove(id)),
  };
}