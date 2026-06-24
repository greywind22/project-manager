import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useProjectMutations } from '../hooks/useProject';
import { useAssets } from '../../assets/hooks/useAssets';
import { ProjectHeader, ProjectDescription, CustomFieldsList } from '../components/ProjectDetails';
import { AssetSection, LinksList, AssetsGrid, VideosList } from '../../assets/components/AssetDetails';
import { AddLinkModal, EditLinkModal } from '../../assets/components/LinkAssetModal';
import { AddFileModal, EditFileModal } from '../../assets/components/FileAssetModal';
import { AddVideoModal, EditVideoModal } from '../../assets/components/VideoAssetModal';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import type { ToastType } from '../../../shared/components/Toast';
import type { Asset } from '../../../types';
import { EditProjectModal } from '../components/ProjectModal';

interface Props {
  addToast: (message: string, type?: ToastType) => void;
}

// Modal state — which modal is open and for which asset
type ModalState =
  | { type: 'none' }
  | { type: 'editProject' }
  | { type: 'deleteProject' }
  | { type: 'addLink' }
  | { type: 'editLink'; asset: Asset }
  | { type: 'deleteAsset'; asset: Asset }
  | { type: 'addDocument' }
  | { type: 'editDocument'; asset: Asset }
  | { type: 'addPhoto' }
  | { type: 'editPhoto'; asset: Asset }
  | { type: 'addVideo' }
  | { type: 'editVideo'; asset: Asset };

export default function ProjectDetailPage({ addToast }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalState>({ type: 'none' });

  const { project, loading, error, refetch } = useProject(id!);
  const { loading: mutationLoading, updateProject, removeProject } = useProjectMutations({ onSuccess: refetch });
  const { loading: assetLoading, addLink, updateLink, addFile, updateFile, addVideo, updateVideo, removeAsset } =
    useAssets({ projectId: id!, onSuccess: refetch });

  // Helper — makes call, shows toast on error, closes modal on success
  async function executeWithFeedback(fn: () => Promise<string | null>) {
    const err = await fn();
    if (err) {
      addToast(err, 'error');
    } else {
      setModal({ type: 'none' });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 text-red-600 text-sm">Failed to load project.</div>
    );
  }

  // Group assets by type
  const links = project.assets.filter((a) => a.type === 'LINK');
  const documents = project.assets.filter((a) => a.type === 'DOCUMENT');
  const photos = project.assets.filter((a) => a.type === 'PHOTO');
  const videos = project.assets.filter((a) => a.type === 'VIDEO');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <ProjectHeader
        project={project}
        onEdit={() => setModal({ type: 'editProject' })}
        onDelete={() => setModal({ type: 'deleteProject' })}
      />

      <ProjectDescription description={project.description} />

      <AssetSection
        title="Links"
        onAdd={() => setModal({ type: 'addLink' })}
        isEmpty={links.length === 0}
      >
        <LinksList
          assets={links}
          onEdit={(asset) => setModal({ type: 'editLink', asset })}
          onDelete={(asset) => setModal({ type: 'deleteAsset', asset })}
        />
      </AssetSection>

      <AssetSection
        title="Documents"
        onAdd={() => setModal({ type: 'addDocument' })}
        isEmpty={documents.length === 0}
      >
        <AssetsGrid
          assets={documents}
          onEdit={(asset) => setModal({ type: 'editDocument', asset })}
          onDelete={(asset) => setModal({ type: 'deleteAsset', asset })}
        />
      </AssetSection>

      <AssetSection
        title="Photos"
        onAdd={() => setModal({ type: 'addPhoto' })}
        isEmpty={photos.length === 0}
      >
        <AssetsGrid
          assets={photos}
          onEdit={(asset) => setModal({ type: 'editPhoto', asset })}
          onDelete={(asset) => setModal({ type: 'deleteAsset', asset })}
        />
      </AssetSection>

      <AssetSection
        title="Videos"
        onAdd={() => setModal({ type: 'addVideo' })}
        isEmpty={videos.length === 0}
      >
        <VideosList
          assets={videos}
          onEdit={(asset) => setModal({ type: 'editVideo', asset })}
          onDelete={(asset) => setModal({ type: 'deleteAsset', asset })}
        />
      </AssetSection>

      <CustomFieldsList fields={project.customFields} />

      {/* ------------------------------------------------------------------ */}
      {/* Modals                                                               */}
      {/* ------------------------------------------------------------------ */}

      {modal.type === 'editProject' && (
        <EditProjectModal
          project={project}
          loading={mutationLoading}
          onSave={(data) => executeWithFeedback(() => updateProject(id!, data))}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'deleteProject' && (
        <ConfirmModal
          title="Delete Project"
          message={`Are you sure you want to delete "${project.title}"? This will also delete all its assets.`}
          loading={mutationLoading}
          onConfirm={() =>
            executeWithFeedback(async () => {
              const err = await removeProject(id!);
              if (!err) navigate('/projects');
              return err;
            })
          }
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'addLink' && (
        <AddLinkModal
          loading={assetLoading}
          onSave={(data) => executeWithFeedback(() => addLink(data))}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'editLink' && (
        <EditLinkModal
          asset={modal.asset}
          loading={assetLoading}
          onSave={(data) => executeWithFeedback(() => updateLink(modal.asset.id, data))}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'deleteAsset' && (
        <ConfirmModal
          title="Delete Asset"
          message={`Are you sure you want to delete "${modal.asset.name}"?`}
          loading={assetLoading}
          onConfirm={() => executeWithFeedback(() => removeAsset(modal.asset.id))}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'addDocument' && (
        <AddFileModal
          type="DOCUMENT"
          loading={assetLoading}
          onSave={(data) => executeWithFeedback(() => addFile(data))}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'editDocument' && (
        <EditFileModal
          asset={modal.asset}
          loading={assetLoading}
          onSave={(data) => executeWithFeedback(() => updateFile(modal.asset.id, data))}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'addPhoto' && (
        <AddFileModal
          type="PHOTO"
          loading={assetLoading}
          onSave={(data) => executeWithFeedback(() => addFile(data))}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'editPhoto' && (
        <EditFileModal
          asset={modal.asset}
          loading={assetLoading}
          onSave={(data) => executeWithFeedback(() => updateFile(modal.asset.id, data))}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'addVideo' && (
        <AddVideoModal
          loading={assetLoading}
          onSave={(data) => executeWithFeedback(() => addVideo(data))}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'editVideo' && (
        <EditVideoModal
          asset={modal.asset}
          loading={assetLoading}
          onSave={(data) => executeWithFeedback(() => updateVideo(modal.asset.id, data))}
          onClose={() => setModal({ type: 'none' })}
        />
      )}
    </div>
  );
}