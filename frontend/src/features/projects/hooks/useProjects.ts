import { useState, useEffect } from 'react';
import type { ProjectSummary } from '../../../types/index';
import { projectsApi } from '../../../types/api';

// useProjects fetches the list of all projects.
// Returns data, loading state, and error message.
// Re-fetches when the component mounts.
export function useProjects() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Track if the component is still mounted.
    // If it unmounts before the fetch completes, we don't update state
    // to avoid the "can't perform state update on unmounted component" warning.
    let cancelled = false;

    setLoading(true);
    setError(null);

    projectsApi
      .list()
      .then((data) => {
        if (!cancelled) {
          setProjects(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    // Cleanup function — runs when the component unmounts
    return () => {
      cancelled = true;
    };
  }, []); // Empty array means this runs once on mount

  return { projects, loading, error };
}