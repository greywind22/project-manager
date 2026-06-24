
// Shared input styling
export const inputClass =
  'mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400';

// Small label wrapper
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-gray-700 font-medium">{label}</span>
      {children}
    </label>
  );
}

// Shared modal action buttons
export function ModalActions({
  onClose,
  onSave,
  disabled,
  loading,
  saveLabel = 'Save',
}: {
  onClose: () => void;
  onSave: () => void;
  disabled: boolean;
  loading: boolean;
  saveLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={disabled || loading}
        className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-700 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Saving…' : saveLabel}
      </button>
    </div>
  );
}