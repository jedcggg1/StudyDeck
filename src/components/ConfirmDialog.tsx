import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '../i18n';

interface ConfirmDialogProps {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red zone styling (destructive) by default */
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Neo-brutalist in-app confirmation dialog replacing native confirm()/alert().
 * Usage: render conditionally next to the calling component.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onMouseDown={(e) => {
        // Clicking backdrop cancels (keyboard Esc handled below)
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="brutal-card bg-white w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div
          className={`px-5 py-3 border-b-2 border-[#111111] flex items-center gap-2 ${
            tone === 'danger' ? 'bg-[#FA5252] text-white' : 'bg-[#1769FF] text-white'
          }`}
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="text-sm font-black tracking-tight">{title}</h3>
        </div>

        <div className="p-5">
          {message && (
            <p className="text-xs font-semibold text-zinc-700 leading-relaxed">{message}</p>
          )}
        </div>

        <div className="px-5 pb-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="brutal-btn bg-white !py-2 !px-4 !text-xs"
          >
            {cancelLabel ?? t('Cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`brutal-btn !py-2 !px-4 !text-xs ${
              tone === 'danger' ? 'brutal-btn-danger' : 'brutal-btn-primary'
            }`}
          >
            {confirmLabel ?? t('Delete')}
          </button>
        </div>
      </div>
    </div>
  );
};
