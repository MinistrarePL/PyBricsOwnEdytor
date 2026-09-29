import type { Workspace } from 'blockly';
import { DISTANCE_MM, type DistanceKey, type RobotProfile } from './types.ts';
import { generateFullProgram } from './robot.ts';

const COLORS: Record<string, string> = {
  czerwony: 'Color.RED',
  pomaranczowy: 'Color.ORANGE',
  zolty: 'Color.YELLOW',
  zielony: 'Color.GREEN',
  niebieski: 'Color.BLUE',
  fioletowy: 'Color.VIOLET',
  bialy: 'Color.WHITE',
  wylacz: '',
};

export function workspaceToPython(workspace: Workspace, robot: RobotProfile): string {
  const start = workspace.getBlocksByType('kiedy_start', false)[0];
  if (!start) {
    throw new Error('Brak bloku startu. Odśwież stronę.');
  }
  const lines: string[] = [];
  let block = start.getNextBlock();
  while (block) {
    lines.push(...blockToLines(block));
    block = block.getNextBlock();
  }
  const body = lines.length > 0 ? `${lines.join('\n')}\n` : 'wait(100)\n';
  return generateFullProgram(robot, body);
}

function blockToLines(block: BlocklyBlockLike): string[] {
  switch (block.type) {
    case 'jedz': {
      const dir = block.getFieldValue('KIERUNEK');
      const dist = block.getFieldValue('DYSTANS') as DistanceKey;
      const mm = DISTANCE_MM[dist] ?? DISTANCE_MM.srednio;
      const signed = dir === 'tyl' ? -mm : mm;
      return [`robot.straight(${signed})`];
    }
    case 'skrec': {
      const dir = block.getFieldValue('STRONA');
      const angle = dir === 'lewo' ? -90 : 90;
      return [`robot.turn(${angle})`];
    }
    case 'czekaj': {
      const sec = Number(block.getFieldValue('SEKUNDY')) || 1;
      return [`wait(${sec * 1000})`];
    }
    case 'zapal_swiatlo': {
      const color = block.getFieldValue('KOLOR');
      if (color === 'wylacz') {
        return ['hub.light.off()'];
      }
      return [`hub.light.on(${COLORS[color] ?? 'Color.GREEN'})`];
    }
    case 'controls_repeat_ext':
    case 'controls_repeat': {
      return ['# pominięto nieobsługiwany blok pętli'];
    }
    default:
      return [`# nieznany blok: ${block.type}`];
  }
}

interface BlocklyBlockLike {
  type: string;
  getFieldValue(name: string): string;
  getNextBlock(): BlocklyBlockLike | null;
}

export function testDriveProgram(robot: RobotProfile): string {
  return generateFullProgram(robot, 'robot.straight(200)\n');
}

export function testTurnProgram(robot: RobotProfile): string {
  return generateFullProgram(robot, 'robot.turn(90)\n');
}
