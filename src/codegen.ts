import type { Block, Workspace } from 'blockly';
import { START_TYPE } from './blockly/blocks.ts';
import { generateFullProgram } from './robot.ts';
import type { RobotProfile } from './types.ts';

const INDENT = '    ';

export function workspaceToPython(workspace: Workspace, robot: RobotProfile): string {
  const start = workspace.getBlocksByType(START_TYPE, false)[0];
  if (!start) {
    throw new Error('Brak klocka startu. Odśwież stronę.');
  }
  const lines = statementLines(start.getNextBlock(), '');
  const body = lines.length > 0 ? lines.join('\n') : 'wait(100)';
  return generateFullProgram(robot, body);
}

function statementLines(first: Block | null, indent: string): string[] {
  const lines: string[] = [];
  for (let block = first; block; block = block.getNextBlock()) {
    if (block.isEnabled()) {
      lines.push(...blockToLines(block, indent));
    }
  }
  return lines;
}

function nestedLines(block: Block, indent: string, idle: string): string[] {
  const inner = statementLines(block.getInputTargetBlock('DO'), indent + INDENT);
  return inner.length > 0 ? inner : [`${indent}${INDENT}${idle}`];
}

function num(block: Block, field: string, fallback: number): number {
  const value = Number(block.getFieldValue(field));
  return Number.isFinite(value) ? value : fallback;
}

function blockToLines(block: Block, indent: string): string[] {
  const line = (code: string) => [`${indent}${code}`];
  switch (block.type) {
    case 'jedz': {
      const mm = Math.round(num(block, 'CM', 20) * 10);
      return line(`robot.straight(${block.getFieldValue('KIERUNEK') === 'tyl' ? -mm : mm})`);
    }
    case 'skrec': {
      const angle = Math.round(num(block, 'KAT', 90));
      return line(`robot.turn(${block.getFieldValue('STRONA') === 'lewo' ? -angle : angle})`);
    }
    case 'predkosc': {
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
      return [
        `${indent}for _ in range(${Math.round(num(block, 'RAZY', 4))}):`,
        ...nestedLines(block, indent, 'pass'),
      ];
    case 'zawsze':
      return [`${indent}while True:`, ...nestedLines(block, indent, 'wait(10)')];
    default:
      return line(`# nieznany klocek: ${block.type}`);
  }
}

export function testDriveProgram(robot: RobotProfile): string {
  return generateFullProgram(robot, 'robot.straight(200)');
}

export function testTurnProgram(robot: RobotProfile): string {
  return generateFullProgram(robot, 'robot.turn(90)');
}
