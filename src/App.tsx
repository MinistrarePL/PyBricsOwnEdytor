import type { WorkspaceSvg } from 'blockly';
import { TriangleAlert } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { resetWorkspace } from './blockly/blocks.ts';
import { testDriveProgram, testTurnProgram, workspaceToPython } from './codegen.ts';
import { BlocklyEditor } from './components/BlocklyEditor.tsx';
import { ConfirmNewDialog } from './components/ConfirmNewDialog.tsx';
import { SettingsDialog, type TestKind } from './components/SettingsDialog.tsx';
import { Toasts } from './components/Toasts.tsx';
import { TopBar } from './components/TopBar.tsx';
import { bluetoothAvailable, useHub } from './hooks/useHub.ts';
import { useToasts } from './hooks/useToasts.ts';
import { clearRobotOverride, loadRobot, saveRobot } from './robot.ts';
import type { RobotProfile } from './types.ts';

export default function App() {
  const { toasts, notify, dismiss } = useToasts();
  const hub = useHub(notify);
  const workspaceRef = useRef<WorkspaceSvg | null>(null);
  const [robot, setRobot] = useState<RobotProfile>(loadRobot);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  const onWorkspace = useCallback((workspace: WorkspaceSvg | null) => {
    workspaceRef.current = workspace;
  }, []);

  const play = async () => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }
    if (!hub.connected && !(await hub.connect())) {
      return;
    }
    let source: string;
    try {
      source = workspaceToPython(workspace, robot);
    } catch (error) {
      notify(error instanceof Error ? error.message : String(error), 'error');
      return;
    }
    if (await hub.run(source)) {
      notify('Program wystartował!', 'success');
    }
  };

  const saveSettings = (next: RobotProfile) => {
    setRobot(next);
    saveRobot(next);
  };

  const resetSettings = () => {
    clearRobotOverride();
    const restored = loadRobot();
    setRobot(restored);
    return restored;
  };

  const runTest = (kind: TestKind, profile: RobotProfile) =>
    hub.run(kind === 'drive' ? testDriveProgram(profile) : testTurnProgram(profile));

  return (
    <div className="flex h-dvh flex-col bg-slate-100 font-sans text-slate-800">
      <TopBar
        hub={hub}
        robotName={robot.name}
        bluetooth={bluetoothAvailable}
        onPlay={() => void play()}
        onNew={() => setConfirmNew(true)}
        onSettings={() => setSettingsOpen(true)}
      />

      {!bluetoothAvailable && (
        <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2.5 text-sm font-bold text-amber-900">
          <TriangleAlert className="size-4" strokeWidth={2.6} />
          Ta przeglądarka nie obsługuje Bluetooth. Otwórz stronę w Chrome lub Edge.
        </div>
      )}

      <main className="relative isolate min-h-0 flex-1">
        <BlocklyEditor onReady={onWorkspace} />
      </main>

      <Toasts toasts={toasts} onDismiss={dismiss} />

      {settingsOpen && (
        <SettingsDialog
          robot={robot}
          connected={hub.connected}
          onClose={() => setSettingsOpen(false)}
          onSave={saveSettings}
          onReset={resetSettings}
          onTest={runTest}
        />
      )}

      <ConfirmNewDialog
        open={confirmNew}
        onCancel={() => setConfirmNew(false)}
        onConfirm={() => {
          if (workspaceRef.current) {
            resetWorkspace(workspaceRef.current);
          }
          setConfirmNew(false);
          notify('Nowy program. Do dzieła!');
        }}
      />
    </div>
  );
}
