import type { WorkspaceSvg } from 'blockly';
import { createWorkspace, resetWorkspace } from './blocks.ts';
import { compilePython } from './compile.ts';
import { testDriveProgram, testTurnProgram, workspaceToPython } from './codegen.ts';
import { HubError, PybricksHub } from './hub.ts';
import { clearRobotOverride, loadRobot, saveRobot } from './robot.ts';
import { openSettings } from './settings.ts';
import type { RobotProfile } from './types.ts';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('#app missing');
}

app.innerHTML = `
  <header class="toolbar">
    <div class="brand">
      <span class="logo" aria-hidden="true"></span>
      <div>
        <strong>Edytor klocków</strong>
        <span class="sub">SPIKE Prime · Pybricks</span>
      </div>
    </div>
    <div class="status" id="hub-status">
      <span class="dot"></span>
      <span class="status-text">nie połączono</span>
    </div>
    <div class="actions">
      <button type="button" id="btn-connect" class="primary">Połącz</button>
      <button type="button" id="btn-play" class="play" disabled>Play</button>
      <button type="button" id="btn-stop" class="stop" disabled>Stop</button>
      <button type="button" id="btn-new" class="ghost" title="Nowy program">Nowy</button>
      <button type="button" id="btn-settings" class="ghost" title="Ustawienia robota">⚙</button>
    </div>
  </header>
  <main class="workspace-wrap">
    <div id="blockly"></div>
  </main>
  <p class="banner" id="banner" hidden></p>
`;

const hub = new PybricksHub();
let robot: RobotProfile = loadRobot();
const workspace: WorkspaceSvg = createWorkspace(document.querySelector('#blockly')!);

const btnConnect = document.querySelector<HTMLButtonElement>('#btn-connect')!;
const btnPlay = document.querySelector<HTMLButtonElement>('#btn-play')!;
const btnStop = document.querySelector<HTMLButtonElement>('#btn-stop')!;
const btnNew = document.querySelector<HTMLButtonElement>('#btn-new')!;
const btnSettings = document.querySelector<HTMLButtonElement>('#btn-settings')!;
const statusEl = document.querySelector('#hub-status')!;
const banner = document.querySelector<HTMLParagraphElement>('#banner')!;

function showBanner(text: string, kind: 'info' | 'error' = 'info'): void {
  banner.hidden = !text;
  banner.textContent = text;
  banner.dataset.kind = kind;
}

function setBusy(busy: boolean): void {
  btnPlay.disabled = busy || !hub.connected;
  btnStop.disabled = busy || !hub.connected;
  btnConnect.disabled = busy;
}

function renderStatus(): void {
  const connected = hub.connected;
  statusEl.classList.toggle('online', connected);
  statusEl.classList.toggle('running', hub.running);
  const text = statusEl.querySelector('.status-text')!;
  if (!connected) {
    text.textContent = 'nie połączono';
  } else if (hub.running) {
    text.textContent = `${hub.name} · program działa`;
  } else {
    text.textContent = hub.name;
  }
  btnConnect.textContent = connected ? 'Rozłącz' : 'Połącz';
  btnPlay.disabled = !connected;
  btnStop.disabled = !connected;
}

hub.onStatus = () => renderStatus();
hub.onStdout = (chunk) => {
  const msg = chunk.trim();
  if (msg) {
    showBanner(msg, 'info');
  }
};

async function runPython(source: string): Promise<void> {
  setBusy(true);
  showBanner('Kompiluję i wgrywam program…');
  try {
    const packed = await compilePython(source);
    await hub.downloadAndRun(packed);
    showBanner('Program wystartował na hubie.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showBanner(message, 'error');
    throw error;
  } finally {
    setBusy(false);
    renderStatus();
  }
}

btnConnect.addEventListener('click', () => {
  void (async () => {
    try {
      if (hub.connected) {
        await hub.disconnect();
        showBanner('');
        return;
      }
      showBanner('Wybierz hub na liście Bluetooth. Nie paruj go w ustawieniach systemu.');
      await hub.connect();
      showBanner(`Połączono z ${hub.name}.`);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        showBanner('Anulowano wybór huba.');
        return;
      }
      const message = error instanceof HubError || error instanceof Error ? error.message : String(error);
      showBanner(message, 'error');
    } finally {
      renderStatus();
    }
  })();
});

btnPlay.addEventListener('click', () => {
  void (async () => {
    try {
      const source = workspaceToPython(workspace, robot);
      await runPython(source);
    } catch (error) {
      if (!(error instanceof Error && error.message.startsWith('Program'))) {
        showBanner(error instanceof Error ? error.message : String(error), 'error');
      }
    }
  })();
});

btnStop.addEventListener('click', () => {
  void (async () => {
    try {
      await hub.stop();
      showBanner('Zatrzymano program.');
    } catch (error) {
      showBanner(error instanceof Error ? error.message : String(error), 'error');
    }
  })();
});

btnNew.addEventListener('click', () => {
  if (confirm('Wyczyścić ułożone klocki i zacząć od nowa?')) {
    resetWorkspace(workspace);
    showBanner('Nowy program.');
  }
});

btnSettings.addEventListener('click', () => {
  openSettings(robot, {
    connected: hub.connected,
    onSave: (next) => {
      robot = next;
      saveRobot(robot);
      showBanner('Zapisano ustawienia robota na tym komputerze.');
    },
    onReset: () => {
      clearRobotOverride();
      robot = loadRobot();
      return robot;
    },
    onTestDrive: () => runPython(testDriveProgram(robot)),
    onTestTurn: () => runPython(testTurnProgram(robot)),
  });
});

renderStatus();

if (!navigator.bluetooth) {
  showBanner('Web Bluetooth jest niedostępne. Otwórz tę stronę w Chrome lub Edge (HTTPS albo localhost).', 'error');
  btnConnect.disabled = true;
}
