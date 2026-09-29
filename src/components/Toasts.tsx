import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import type { Toast } from '../hooks/useToasts.ts';

const STYLES = {
  info: { box: 'bg-slate-800 text-white', icon: Info },
  success: { box: 'bg-emerald-600 text-white', icon: CircleCheck },
  error: { box: 'bg-rose-600 text-white', icon: TriangleAlert },
} as const;

export function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => {
        const { box, icon: Icon } = STYLES[toast.kind];
        return (
          <div
            key={toast.id}
            role={toast.kind === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex max-w-xl animate-toast-in items-center gap-3 rounded-2xl py-3 pr-3 pl-4 font-bold shadow-xl ${box}`}
          >
            <Icon className="size-5 shrink-0" strokeWidth={2.5} />
            <span className="whitespace-pre-line">{toast.text}</span>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Zamknij"
              className="ml-1 grid size-7 shrink-0 place-items-center rounded-full opacity-70 transition hover:bg-white/15 hover:opacity-100"
            >
              <X className="size-4" strokeWidth={2.6} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
