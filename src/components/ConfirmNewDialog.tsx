import { FilePlus } from 'lucide-react';
import { Modal } from './Modal.tsx';

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmNewDialog({ open, onCancel, onConfirm }: Props) {
  return (
    <Modal open={open} onClose={onCancel} className="max-w-sm p-7 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-amber-100">
        <FilePlus className="size-8 text-amber-600" strokeWidth={2.2} />
      </div>
      <h2 className="mt-4 text-2xl font-black text-slate-800">Nowy program?</h2>
      <p className="mt-2 font-semibold text-slate-500">Ułożone klocki znikną i zaczniesz od początku.</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="h-12 rounded-2xl bg-slate-100 font-extrabold text-slate-700 transition hover:bg-slate-200"
        >
          Zostaw
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="h-12 rounded-2xl bg-amber-500 font-extrabold text-white shadow-[0_4px_0_#b45309] transition hover:bg-amber-400 active:translate-y-1 active:shadow-none"
        >
          Tak, nowy
        </button>
      </div>
    </Modal>
  );
}
