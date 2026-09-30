import { Boxes, Cable, Check } from 'lucide-react';
import { useState } from 'react';
import { MODELS, type ModelTemplate } from '../models/index.ts';
import { Modal } from './Modal.tsx';

interface Props {
  open: boolean;
  currentId: string;
  onClose: () => void;
  onSelect: (model: ModelTemplate) => void;
}

export function ModelsDialog({ open, currentId, onClose, onSelect }: Props) {
  const [pending, setPending] = useState<ModelTemplate | null>(null);

  if (pending) {
    return (
      <Modal
        open={open}
        onClose={() => setPending(null)}
        className="max-w-md p-7 text-center"
      >
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-sky-100">
          <Boxes className="size-8 text-sky-600" strokeWidth={2.2} />
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-800">Wczytać {pending.name}?</h2>
        <p className="mt-2 font-semibold text-slate-500">
          Zmieni ustawienia robota i zastąpi obecny program gotowymi klockami.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPending(null)}
            className="h-12 rounded-2xl bg-slate-100 font-extrabold text-slate-700 transition hover:bg-slate-200"
          >
            Zostaw
          </button>
          <button
            type="button"
            onClick={() => {
              const model = pending;
              setPending(null);
              onSelect(model);
            }}
            className="h-12 rounded-2xl bg-sky-500 font-extrabold text-white shadow-[0_4px_0_#0369a1] transition hover:bg-sky-400 active:translate-y-1 active:shadow-none"
          >
            Wczytaj
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} className="max-w-6xl">
      <div className="px-6 pt-5 pb-3">
        <h2 className="text-2xl font-black text-slate-800">Modele</h2>
      </div>
      <div className="grid gap-5 px-6 pb-6 sm:grid-cols-2 lg:grid-cols-3">
        {MODELS.map((model) => {
          const active = model.id === currentId;
          return (
            <article
              key={model.id}
              className={`flex flex-col overflow-hidden rounded-3xl border-2 ${active ? 'border-sky-400 bg-sky-50' : 'border-slate-100 bg-white'}`}
            >
              {model.image && (
                <div className="relative min-h-64 bg-slate-100">
                  <img src={model.image} alt="" className="aspect-square w-full object-contain p-2" />
                  {active && (
                    <span className="absolute top-3 right-3 rounded-full bg-sky-500 px-2.5 py-1 text-xs font-black text-white">
                      teraz
                    </span>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-3 p-4">
                <h3 className="text-center text-xl font-black text-slate-800">{model.name}</h3>
                <button
                  type="button"
                  onClick={() => setPending(model)}
                  className="h-11 rounded-2xl bg-sky-500 font-extrabold text-white shadow-[0_4px_0_#0369a1] transition hover:bg-sky-400 active:translate-y-1 active:shadow-none"
                >
                  Wybierz ten model
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </Modal>
  );
}

interface CablesProps {
  model: ModelTemplate;
  onDone: () => void;
}

export function ConnectCablesDialog({ model, onDone }: CablesProps) {
  return (
    <Modal open onClose={onDone} className="max-w-md p-7">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-amber-100">
        <Cable className="size-8 text-amber-600" strokeWidth={2.2} />
      </div>
      <h2 className="mt-4 text-center text-2xl font-black text-slate-800">Podłącz kable</h2>
      <p className="mt-2 text-center font-semibold text-slate-500">
        Zanim uruchomisz program, podłącz urządzenia tak:
      </p>
      <ul className="mt-5 space-y-2">
        {model.profile.devices.map((device) => (
          <li
            key={device.id}
            className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 font-extrabold text-slate-700"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-sky-500 text-lg text-white">
              {device.port}
            </span>
            {device.name}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onDone}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 font-extrabold text-white shadow-[0_4px_0_#047857] transition hover:bg-emerald-400 active:translate-y-1 active:shadow-none"
      >
        <Check className="size-5" strokeWidth={2.6} /> Gotowe
      </button>
    </Modal>
  );
}
