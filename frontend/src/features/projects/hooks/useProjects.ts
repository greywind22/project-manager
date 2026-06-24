import { useState, useEffect, useCallback } from 'react';
import type { ProjectSummary } from '../../../types/index';
import { projectsApi } from '../../../types/api';

// useProjects fetches the list of all projects.
// Returns data, loading state, and error message.
// Re-fetches when the component mounts.
export function useProjects() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);

    projectsApi
      .list()
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { projects, loading, error, refetch };
}