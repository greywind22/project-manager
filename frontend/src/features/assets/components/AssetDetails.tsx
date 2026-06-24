import { Plus, Trash2, Pencil } from 'lucide-react';
import type { Asset } from '../../../types';
import { useState } from 'react';
import { LightboxModal } from '../../../shared/components/LightboxModal';

// ---------------------------------------------------------------------------
// AssetSection
// Reusable wrapper for each asset type section on the detail page.
// Handles the section header, + button, and empty state.
// Each caller passes children to control how individual assets are rendered.
// ---------------------------------------------------------------------------
interface AssetSectionProps {
  title: string;
  onAdd: () => void;
  children: React.ReactNode;
  isEmpty: boolean;
}

export function AssetSection({ title, onAdd, children, isEmpty }: AssetSectionProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button
          onClick={onAdd}
          className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          aria-label={`Add ${title}`}
        >
          <Plus size={18} />
        </button>
      </div>
      {isEmpty ? (
        <p className="text-sm text-gray-400">No {title.toLowerCase()} yet.</p>
      ) : (
        children
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// AssetActions
// Edit and delete buttons shown on each asset.
// Delete triggers a confirmation modal via onDelete.
// ---------------------------------------------------------------------------
interface AssetActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

function AssetActions({ onEdit, onDelete }: AssetActionsProps) {
  return (
    <div className="flex gap-1">
      <button
        onClick={onEdit}
        className="p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        aria-label="Edit"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={onDelete}
        className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
        aria-label="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LinksList
// Renders link assets as a vertical list of clickable URLs.
// ---------------------------------------------------------------------------
interface LinksListProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export function LinksList({ assets, onEdit, onDelete }: LinksListProps) {
  return (
    <div className="space-y-2">
      {assets.map((asset) => (
        <div key={asset.id} className="flex items-center justify-between gap-2">
          <a
            href={asset.assetLink?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {asset.assetLink?.label || asset.assetLink?.url}
          </a>
          <AssetActions onEdit={() => onEdit(asset)} onDelete={() => onDelete(asset)} />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AssetsGrid
// Shared grid layout for DOCUMENT and PHOTO assets.
// Documents show a thumbnail or a filename fallback.
// Photos show the image thumbnail directly.
// ---------------------------------------------------------------------------
interface AssetsGridProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export function AssetsGrid({ assets, onEdit, onDelete }: AssetsGridProps) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  function handleClick(asset: Asset) {
    if (asset.type === 'PHOTO' && asset.thumbnailUrl) {
      // Photos open in lightbox
      setLightbox({ src: asset.thumbnailUrl, alt: asset.name });
    } else if (asset.type === 'DOCUMENT' && asset.assetFile) {
      // Documents open in new tab
      // SHORTCUT: Lightbox not supported for documents — would require
      // an iframe for PDFs and varies by file type. Opening in new tab instead.
      window.open(`/uploads/${asset.assetFile.filePath}`, '_blank');
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {assets.map((asset) => (
          <div key={asset.id} className="relative group">
            <div
              className="w-24 h-24 bg-gray-100 rounded overflow-hidden cursor-pointer"
              onClick={() => handleClick(asset)}
              title={asset.name}
            >
              {asset.thumbnailUrl ? (
                <img
                  src={asset.thumbnailUrl}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 p-1 text-center">
                  {asset.name}
                </div>
              )}
            </div>
            <div className="absolute top-0 right-0 hidden group-hover:flex bg-white rounded-bl shadow-sm">
              <AssetActions onEdit={() => onEdit(asset)} onDelete={() => onDelete(asset)} />
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <LightboxModal
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
// ---------------------------------------------------------------------------
// VideosList
// Renders video assets. YouTube videos show a thumbnail.
// Other platforms show the URL as a link.
// ---------------------------------------------------------------------------
interface VideosListProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export function VideosList({ assets, onEdit, onDelete }: VideosListProps) {
  return (
    <div className="space-y-3">
      {assets.map((asset) => (
        <div key={asset.id} className="relative group" title={asset.name}>
          <div className="w-full max-w-sm aspect-video bg-gray-200 rounded overflow-hidden">
            {asset.thumbnailUrl ? (
              <a
                href={asset.assetVideo?.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={asset.thumbnailUrl}
                  alt={asset.name}
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                />
              </a>
            ) : (
              <a
                href={asset.assetVideo?.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-full text-sm text-blue-600 hover:underline p-4"
              >
                {asset.assetVideo?.externalUrl}
              </a>
            )}
          </div>
          <div className="absolute top-1 right-1 hidden group-hover:flex bg-white rounded shadow-sm">
            <AssetActions onEdit={() => onEdit(asset)} onDelete={() => onDelete(asset)} />
          </div>
        </div>
      ))}
    </div>
  );
}