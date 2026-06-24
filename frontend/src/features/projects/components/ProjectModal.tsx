import { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Field, ModalActions, inputClass } from '../../../shared/components/FormComponents';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '../../../types';

// ---------------------------------------------------------------------------
// ProjectFormFields
// Shared form fields used by both CreateProjectModal and EditProjectModal.
// ---------------------------------------------------------------------------
interface ProjectFormFieldsProps {
  title: string;
  status: string;
  address: string;
  bookingId: string;
  customerRef: string;
  description: string;
  onChange: (field: string, value: string) => void;
}

function ProjectFormFields({
  title,
  status,
  address,
  bookingId,
  customerRef,
  description,
  onChange,
}: ProjectFormFieldsProps) {
  return (
    <div className="space-y-3">
      <Field label="Title *">
        <input
          type="text"
          value={title}
          onChange={(e) => onChange('title', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Status *">
        <select
          value={status}
          onChange={(e) => onChange('status', e.target.value)}
          className={inputClass}
        >
          <option value="In Progress">In Progress</option>
          <option value="Complete">Complete</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </Field>

      <Field label="Address">
        <input
          type="text"
          value={address}
          onChange={(e) => onChange('address', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Booking ID">
        <input
          type="text"
          value={bookingId}
          onChange={(e) => onChange('bookingId', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Customer Ref">
        <input
          type="text"
          value={customerRef}
          onChange={(e) => onChange('customerRef', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className={inputClass}
        />
      </Field>
    </div>
  );
}

// ---------------------------------------------------------------------------
// useProjectForm
// Manages form state for both create and edit modals.
// Accepts optional initial values — empty strings for create, project values for edit.
// ---------------------------------------------------------------------------
function useProjectForm(initial?: Partial<Project>) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'In Progress');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [bookingId, setBookingId] = useState(initial?.bookingId ?? '');
  const [customerRef, setCustomerRef] = useState(initial?.customerRef ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  const fields = { title, status, address, bookingId, customerRef, description };

  function handleChange(field: string, value: string) {
    const setters: Record<string, (v: string) => void> = {
      title: setTitle,
      status: setStatus,
      address: setAddress,
      bookingId: setBookingId,
      customerRef: setCustomerRef,
      description: setDescription,
    };
    setters[field]?.(value);
  }

  function toRequest() {
    return {
      title,
      status,
      address: address || undefined,
      bookingId: bookingId || undefined,
      customerRef: customerRef || undefined,
      description: description || undefined,
    };
  }

  return { fields, handleChange, toRequest, isValid: !!title && !!status };
}

// ---------------------------------------------------------------------------
// CreateProjectModal
// ---------------------------------------------------------------------------
interface CreateProjectModalProps {
  loading: boolean;
  onSave: (data: CreateProjectRequest) => void;
  onClose: () => void;
}

export function CreateProjectModal({ loading, onSave, onClose }: CreateProjectModalProps) {
  const { fields, handleChange, toRequest, isValid } = useProjectForm();

  return (
    <Modal title="New Project" onClose={onClose}>
      <ProjectFormFields {...fields} onChange={handleChange} />
      <ModalActions
        onClose={onClose}
        onSave={() => onSave(toRequest())}
        disabled={!isValid}
        loading={loading}
        saveLabel="Create Project"
      />
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// EditProjectModal
// ---------------------------------------------------------------------------
interface EditProjectModalProps {
  project: Project;
  loading: boolean;
  onSave: (data: UpdateProjectRequest) => void;
  onClose: () => void;
}

export function EditProjectModal({ project, loading, onSave, onClose }: EditProjectModalProps) {
  const { fields, handleChange, toRequest, isValid } = useProjectForm(project);

  return (
    <Modal title="Edit Project" onClose={onClose}>
      <ProjectFormFields {...fields} onChange={handleChange} />
      <ModalActions
        onClose={onClose}
        onSave={() => onSave(toRequest())}
        disabled={!isValid}
        loading={loading}
        saveLabel="Save"
      />
    </Modal>
  );
}