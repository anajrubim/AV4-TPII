import { useState, useCallback } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let globalAddToast: ((msg: string, type?: Toast['type']) => void) | null = null;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  globalAddToast = addToast;

  return { toasts, addToast };
}

export function toast(message: string, type: Toast['type'] = 'info') {
  globalAddToast?.(message, type);
}

export function ToastContainer({ toasts }: { toasts: { id: number; message: string; type: string }[] }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' && ''}
          {t.type === 'error' && ''}
          {t.message}
        </div>
      ))}
    </div>
  );
}
