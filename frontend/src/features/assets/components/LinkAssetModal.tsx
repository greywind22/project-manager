import { useState } from 'react';
import type {
  Asset,
  CreateLinkAssetRequest,
  UpdateLinkAssetRequest,
} from '../../../types';
import { Field, inputClass, ModalActions } from '../../../shared/components/FormComponents';
import { Modal } from '../../../shared/components/Modal';

// ---------------------------------------------------------------------------
// AddLinkModal
// ---------------------------------------------------------------------------
interface AddLinkModalProps {
  loading: boolean;
  onSave: (data: CreateLinkAssetRequest) => void;
  onClose: () => void;
}

export function AddLinkModal({ loading, onSave, onClose }: AddLinkModalProps) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');

  return (
    <Modal title="Add Link" onClose={onClose}>
      <div className="space-y-3">
        <Field label="URL *">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className={inputClass}
          />
        </Field>
        <Field label="Label (optional)">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Friendly name"
            className={inputClass}
          />
        </Field>
        <ModalActions
          onClose={onClose}
          onSave={() => onSave({ name: label || url, url, label: label || undefined })}
          disabled={!url}
          loading={loading}
          saveLabel="Add Link"
        />
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// EditLinkModal
// ---------------------------------------------------------------------------
interface EditLinkModalProps {
  asset: Asset;
  loading: boolean;
  onSave: (data: UpdateLinkAssetRequest) => void;
  onClose: () => void;
}

export function EditLinkModal({ asset, loading, onSave, onClose }: EditLinkModalProps) {
  const [url, setUrl] = useState(asset.assetLink?.url ?? '');
  const [label, setLabel] = useState(asset.assetLink?.label ?? '');

  return (
    <Modal title="Edit Link" onClose={onClose}>
      <div className="space-y-3">
        <Field label="URL *">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Label (optional)">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={inputClass}
          />
        </Field>
        <ModalActions
          onClose={onClose}
          onSave={() => onSave({ url, label: label || null })}
          disabled={!url}
          loading={loading}
        />
      </div>
    </Modal>
  );
}