import { Bluetooth, Bot, FilePlus, LoaderCircle, Play, Settings, Square, Unplug } from 'lucide-react';
import type { ReactNode } from 'react';
import type { HubControls } from '../hooks/useHub.ts';

interface Props {
  hub: HubControls;
  robotName: string;
  bluetooth: boolean;
  onPlay: () => void;
  onNew: () => void;
  onSettings: () => void;
}

export function TopBar({ hub, robotName, bluetooth, onPlay, onNew, onSettings }: Props) {
  return (
    <header className="relative z-20 flex h-20 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-5 shadow-[0_1px_0_rgb(15_23_42/0.02),0_6px_20px_-12px_rgb(15_23_42/0.25)]">
      <div className="flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_3px_0_#b45309]">
          <Bot className="size-7 text-white" strokeWidth={2.4} />
        </div>
        <div className="leading-tight">
          <div className="text-lg font-black tracking-tight text-slate-800">Edytor klocków</div>
          <div className="text-sm font-semibold text-slate-400">{robotName}</div>
        </div>
      </div>

      <div className="flex-1" />

      <HubButton hub={hub} bluetooth={bluetooth} />

      <div className="flex items-center gap-2">
        <IconButton label="Nowy program" onClick={onNew}>
          <FilePlus className="size-6" strokeWidth={2.2} />
        </IconButton>
        <IconButton label="Ustawienia robota" onClick={onSettings}>
          <Settings className="size-6" strokeWidth={2.2} />
        </IconButton>
      </div>

      <div className="mx-1 h-10 w-px bg-slate-200" />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPlay}
          disabled={!bluetooth || hub.uploading || hub.connecting}
          title="Uruchom program"
          className="grid size-15 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_5px_0_#047857] transition hover:bg-emerald-400 active:translate-y-[5px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {hub.uploading ? (
            <LoaderCircle className="size-8 animate-spin" strokeWidth={2.6} />
          ) : (
            <Play className="ml-1 size-8 fill-white" strokeWidth={2} />
          )}
        </button>
        <button
          type="button"
          onClick={() => void hub.stop()}
          disabled={!hub.connected}
          title="Zatrzymaj program"
          className="grid size-15 place-items-center rounded-full bg-rose-500 text-white shadow-[0_5px_0_#be123c] transition hover:bg-rose-400 active:translate-y-[5px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Square className="size-7 fill-white" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

function HubButton({ hub, bluetooth }: { hub: HubControls; bluetooth: boolean }) {
  if (hub.connected) {
    return (
      <button
        type="button"
        onClick={() => void hub.disconnect()}
        title="Kliknij, żeby rozłączyć"
        className="group flex h-12 items-center gap-3 rounded-full bg-emerald-50 pr-5 pl-4 ring-1 ring-emerald-200 transition hover:bg-rose-50 hover:ring-rose-200"
      >
        <span className="relative flex size-3">
          <span
            className={`absolute inline-flex size-full rounded-full opacity-60 ${hub.running ? 'animate-ping bg-emerald-400' : ''}`}
          />
          <span className="relative inline-flex size-3 rounded-full bg-emerald-500 group-hover:bg-rose-500" />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-sm font-extrabold text-slate-800">{hub.name}</span>
          <span className="block text-xs font-bold text-emerald-700 group-hover:hidden">
            {hub.running ? 'program działa' : 'połączono'}
          </span>
          <span className="hidden items-center gap-1 text-xs font-bold text-rose-600 group-hover:flex">
            <Unplug className="size-3" /> rozłącz
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void hub.connect()}
      disabled={!bluetooth || hub.connecting}
      className="flex h-12 items-center gap-2 rounded-full bg-sky-500 pr-6 pl-5 font-extrabold text-white shadow-[0_4px_0_#0369a1] transition hover:bg-sky-400 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      {hub.connecting ? (
        <LoaderCircle className="size-5 animate-spin" strokeWidth={2.6} />
      ) : (
        <Bluetooth className="size-5" strokeWidth={2.6} />
      )}
      {hub.connecting ? 'Łączę…' : 'Połącz z hubem'}
    </button>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid size-12 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 active:scale-95"
    >
      {children}
    </button>
  );
}
