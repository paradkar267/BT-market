import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

// ponytail: one reusable modal replaces all window.confirm() calls site-wide
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = 'Delete', variant = 'danger' }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 animate-[scaleIn_200ms_ease-out] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header icon */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-100 dark:bg-red-500/15' : 'bg-amber-100 dark:bg-amber-500/15'}`}>
            {isDanger
              ? <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              : <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            }
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">{title}</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl font-medium text-sm bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 h-11 rounded-xl font-medium text-sm text-white transition-colors cursor-pointer ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}
          >
            {confirmText}
          </button>
        </div>

        {/* Close button */}
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
}
