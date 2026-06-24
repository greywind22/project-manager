import type { Project, CustomField } from '../../../types';

// ---------------------------------------------------------------------------
// ProjectHeader
// Displays the project title, status badge, and key metadata fields.
// ---------------------------------------------------------------------------
interface ProjectHeaderProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectHeader({ project, onEdit, onDelete }: ProjectHeaderProps) {
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{project.title}</h1>
          {project.address && (
            <p className="text-gray-500 mt-1 text-sm">{project.address}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-sm px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-sm px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Key metadata fields in a row — matches the mockup layout */}
      <div className="grid grid-cols-4 gap-4 mt-6 pb-6 border-b border-gray-200">
        <MetaField label="Status" value={project.status} />
        <MetaField
          label="Booked Date"
          value={
            project.bookedDate
              ? new Date(project.bookedDate).toLocaleDateString('en-AU', {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit',
                })
              : '—'
          }
        />
        <MetaField label="Booking ID" value={project.bookingId ?? '—'} />
        <MetaField label="Customer Ref" value={project.customerRef ?? '—'} />
      </div>
    </div>
  );
}

// Small helper — a labelled field used in the metadata row
function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProjectDescription
// Only renders if the project has a description.
// ---------------------------------------------------------------------------
interface ProjectDescriptionProps {
  description?: string;
}

export function ProjectDescription({ description }: ProjectDescriptionProps) {
  if (!description) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CustomFieldsList
// Renders the key/value custom fields attached to a project.
// SHORTCUT: Fields are seeded, not user-created. Read-only display only.
// ---------------------------------------------------------------------------
interface CustomFieldsListProps {
  fields: CustomField[];
}

export function CustomFieldsList({ fields }: CustomFieldsListProps) {
  if (fields.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Custom Fields</h2>
      <dl className="space-y-2">
        {fields.map((field) => (
          <div key={field.id} className="flex gap-4 text-sm">
            <dt className="font-semibold text-gray-700 w-32 shrink-0">{field.key}</dt>
            <dd className="text-gray-600">{formatValue(field.value, field.valueType)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function formatValue(value: unknown, type: string): string {
  if (type === 'BOOLEAN') return value ? 'Yes' : 'No';
  if (type === 'DATE' && typeof value === 'string')
    return new Date(value).toLocaleDateString();
  return String(value ?? '—');
}