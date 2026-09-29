import { useCallback, useRef, useState } from 'react';

export type ToastKind = 'info' | 'success' | 'error';

export interface Toast {
  id: number;
  text: string;
  kind: ToastKind;
}

export type Notify = (text: string, kind?: ToastKind) => void;

const DURATION: Record<ToastKind, number> = { info: 3500, success: 3000, error: 7000 };

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback<Notify>(
    (text, kind = 'info') => {
      const id = nextId.current++;
      setToasts((all) => [...all.slice(-2), { id, text, kind }]);
      window.setTimeout(() => dismiss(id), DURATION[kind]);
    },
    [dismiss],
  );

  return { toasts, notify, dismiss };
}
