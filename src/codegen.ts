import type { Block, Workspace } from 'blockly';
import { START_TYPE } from './blockly/blocks.ts';
import { generateFullProgram } from './robot.ts';
import type { RobotProfile } from './types.ts';
import { deviceById, deviceVar } from './types.ts';

const INDENT = '    ';
const MOTOR_SPEED = 500;

export function workspaceToPython(workspace: Workspace, robot: RobotProfile): string {
  const start = workspace.getBlocksByType(START_TYPE, false)[0];
  if (!start) {
    throw new Error('Brak klocka startu. Odśwież stronę.');
  }
  const ctx: Ctx = { robot };
  const lines = statementLines(start.getNextBlock(), '', ctx);
  if (start.getDescendants(false).some((b) => b.isEnabled() && KEEP_ALIVE_TYPES.has(b.type))) {
    lines.push('while True:', `${INDENT}wait(100)`);
  }
  const body = lines.length > 0 ? lines.join('\n') : 'wait(100)';
  return generateFullProgram(robot, body);
}

const KEEP_ALIVE_TYPES = new Set([
  'zapal_swiatlo',
  'pokaz_obrazek',
  'silnik_obroc',
  'silnik_czas',
  'silnik_na_zero',
]);

interface Ctx {
  robot: RobotProfile;
}

function statementLines(first: Block | null, indent: string, ctx: Ctx): string[] {
  const lines: string[] = [];
  for (let block = first; block; block = block.getNextBlock()) {
    if (block.isEnabled()) {
      lines.push(...blockToLines(block, indent, ctx));
    }
  }
  return lines;
}

function nestedLines(block: Block, indent: string, idle: string, ctx: Ctx, input = 'DO'): string[] {
  const inner = statementLines(block.getInputTargetBlock(input), indent + INDENT, ctx);
  return inner.length > 0 ? inner : [`${indent}${INDENT}${idle}`];
}

function num(block: Block, field: string, fallback: number): number {
  const value = Number(block.getFieldValue(field));
  return Number.isFinite(value) ? value : fallback;
}

function needDrive(robot: RobotProfile): void {
  if (!robot.driveBase) {
    throw new Error('Ten model nie jeździ.');
  }
}

function motorRef(robot: RobotProfile, block: Block): string {
  const id = String(block.getFieldValue('URZ') ?? '');
  const device = deviceById(robot, id);
  if (!device || device.kind !== 'motor') {
    throw new Error(`Brak urządzenia: ${id || '?'}`);
  }
  return deviceVar(device.id);
}

function signedSpeed(block: Block): number {
  return block.getFieldValue('KIER') === 'lewo' ? -MOTOR_SPEED : MOTOR_SPEED;
}

function valueToCode(block: Block | null, ctx: Ctx): string {
  if (!block || !block.isEnabled()) {
    return 'False';
  }
  switch (block.type) {
    case 'przycisk_wcisniety': {
      const side = block.getFieldValue('PRZYCISK') === 'prawy' ? 'RIGHT' : 'LEFT';
      return `Button.${side} in hub.buttons.pressed()`;
    }
    case 'silnik_kat_ponad':
      return `abs(${motorRef(ctx.robot, block)}.angle()) > ${Math.round(num(block, 'KAT', 180))}`;
    case 'i':
      return `(${valueToCode(block.getInputTargetBlock('A'), ctx)} and ${valueToCode(block.getInputTargetBlock('B'), ctx)})`;
    case 'lub':
      return `(${valueToCode(block.getInputTargetBlock('A'), ctx)} or ${valueToCode(block.getInputTargetBlock('B'), ctx)})`;
    case 'nie':
      return `(not ${valueToCode(block.getInputTargetBlock('A'), ctx)})`;
    default:
      return 'False';
  }
}

function conditionOf(block: Block, label: string, ctx: Ctx): string {
  const target = block.getInputTargetBlock('WARUNEK');
  if (!target) {
    throw new Error(`Do klocka „${label}” dołącz warunek.`);
  }
  return valueToCode(target, ctx);
}

function blockToLines(block: Block, indent: string, ctx: Ctx): string[] {
  const line = (code: string) => [`${indent}${code}`];
  switch (block.type) {
    case 'jedz': {
      needDrive(ctx.robot);
      const mm = Math.round(num(block, 'CM', 20) * 10);
      return line(`robot.straight(${block.getFieldValue('KIERUNEK') === 'tyl' ? -mm : mm})`);
    }
    case 'skrec': {
      needDrive(ctx.robot);
      const angle = Math.round(num(block, 'KAT', 90));
      return line(`robot.turn(${block.getFieldValue('STRONA') === 'lewo' ? -angle : angle})`);
    }
    case 'predkosc': {
      needDrive(ctx.robot);
      const pct = num(block, 'PROCENT', 50);
      return line(`robot.settings(straight_speed=${Math.round(pct * 4)}, turn_rate=${Math.round(pct * 3)})`);
    }
    case 'zapal_swiatlo':
      return line(`hub.light.on(Color.${block.getFieldValue('KOLOR')})`);
    case 'zgas_swiatlo':
      return line('hub.light.off()');
    case 'pokaz_obrazek':
      return line(`hub.display.icon(Icon.${block.getFieldValue('OBRAZEK')})`);
    case 'napisz':
      return line(`hub.display.text(${JSON.stringify(String(block.getFieldValue('TEKST') ?? ''))})`);
    case 'wyczysc_ekran':
      return line('hub.display.off()');
    case 'dzwiek': {
      const freq = Number(block.getFieldValue('TON')) || 500;
      return line(`hub.speaker.beep(${freq}, ${Math.round(num(block, 'SEK', 0.5) * 1000)})`);
    }
    case 'czekaj':
      return line(`wait(${Math.round(num(block, 'SEK', 1) * 1000)})`);
    case 'powtorz':
      return [`${indent}for _ in range(${Math.round(num(block, 'RAZY', 4))}):`, ...nestedLines(block, indent, 'pass', ctx)];
    case 'zawsze':
      return [`${indent}while True:`, ...nestedLines(block, indent, 'wait(10)', ctx)];
    case 'silnik_obroc': {
      const ref = motorRef(ctx.robot, block);
      const deg = Math.round(num(block, 'KAT', 90));
      const signed = block.getFieldValue('KIER') === 'lewo' ? -deg : deg;
      return line(`${ref}.run_angle(${MOTOR_SPEED}, ${signed})`);
    }
    case 'silnik_czas': {
      const ref = motorRef(ctx.robot, block);
      return line(`${ref}.run_time(${signedSpeed(block)}, ${Math.round(num(block, 'SEK', 1) * 1000)})`);
    }
    case 'silnik_na_zero':
      return line(`${motorRef(ctx.robot, block)}.run_target(${MOTOR_SPEED}, 0)`);
    case 'silnik_zeruj':
      return line(`${motorRef(ctx.robot, block)}.reset_angle(0)`);
    case 'silnik_luz':
      return line(`${motorRef(ctx.robot, block)}.stop()`);
    case 'czekaj_az':
      return [`${indent}while not (${conditionOf(block, 'czekaj aż', ctx)}):`, `${indent}${INDENT}wait(10)`];
    case 'jezeli':
      return [
        `${indent}if ${conditionOf(block, 'jeżeli', ctx)}:`,
        ...nestedLines(block, indent, 'pass', ctx),
      ];
    case 'jezeli_inaczej':
      return [
        `${indent}if ${conditionOf(block, 'jeżeli', ctx)}:`,
        ...nestedLines(block, indent, 'pass', ctx),
        `${indent}else:`,
        ...nestedLines(block, indent, 'pass', ctx, 'INACZEJ'),
      ];
    case 'powtarzaj_dopoki_nie':
      return [
        `${indent}while not (${conditionOf(block, 'powtarzaj, dopóki nie', ctx)}):`,
        ...nestedLines(block, indent, 'wait(10)', ctx),
      ];
    default:
      return line(`# nieznany klocek: ${block.type}`);
  }
}

export function testDriveProgram(robot: RobotProfile): string {
  needDrive(robot);
  return generateFullProgram(robot, 'robot.straight(200)');
}

export function testTurnProgram(robot: RobotProfile): string {
  needDrive(robot);
  return generateFullProgram(robot, 'robot.turn(90)');
}
