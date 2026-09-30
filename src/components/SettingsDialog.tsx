import { ArrowLeftRight, Gauge, MoveUp, Palette, Radar, RotateCw, Settings, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { getModel } from '../models/index.ts';
import { sanitizeRobot } from '../robot.ts';
import { DEVICE_KIND_LABEL, PORTS, motorsOf, type Device, type PortId, type RobotProfile } from '../types.ts';
import { Modal } from './Modal.tsx';

export type TestKind = 'drive' | 'turn';

interface Props {
  robot: RobotProfile;
  connected: boolean;
  onClose: () => void;
  onSave: (robot: RobotProfile) => void;
  onReset: () => RobotProfile;
  onTest: (kind: TestKind, robot: RobotProfile) => Promise<boolean>;
}

export function SettingsDialog({ robot, connected, onClose, onSave, onReset, onTest }: Props) {
  const [draft, setDraft] = useState<RobotProfile>(robot);
  const [testing, setTesting] = useState<TestKind | null>(null);
  const [hint, setHint] = useState('');
  const modelName = getModel(draft.modelId)?.name ?? draft.name;
  const motors = motorsOf(draft);

  const setDevicePort = (id: string, port: PortId) => {
    setDraft((current) => ({
      ...current,
      devices: current.devices.map((device) => (device.id === id ? { ...device, port } : device)),
    }));
  };

  const setDeviceReversed = (id: string, reversed: boolean) => {
    setDraft((current) => ({
      ...current,
      devices: current.devices.map((device) => (device.id === id ? { ...device, reversed } : device)),
    }));
  };

  const setDriveMotor = (side: 'left' | 'right', id: string) => {
    setDraft((current) => {
      if (!current.driveBase) {
        return current;
      }
      const other = side === 'left' ? 'right' : 'left';
      const driveBase = { ...current.driveBase, [side]: id };
      if (driveBase[other] === id) {
        const swap = motors.find((motor) => motor.id !== id);
        if (swap) {
          driveBase[other] = swap.id;
        }
      }
      return { ...current, driveBase };
    });
  };

  const swapWheels = () => {
    setDraft((current) => {
      if (!current.driveBase) {
        return current;
      }
      return {
        ...current,
        driveBase: { ...current.driveBase, left: current.driveBase.right, right: current.driveBase.left },
      };
    });
  };

  const runTest = async (kind: TestKind) => {
    const clean = sanitizeRobot(draft);
    onSave(clean);
    setTesting(kind);
    setHint('');
    const ok = await onTest(kind, clean);
    setTesting(null);
    if (ok) {
      setHint(
        kind === 'drive'
          ? 'Robot powinien przejechać 20 cm do przodu. Jedzie do tyłu? Odwróć kierunek obu silników.'
          : 'Robot powinien obrócić się w prawo. Kręci się w lewo? Zamień silniki.',
      );
    }
  };

  return (
    <Modal open onClose={onClose} className="max-w-2xl">
      <div className="flex items-start gap-4 border-b border-slate-100 px-7 pt-6 pb-5">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-slate-100">
          <Settings className="size-6 text-slate-600" strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-slate-800">Ustawienia robota</h2>
          <p className="font-semibold text-slate-500">
            {modelName}. Dla rodzica. Dziecko układa tylko klocki.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij"
          className="grid size-10 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="size-5" strokeWidth={2.6} />
        </button>
      </div>

      <div className="space-y-6 px-7 py-6">
        <Field label="Nazwa robota">
          <input
            value={draft.name}
            maxLength={40}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="h-12 w-full rounded-2xl border-2 border-slate-200 px-4 font-bold text-slate-800 outline-none transition focus:border-sky-400"
          />
        </Field>

        <section>
          <SectionTitle>Urządzenia</SectionTitle>
          <div className="mt-3 grid gap-3">
            {draft.devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                occupied={new Set(draft.devices.filter((other) => other.id !== device.id).map((other) => other.port))}
                onPort={(port) => setDevicePort(device.id, port)}
                onReversed={
                  device.kind === 'motor' ? (reversed) => setDeviceReversed(device.id, reversed) : undefined
                }
              />
            ))}
          </div>
        </section>

        {draft.driveBase && (
          <>
            <section>
              <div className="mb-3 flex items-center justify-between">
                <SectionTitle>Silniki kół</SectionTitle>
                <button
                  type="button"
                  onClick={swapWheels}
                  className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200"
                >
                  <ArrowLeftRight className="size-4" strokeWidth={2.6} /> Zamień lewy z prawym
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(['left', 'right'] as const).map((side) => (
                  <label key={side} className="rounded-2xl border-2 border-slate-100 p-4">
                    <div className="mb-3 font-extrabold text-slate-700">
                      {side === 'left' ? 'Lewe koło' : 'Prawe koło'}
                    </div>
                    <select
                      value={draft.driveBase?.[side]}
                      onChange={(e) => setDriveMotor(side, e.target.value)}
                      className="h-11 w-full rounded-xl border-2 border-slate-200 px-3 font-bold text-slate-700 outline-none focus:border-sky-400"
                    >
                      {motors.map((motor) => (
                        <option key={motor.id} value={motor.id}>
                          {motor.name} ({motor.port})
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle>Wymiary</SectionTitle>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <NumberField
                  label="Średnica kół"
                  value={draft.driveBase.wheelDiameter}
                  onChange={(wheelDiameter) =>
                    setDraft({ ...draft, driveBase: { ...draft.driveBase!, wheelDiameter } })
                  }
                />
                <NumberField
                  label="Rozstaw kół"
                  value={draft.driveBase.axleTrack}
                  onChange={(axleTrack) => setDraft({ ...draft, driveBase: { ...draft.driveBase!, axleTrack } })}
                />
              </div>
              <Toggle
                className="mt-4"
                checked={draft.driveBase.useGyro}
                onChange={(useGyro) => setDraft({ ...draft, driveBase: { ...draft.driveBase!, useGyro } })}
                label="Używaj żyroskopu (dokładniejsze skręty)"
              />
            </section>

            <section className="rounded-2xl bg-slate-50 p-4">
              <SectionTitle>Sprawdź robota</SectionTitle>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {connected ? 'Postaw robota na podłodze i kliknij test.' : 'Najpierw połącz się z hubem.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <TestButton disabled={!connected || testing !== null} onClick={() => void runTest('drive')}>
                  <MoveUp className="size-4" strokeWidth={2.8} /> {testing === 'drive' ? 'Wysyłam…' : 'Jedź 20 cm'}
                </TestButton>
                <TestButton disabled={!connected || testing !== null} onClick={() => void runTest('turn')}>
                  <RotateCw className="size-4" strokeWidth={2.8} /> {testing === 'turn' ? 'Wysyłam…' : 'Obrót w prawo 90°'}
                </TestButton>
              </div>
              {hint && <p className="mt-3 text-sm font-bold text-sky-700">{hint}</p>}
            </section>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-slate-100 px-7 py-5">
        <button
          type="button"
          onClick={() => {
            const restored = onReset();
            setDraft(restored);
            setHint(`Przywrócono domyślne ustawienia modelu ${getModel(restored.modelId)?.name ?? restored.name}.`);
          }}
          className="rounded-full px-4 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          Przywróć domyślne
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onClose}
          className="h-12 rounded-2xl px-6 font-extrabold text-slate-600 transition hover:bg-slate-100"
        >
          Anuluj
        </button>
        <button
          type="button"
          onClick={() => {
            onSave(sanitizeRobot(draft));
            onClose();
          }}
          className="h-12 rounded-2xl bg-sky-500 px-7 font-extrabold text-white shadow-[0_4px_0_#0369a1] transition hover:bg-sky-400 active:translate-y-1 active:shadow-none"
        >
          Zapisz
        </button>
      </div>
    </Modal>
  );
}

function DeviceCard({
  device,
  occupied,
  onPort,
  onReversed,
}: {
  device: Device;
  occupied: Set<PortId>;
  onPort: (port: PortId) => void;
  onReversed?: (reversed: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-slate-100 p-4">
      <div className="mb-3 flex items-center gap-3">
        <KindIcon kind={device.kind} />
        <div>
          <div className="font-extrabold text-slate-800">{device.name}</div>
          <div className="text-sm font-semibold text-slate-400">{DEVICE_KIND_LABEL[device.kind]}</div>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {PORTS.map((port) => {
          const active = device.port === port;
          const taken = occupied.has(port);
          return (
            <button
              key={port}
              type="button"
              disabled={taken}
              onClick={() => onPort(port)}
              className={`h-10 rounded-xl font-black transition ${
                active
                  ? 'bg-sky-500 text-white shadow-[0_3px_0_#0369a1]'
                  : taken
                    ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {port}
            </button>
          );
        })}
      </div>
      {onReversed && (
        <Toggle className="mt-4" checked={Boolean(device.reversed)} onChange={onReversed} label="Odwrócony kierunek" />
      )}
    </div>
  );
}

function KindIcon({ kind }: { kind: Device['kind'] }) {
  const className = 'size-5 text-slate-600';
  const icon =
    kind === 'motor' ? (
      <Gauge className={className} strokeWidth={2.2} />
    ) : kind === 'colorSensor' ? (
      <Palette className={className} strokeWidth={2.2} />
    ) : kind === 'distanceSensor' ? (
      <Radar className={className} strokeWidth={2.2} />
    ) : (
      <Gauge className={className} strokeWidth={2.2} />
    );
  return <div className="grid size-10 place-items-center rounded-xl bg-slate-100">{icon}</div>;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-sm font-black tracking-wide text-slate-400 uppercase">{children}</h3>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black tracking-wide text-slate-400 uppercase">{label}</span>
      {children}
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex h-14 items-center rounded-2xl border-2 border-slate-200 px-4 transition focus-within:border-sky-400">
      <span className="flex-1 font-bold text-slate-600">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 bg-transparent text-right text-lg font-black text-slate-800 outline-none"
      />
      <span className="ml-1 font-bold text-slate-400">mm</span>
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  className = '',
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 text-left font-bold text-slate-600 ${className}`}
    >
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span
          className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`}
        />
      </span>
      {label}
    </button>
  );
}

function TestButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 items-center gap-2 rounded-xl bg-white px-4 font-extrabold text-slate-700 ring-1 ring-slate-200 transition hover:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}
