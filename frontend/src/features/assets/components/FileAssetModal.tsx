import { useState, useRef } from 'react';
import { Modal } from '../../../shared/components/Modal';
import type {
  Asset,
  CreateFileAssetRequest,
  UpdateFileAssetRequest,
} from '../../../types';
import { Field, inputClass, ModalActions } from '../../../shared/components/FormComponents';

// ---------------------------------------------------------------------------
// AddFileModal
// Handles both DOCUMENT and PHOTO uploads.
// ASSUMPTION: The distinction is user-driven — the user picks which section
// they upload into, which sets the type.
// ---------------------------------------------------------------------------
const ACCEPTED: Record<'DOCUMENT' | 'PHOTO', string> = {
  PHOTO: 'image/png,image/jpeg,image/jpg',
  DOCUMENT:
    'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg',
};

interface AddFileModalProps {
  type: 'DOCUMENT' | 'PHOTO';
  loading: boolean;
  onSave: (data: CreateFileAssetRequest) => void;
  onClose: () => void;
}

export function AddFileModal({ type, loading, onSave, onClose }: AddFileModalProps) {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!name) setName(selected.name.replace(/\.[^/.]+$/, ''));
    }
  }

  return (
    <Modal title={`Add ${type === 'PHOTO' ? 'Photo' : 'Document'}`} onClose={onClose}>
      <div className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED[type]}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-sm text-gray-500 hover:border-gray-400 transition-colors text-center cursor-pointer"
        >
          {file ? file.name : 'Click to select a file'}
        </button>
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="File name"
            className={inputClass}
          />
        </Field>
        <ModalActions
          onClose={onClose}
          onSave={() => file && onSave({ name: name || file.name, type, file })}
          disabled={!file}
          loading={loading}
          saveLabel="Upload"
        />
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// EditFileModal
// Replaces the existing file. Name is optional — keeps existing if not changed.
// ---------------------------------------------------------------------------
interface EditFileModalProps {
  asset: Asset;
  loading: boolean;
  onSave: (data: UpdateFileAssetRequest) => void;
  onClose: () => void;
}

export function EditFileModal({ asset, loading, onSave, onClose }: EditFileModalProps) {
  const [name, setName] = useState(asset.name);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Modal title="Replace File" onClose={onClose}>
      <div className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-sm text-gray-500 hover:border-gray-400 transition-colors text-center"
        >
          {file ? file.name : 'Click to select a replacement file'}
        </button>
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
          onSave={() => file && onSave({ name, file })}
          disabled={!file}
          loading={loading}
          saveLabel="Replace"
        />
      </div>
    </Modal>
  );
}