import { useState } from "react";
import type { Asset, CreateVideoAssetRequest, UpdateVideoAssetRequest } from "../../../types";
import { Modal } from "../../../shared/components/Modal";
import { Field, inputClass, ModalActions } from "../../../shared/components/FormComponents";

// ---------------------------------------------------------------------------
// AddVideoModal
// ---------------------------------------------------------------------------
interface AddVideoModalProps {
  loading: boolean;
  onSave: (data: CreateVideoAssetRequest) => void;
  onClose: () => void;
}

export function AddVideoModal({ loading, onSave, onClose }: AddVideoModalProps) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  return (
    <Modal title="Add Video" onClose={onClose}>
      <div className="space-y-3">
        <Field label="YouTube or Vimeo URL *">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className={inputClass}
          />
        </Field>
        <Field label="Name (optional)">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Video title"
            className={inputClass}
          />
        </Field>
        <ModalActions
          onClose={onClose}
          onSave={() => onSave({ name: name || url, externalUrl: url })}
          disabled={!url}
          loading={loading}
          saveLabel="Add Video"
        />
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// EditVideoModal
// ---------------------------------------------------------------------------
interface EditVideoModalProps {
  asset: Asset;
  loading: boolean;
  onSave: (data: UpdateVideoAssetRequest) => void;
  onClose: () => void;
}

export function EditVideoModal({ asset, loading, onSave, onClose }: EditVideoModalProps) {
  const [url, setUrl] = useState(asset.assetVideo?.externalUrl ?? '');
  const [name, setName] = useState(asset.name);

  return (
    <Modal title="Edit Video" onClose={onClose}>
      <div className="space-y-3">
        <Field label="URL *">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <ModalActions
          onClose={onClose}
          onSave={() => onSave({ name, externalUrl: url })}
          disabled={!url}
          loading={loading}
        />
      </div>
    </Modal>
  );
}