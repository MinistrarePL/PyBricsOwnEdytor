import type { RobotProfile } from './types.ts';
import { PORTS } from './types.ts';
import { DEFAULT_ROBOT, sanitizeRobot } from './robot.ts';

export function openSettings(
  current: RobotProfile,
  options: {
    connected: boolean;
    onSave: (profile: RobotProfile) => void;
    onReset: () => RobotProfile;
    onTestDrive: () => Promise<void>;
    onTestTurn: () => Promise<void>;
  },
): void {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-labelledby="settings-title">
      <h2 id="settings-title">Ustawienia robota</h2>
      <p class="hint">Te opcje są dla rodzica. Syn układa tylko bloki.</p>
      <form id="robot-form">
        <label>Nazwa
          <input name="name" type="text" maxlength="40" />
        </label>
        <div class="row">
          <label>Lewy silnik
            <select name="leftPort"></select>
          </label>
          <label class="check">
            <input name="leftRev" type="checkbox" /> odwróć kierunek
          </label>
        </div>
        <div class="row">
          <label>Prawy silnik
            <select name="rightPort"></select>
          </label>
          <label class="check">
            <input name="rightRev" type="checkbox" /> odwróć kierunek
          </label>
        </div>
        <button type="button" class="secondary" id="swap-motors">Zamień lewy z prawym</button>
        <div class="row">
          <label>Średnica kół (mm)
            <input name="wheel" type="number" min="20" max="120" step="1" />
          </label>
          <label>Rozstaw (mm)
            <input name="track" type="number" min="40" max="250" step="1" />
          </label>
        </div>
        <label class="check">
          <input name="gyro" type="checkbox" /> używaj żyroskopu (pewniejsze skręty)
        </label>
        <div class="test-row">
          <button type="button" class="secondary" id="test-drive" ${options.connected ? '' : 'disabled'}>Jedź 20 cm</button>
          <button type="button" class="secondary" id="test-turn" ${options.connected ? '' : 'disabled'}>Obrót w prawo 90°</button>
        </div>
        <p class="hint" id="settings-msg"></p>
        <div class="modal-actions">
          <button type="button" class="ghost" id="reset-defaults">Przywróć domyślne</button>
          <button type="button" class="ghost" id="cancel-settings">Anuluj</button>
          <button type="submit" class="primary">Zapisz</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const form = overlay.querySelector('#robot-form') as HTMLFormElement;
  const leftSelect = form.elements.namedItem('leftPort') as HTMLSelectElement;
  const rightSelect = form.elements.namedItem('rightPort') as HTMLSelectElement;
  const msg = overlay.querySelector('#settings-msg') as HTMLParagraphElement;

  for (const port of PORTS) {
    leftSelect.append(new Option(port, port));
    rightSelect.append(new Option(port, port));
  }

  const fill = (profile: RobotProfile) => {
    (form.elements.namedItem('name') as HTMLInputElement).value = profile.name;
    leftSelect.value = profile.leftMotor.port;
    rightSelect.value = profile.rightMotor.port;
    (form.elements.namedItem('leftRev') as HTMLInputElement).checked = profile.leftMotor.reversed;
    (form.elements.namedItem('rightRev') as HTMLInputElement).checked = profile.rightMotor.reversed;
    (form.elements.namedItem('wheel') as HTMLInputElement).value = String(profile.wheelDiameter);
    (form.elements.namedItem('track') as HTMLInputElement).value = String(profile.axleTrack);
    (form.elements.namedItem('gyro') as HTMLInputElement).checked = profile.useGyro;
  };

  fill(current);

  const read = (): RobotProfile =>
    sanitizeRobot({
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      leftMotor: {
        port: leftSelect.value as RobotProfile['leftMotor']['port'],
        reversed: (form.elements.namedItem('leftRev') as HTMLInputElement).checked,
      },
      rightMotor: {
        port: rightSelect.value as RobotProfile['rightMotor']['port'],
        reversed: (form.elements.namedItem('rightRev') as HTMLInputElement).checked,
      },
      wheelDiameter: Number((form.elements.namedItem('wheel') as HTMLInputElement).value),
      axleTrack: Number((form.elements.namedItem('track') as HTMLInputElement).value),
      useGyro: (form.elements.namedItem('gyro') as HTMLInputElement).checked,
    });

  const close = () => overlay.remove();

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
    }
  });

  overlay.querySelector('#cancel-settings')?.addEventListener('click', close);

  overlay.querySelector('#swap-motors')?.addEventListener('click', () => {
    const left = leftSelect.value;
    leftSelect.value = rightSelect.value;
    rightSelect.value = left;
  });

  overlay.querySelector('#reset-defaults')?.addEventListener('click', () => {
    const restored = options.onReset();
    fill(restored);
    msg.textContent = `Przywrócono: ${DEFAULT_ROBOT.leftMotor.port}/${DEFAULT_ROBOT.rightMotor.port}, koła ${DEFAULT_ROBOT.wheelDiameter} mm.`;
  });

  const runTest = async (kind: 'drive' | 'turn') => {
    options.onSave(read());
    msg.textContent = kind === 'drive' ? 'Test: jazda 20 cm…' : 'Test: obrót 90°…';
    try {
      if (kind === 'drive') {
        await options.onTestDrive();
      } else {
        await options.onTestTurn();
      }
      msg.textContent = 'Test wysłany. Jeśli robot jedzie do tyłu albo skręca źle — odwróć kierunek silnika.';
    } catch (error) {
      msg.textContent = error instanceof Error ? error.message : String(error);
    }
  };

  overlay.querySelector('#test-drive')?.addEventListener('click', () => {
    void runTest('drive');
  });
  overlay.querySelector('#test-turn')?.addEventListener('click', () => {
    void runTest('turn');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const next = read();
    if (next.leftMotor.port === next.rightMotor.port) {
      msg.textContent = 'Lewy i prawy silnik nie mogą być na tym samym porcie.';
      return;
    }
    options.onSave(next);
    close();
  });
}
