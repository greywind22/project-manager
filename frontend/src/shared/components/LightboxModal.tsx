// Simple lightbox for viewing photo assets fullscreen.
// SHORTCUT: No navigation between photos — clicking opens a single image.
// With more time: add prev/next arrows and keyboard navigation.

interface LightboxModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function LightboxModal({ src, alt, onClose }: LightboxModalProps) {
  return (
    // Backdrop — clicking it closes the lightbox
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer"
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt}
        // stopPropagation prevents clicks on the image from closing the lightbox
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-xl cursor-default"
      />
    </div>
  );
}