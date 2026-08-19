import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Fullscreen image viewer with keyboard + click navigation.
export default function Lightbox({ images, index, onClose, onIndex }) {
  const count = images.length;
  const go = useCallback(
    (d) => onIndex((index + d + count) % count),
    [index, count, onIndex]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  const arrow =
    'absolute top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20';

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4"
      style={{ animation: 'uaFade 0.2s ease both' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {count > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); go(-1); }}
          aria-label="Previous"
          className={`${arrow} left-3`}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <img
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
      />

      {count > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); go(1); }}
          aria-label="Next"
          className={`${arrow} right-3`}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {count > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white/90 backdrop-blur">
          {index + 1} / {count}
        </div>
      )}
    </div>,
    document.body
  );
}
