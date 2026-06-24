import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useProjectMutations } from '../hooks/useProject';
import type { ToastType } from '../../../shared/components/Toast';
import type { ProjectSummary } from '../../../types';
import { CreateProjectModal } from '../components/ProjectModal';

interface Props {
  addToast: (message: string, type?: ToastType) => void;
}

export default function ProjectsListPage({ addToast }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const { projects, loading, error, refetch } = useProjects();
  const { loading: mutationLoading, createProject } = useProjectMutations({
    onSuccess: refetch,
  });

  if (error) addToast(error, 'error');

  async function handleCreate(data: Parameters<typeof createProject>[0]) {
    const err = await createProject(data);
    if (err) {
      addToast(err, 'error');
    } else {
      setShowCreate(false);
      refetch();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading projects…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          No projects yet. Create one to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          loading={mutationLoading}
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">{project.title}</h2>
          {project.address && (
            <p className="text-sm text-gray-500 mt-0.5">{project.address}</p>
          )}
        </div>
        <StatusBadge status={project.status} />
      </div>
      <div className="flex gap-4 mt-3 text-sm text-gray-500">
        {project.bookingId && <span>Booking: {project.bookingId}</span>}
        {project.bookedDate && (
          <span>{new Date(project.bookedDate).toLocaleDateString()}</span>
        )}
        <span>{project._count.assets} assets</span>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colours: Record<string, string> = {
    'In Progress': 'bg-blue-100 text-blue-800',
    'Complete': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
  };
  const cls = colours[status] ?? 'bg-gray-100 text-gray-800';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {status}
    </span>
  );
}