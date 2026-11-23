import React, { useEffect } from 'react';
import type { ToastMessage } from '../hooks/useGameState';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

const toneStyle: Record<ToastMessage['tone'], string> = {
  info: 'border-violet-400/40 bg-violet-950/90 text-violet-100',
  success: 'border-emerald-400/40 bg-emerald-950/90 text-emerald-100',
  danger: 'border-red-400/40 bg-red-950/90 text-red-100'
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, 2600);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div role="status" aria-live="polite"
      className={`fixed left-1/2 top-4 z-[60] w-[min(92vw,420px)] -translate-x-1/2 rounded-xl border px-4 py-3 text-center text-sm shadow-2xl backdrop-blur-xl animate-[toastIn_260ms_ease-out] ${toneStyle[toast.tone]}`}>
      <button onClick={onDismiss} aria-label="关闭提示" className="absolute right-2 top-1.5 text-lg opacity-60 hover:opacity-100">×</button>
      {toast.text}
    </div>
  );
};

export default Toast;
