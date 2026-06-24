// ---------------------------------------------------------------------------
// Modal
// Shared modal shell used by all modals in the app.
// Clicking the backdrop closes the modal.
// ---------------------------------------------------------------------------
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* stopPropagation prevents clicks inside the modal from closing it */}
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}