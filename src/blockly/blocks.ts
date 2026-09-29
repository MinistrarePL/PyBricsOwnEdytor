import * as Blockly from 'blockly';
import type { WorkspaceSvg } from 'blockly';
import { iconField, iconUri, type IconName } from './icons.ts';
import { spikeTheme } from './theme.ts';

export const START_TYPE = 'start';
const STORAGE_KEY = 'pybricks-junior-workspace-v2';

const DIRECTION = [
  ['do przodu', 'przod'],
  ['do tyłu', 'tyl'],
];

const BLOCKS = [
  {
    type: START_TYPE,
    message0: '%1 gdy program startuje',
    args0: [iconField('flag')],
    nextStatement: null,
    style: 'events_blocks',
    tooltip: 'Program zaczyna się od tego klocka.',
  },
  {
    type: 'jedz',
    message0: '%1 jedź %2 %3 cm',
    args0: [
      iconField('arrowUp'),
      { type: 'field_dropdown', name: 'KIERUNEK', options: DIRECTION },
      { type: 'field_number', name: 'CM', value: 20, min: 1, max: 500, precision: 1 },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'movement_blocks',
    tooltip: 'Jedź prosto o tyle centymetrów.',
  },
  {
    type: 'skrec',
    message0: '%1 skręć w %2 o %3',
    args0: [
      iconField('rotate'),
      {
        type: 'field_dropdown',
        name: 'STRONA',
        options: [
          ['prawo', 'prawo'],
          ['lewo', 'lewo'],
        ],
      },
      {
        type: 'field_dropdown',
        name: 'KAT',
        options: [
          ['90°', '90'],
          ['45°', '45'],
        ],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'movement_blocks',
    tooltip: 'Obróć się w miejscu. 90° to ćwierć obrotu, 45° to połowa tego.',
  },
  {
    type: 'predkosc',
    message0: '%1 prędkość: %2',
    args0: [
      iconField('gauge'),
      {
        type: 'field_dropdown',
        name: 'PROCENT',
        options: [
          ['wolno', '30'],
          ['średnio', '60'],
          ['szybko', '100'],
        ],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'movement_blocks',
    tooltip: 'Jak szybko ma jeździć i skręcać robot: wolno 30%, średnio 60%, szybko 100%.',
  },
  {
    type: 'zapal_swiatlo',
    message0: '%1 zapal światło %2',
    args0: [
      iconField('bulb'),
      {
        type: 'field_dropdown',
        name: 'KOLOR',
        options: [
          ['🟢 zielone', 'GREEN'],
          ['🔴 czerwone', 'RED'],
          ['🔵 niebieskie', 'BLUE'],
          ['🟡 żółte', 'YELLOW'],
          ['🟠 pomarańczowe', 'ORANGE'],
          ['🟣 fioletowe', 'VIOLET'],
          ['⚪ białe', 'WHITE'],
        ],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'light_blocks',
    tooltip: 'Zmień kolor lampki na hubie.',
  },
  {
    type: 'zgas_swiatlo',
    message0: '%1 zgaś światło',
    args0: [iconField('bulb')],
    previousStatement: null,
    nextStatement: null,
    style: 'light_blocks',
    tooltip: 'Wyłącz lampkę na hubie.',
  },
  {
    type: 'pokaz_obrazek',
    message0: '%1 pokaż obrazek %2',
    args0: [
      iconField('grid'),
      {
        type: 'field_dropdown',
        name: 'OBRAZEK',
        options: [
          ['😀 uśmiech', 'HAPPY'],
          ['🙁 smutek', 'SAD'],
          ['❤️ serce', 'HEART'],
          ['⬆️ strzałka w górę', 'UP'],
          ['⬇️ strzałka w dół', 'DOWN'],
          ['⬅️ strzałka w lewo', 'LEFT'],
          ['➡️ strzałka w prawo', 'RIGHT'],
        ],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'light_blocks',
    tooltip: 'Pokaż obrazek na ekranie huba.',
  },
  {
    type: 'napisz',
    message0: '%1 napisz %2',
    args0: [iconField('text'), { type: 'field_input', name: 'TEKST', text: 'Hej!' }],
    previousStatement: null,
    nextStatement: null,
    style: 'light_blocks',
    tooltip: 'Przewiń napis na ekranie huba. Najlepiej bez polskich liter.',
  },
  {
    type: 'wyczysc_ekran',
    message0: '%1 wyczyść ekran',
    args0: [iconField('grid')],
    previousStatement: null,
    nextStatement: null,
    style: 'light_blocks',
    tooltip: 'Zgaś ekran huba.',
  },
  {
    type: 'dzwiek',
    message0: '%1 zagraj dźwięk %2 przez %3 s',
    args0: [
      iconField('sound'),
      {
        type: 'field_dropdown',
        name: 'TON',
        options: [
          ['wysoki', '1000'],
          ['średni', '500'],
          ['niski', '250'],
        ],
      },
      { type: 'field_number', name: 'SEK', value: 0.5, min: 0.1, max: 5, precision: 0.1 },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'sound_blocks',
    tooltip: 'Hub zapiszczy.',
  },
  {
    type: 'czekaj',
    message0: '%1 czekaj %2 s',
    args0: [iconField('clock'), { type: 'field_number', name: 'SEK', value: 1, min: 0.1, max: 60, precision: 0.1 }],
    previousStatement: null,
    nextStatement: null,
    style: 'control_blocks',
    tooltip: 'Poczekaj chwilę, zanim zrobisz następny krok.',
  },
  {
    type: 'powtorz',
    message0: '%1 powtórz %2 razy',
    args0: [iconField('repeat'), { type: 'field_number', name: 'RAZY', value: 4, min: 1, max: 100, precision: 1 }],
    message1: '%1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null,
    nextStatement: null,
    style: 'control_blocks',
    tooltip: 'Zrób klocki w środku kilka razy.',
  },
  {
    type: 'zawsze',
    message0: '%1 powtarzaj zawsze',
    args0: [iconField('infinity')],
    message1: '%1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null,
    style: 'control_blocks',
    tooltip: 'Rób klocki w środku bez końca (aż naciśniesz Stop).',
  },
];

const CATEGORY_ICONS: Record<string, IconName> = {
  Ruch: 'arrowUp',
  Światło: 'bulb',
  Dźwięk: 'sound',
  Sterowanie: 'repeat',
};

class SpikeCategory extends Blockly.ToolboxCategory {
  protected override createIconDom_(): Element {
    const bubble = document.createElement('span');
    bubble.className = 'spikeCategoryBubble';
    const icon = CATEGORY_ICONS[this.name_];
    if (icon) {
      const img = document.createElement('img');
      img.src = iconUri(icon);
      img.alt = '';
      bubble.append(img);
    }
    return bubble;
  }

  protected override addColourBorder_(colour: string): void {
    this.rowDiv_?.style.setProperty('--cat-colour', colour);
  }

  override setSelected(isSelected: boolean): void {
    super.setSelected(isSelected);
    if (this.rowDiv_) {
      this.rowDiv_.style.backgroundColor = '';
    }
  }

  protected override openIcon_(): void {}

  protected override closeIcon_(): void {}
}

let registered = false;

function registerOnce(): void {
  if (registered) {
    return;
  }
  registered = true;
  Blockly.common.defineBlocksWithJsonArray(BLOCKS);
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    SpikeCategory,
    true,
  );
}

function toolbox(): Blockly.utils.toolbox.ToolboxInfo {
  const block = (type: string) => ({ kind: 'block', type });
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Ruch',
        categorystyle: 'movement_category',
        contents: ['jedz', 'skrec', 'predkosc'].map(block),
      },
      {
        kind: 'category',
        name: 'Światło',
        categorystyle: 'light_category',
        contents: ['zapal_swiatlo', 'zgas_swiatlo', 'pokaz_obrazek', 'napisz', 'wyczysc_ekran'].map(block),
      },
      {
        kind: 'category',
        name: 'Dźwięk',
        categorystyle: 'sound_category',
        contents: ['dzwiek'].map(block),
      },
      {
        kind: 'category',
        name: 'Sterowanie',
        categorystyle: 'control_category',
        contents: ['czekaj', 'powtorz', 'zawsze'].map(block),
      },
    ],
  };
}

export function createWorkspace(host: HTMLElement): WorkspaceSvg {
  registerOnce();
  const workspace = Blockly.inject(host, {
    toolbox: toolbox(),
    theme: spikeTheme,
    renderer: 'zelos',
    trashcan: true,
    sounds: true,
    media: './blockly-media/',
    move: { scrollbars: true, drag: true, wheel: true },
    zoom: { controls: true, wheel: false, pinch: true, startScale: 1, maxScale: 1.8, minScale: 0.5 },
    grid: { spacing: 32, length: 3, colour: '#DCE3EE', snap: false },
  });

  loadWorkspace(workspace);
  ensureStartBlock(workspace);
  workspace.addChangeListener((event) => {
    if (event.isUiEvent || event.type === Blockly.Events.FINISHED_LOADING) {
      return;
    }
    ensureStartBlock(workspace);
    saveWorkspace(workspace);
  });
  return workspace;
}

export function resetWorkspace(workspace: WorkspaceSvg): void {
  workspace.clear();
  ensureStartBlock(workspace);
  workspace.scrollCenter();
  saveWorkspace(workspace);
}

function ensureStartBlock(workspace: WorkspaceSvg): void {
  const existing = workspace.getBlocksByType(START_TYPE, false);
  if (existing.length === 0) {
    const block = workspace.newBlock(START_TYPE);
    block.initSvg();
    block.render();
    block.moveBy(60, 60);
    block.setDeletable(false);
    return;
  }
  for (const block of existing) {
    block.setDeletable(false);
  }
}

function saveWorkspace(workspace: WorkspaceSvg): void {
  const state = Blockly.serialization.workspaces.save(workspace);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadWorkspace(workspace: WorkspaceSvg): void {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }
  try {
    Blockly.serialization.workspaces.load(JSON.parse(raw) as Record<string, unknown>, workspace);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}
