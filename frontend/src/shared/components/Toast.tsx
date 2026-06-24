import { useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ToastType = 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// ---------------------------------------------------------------------------
// useToast hook
// Manages a list of toasts. Returns the current toasts and a function to
// add a new one. Each toast auto-dismisses after 3 seconds.
// ---------------------------------------------------------------------------
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'error') => {
    // Date.now() gives us a unique enough ID for this use case
    const id = Date.now();

    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, addToast };
}

// ---------------------------------------------------------------------------
// ToastContainer component
// Renders all active toasts in a fixed position at the top-right of the screen.
// ---------------------------------------------------------------------------
interface ToastContainerProps {
  toasts: Toast[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    // Fixed position so toasts float above all other content
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const colours = {
    error: 'bg-red-600 text-white',
    success: 'bg-gray-900 text-white',
  };

  return (
    <div
      className={`px-4 py-3 rounded shadow-lg text-sm max-w-sm ${colours[toast.type]}`}
    >
      {toast.message}
    </div>
  );
}