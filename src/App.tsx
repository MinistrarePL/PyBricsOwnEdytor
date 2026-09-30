import type { WorkspaceSvg } from 'blockly';
import { TriangleAlert } from 'lucide-react';
import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { applyProfile, loadTemplate, resetWorkspace } from './blockly/blocks.ts';
import { testDriveProgram, testTurnProgram, workspaceToPython } from './codegen.ts';
import { BlocklyEditor } from './components/BlocklyEditor.tsx';
import { ConfirmNewDialog } from './components/ConfirmNewDialog.tsx';
import { ConnectCablesDialog, ModelsDialog } from './components/ModelsDialog.tsx';
import { SettingsDialog, type TestKind } from './components/SettingsDialog.tsx';
import { Toasts } from './components/Toasts.tsx';
import { TopBar } from './components/TopBar.tsx';
import { bluetoothAvailable, useHub } from './hooks/useHub.ts';
import { useToasts } from './hooks/useToasts.ts';
import { cloneProfile, getModel, type ModelTemplate } from './models/index.ts';
import { loadRobot, resetToModelDefaults, sanitizeRobot, saveRobot } from './robot.ts';
import type { RobotProfile } from './types.ts';

const InstructionsPanel = lazy(async () => {
  const mod = await import('./components/InstructionsPanel.tsx');
  return { default: mod.InstructionsPanel };
});

export default function App() {
  const { toasts, notify, dismiss } = useToasts();
  const hub = useHub(notify);
  const workspaceRef = useRef<WorkspaceSvg | null>(null);
  const [robot, setRobot] = useState<RobotProfile>(loadRobot);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [cablesModel, setCablesModel] = useState<ModelTemplate | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  const model = getModel(robot.modelId);
  const modelName = model?.name ?? robot.name;
  const pdfs = model?.pdfs ?? [];

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
    const restored = resetToModelDefaults(robot.modelId, robot.name);
    setRobot(restored);
    return restored;
  };

  const runTest = (kind: TestKind, profile: RobotProfile) =>
    hub.run(kind === 'drive' ? testDriveProgram(profile) : testTurnProgram(profile));

  const selectModel = (selected: ModelTemplate) => {
    const next = sanitizeRobot(cloneProfile(selected.profile));
    setRobot(next);
    saveRobot(next);
    setModelsOpen(false);
    setInstructionsOpen(false);
    const workspace = workspaceRef.current;
    if (workspace) {
      applyProfile(workspace, next);
      loadTemplate(workspace, selected.program);
    }
    setCablesModel(selected);
    notify(`Wczytano program: ${selected.name}`, 'success');
  };

  const finishCables = () => {
    const selected = cablesModel;
    setCablesModel(null);
    if (selected && selected.pdfs.length > 0) {
      setInstructionsOpen(true);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-slate-100 font-sans text-slate-800">
      <TopBar
        hub={hub}
        robotName={robot.name}
        modelName={modelName}
        bluetooth={bluetoothAvailable}
        hasInstructions={pdfs.length > 0}
        instructionsOpen={instructionsOpen}
        onPlay={() => void play()}
        onNew={() => setConfirmNew(true)}
        onSettings={() => setSettingsOpen(true)}
        onModels={() => setModelsOpen(true)}
        onInstructions={() => {
          if (pdfs.length > 0) {
            setInstructionsOpen((open) => !open);
          }
        }}
      />

      {!bluetoothAvailable && (
        <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2.5 text-sm font-bold text-amber-900">
          <TriangleAlert className="size-4" strokeWidth={2.6} />
          Ta przeglądarka nie obsługuje Bluetooth. Otwórz stronę w Chrome lub Edge.
        </div>
      )}

      <main className="relative isolate flex min-h-0 flex-1">
        <div className="relative min-h-0 min-w-0 flex-1">
          <BlocklyEditor profile={robot} onReady={onWorkspace} />
        </div>
        {instructionsOpen && pdfs.length > 0 && (
          <Suspense
            fallback={
              <aside className="flex w-[min(45vw,560px)] items-center justify-center border-l border-slate-200 bg-white text-sm font-extrabold text-slate-400">
                Wczytuję instrukcję…
              </aside>
            }
          >
            <InstructionsPanel key={robot.modelId} parts={pdfs} onClose={() => setInstructionsOpen(false)} />
          </Suspense>
        )}
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

      <ModelsDialog
        open={modelsOpen}
        currentId={robot.modelId}
        onClose={() => setModelsOpen(false)}
        onSelect={selectModel}
      />

      {cablesModel && <ConnectCablesDialog model={cablesModel} onDone={finishCables} />}

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
