import * as Blockly from 'blockly';
import type { WorkspaceSvg } from 'blockly';
import { DEFAULT_ROBOT } from '../robot.ts';
import type { RobotProfile } from '../types.ts';
import { motorsOf } from '../types.ts';
import { iconField, iconUri, type IconName } from './icons.ts';
import { spikeTheme } from './theme.ts';

export const START_TYPE = 'start';
const STORAGE_KEY = 'pybricks-junior-workspace-v2';

let currentProfile: RobotProfile = DEFAULT_ROBOT;

export function getWorkspaceProfile(): RobotProfile {
  return currentProfile;
}

export function setWorkspaceProfile(profile: RobotProfile): void {
  currentProfile = profile;
}

const DIRECTION = [
  ['do przodu', 'przod'],
  ['do tyłu', 'tyl'],
];

const MOTOR_TURN: Blockly.MenuOption[] = [
  ['w prawo', 'prawo'],
  ['w lewo', 'lewo'],
];

const JSON_BLOCKS = [
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
    tooltip: 'Zapal światło wokół środkowego przycisku huba. Świeci, aż naciśniesz Stop.',
  },
  {
    type: 'zgas_swiatlo',
    message0: '%1 zgaś światło',
    args0: [iconField('bulb')],
    previousStatement: null,
    nextStatement: null,
    style: 'light_blocks',
    tooltip: 'Zgaś światło wokół środkowego przycisku huba.',
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
          ['✅ TAK', 'YES'],
          ['❌ NIE', 'NO'],
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
    tooltip: 'Pokaż obrazek na ekranie huba. Zostaje, aż naciśniesz Stop.',
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
  {
    type: 'przycisk_wcisniety',
    message0: '%1 przycisk %2 wciśnięty',
    args0: [
      iconField('button'),
      {
        type: 'field_dropdown',
        name: 'PRZYCISK',
        options: [
          ['lewy', 'lewy'],
          ['prawy', 'prawy'],
          ['lewy lub prawy', 'dowolny'],
        ],
      },
    ],
    output: 'Boolean',
    style: 'sensors_blocks',
    tooltip: 'Czy lewy albo prawy przycisk huba jest wciśnięty.',
  },
  {
    type: 'i',
    message0: '%1 i %2',
    args0: [
      { type: 'input_value', name: 'A', check: 'Boolean' },
      { type: 'input_value', name: 'B', check: 'Boolean' },
    ],
    output: 'Boolean',
    inputsInline: true,
    style: 'sensors_blocks',
    tooltip: 'Oba warunki muszą być prawdziwe.',
  },
  {
    type: 'lub',
    message0: '%1 lub %2',
    args0: [
      { type: 'input_value', name: 'A', check: 'Boolean' },
      { type: 'input_value', name: 'B', check: 'Boolean' },
    ],
    output: 'Boolean',
    inputsInline: true,
    style: 'sensors_blocks',
    tooltip: 'Wystarczy, że jeden warunek jest prawdziwy.',
  },
  {
    type: 'nie',
    message0: 'nie %1',
    args0: [{ type: 'input_value', name: 'A', check: 'Boolean' }],
    output: 'Boolean',
    inputsInline: true,
    style: 'sensors_blocks',
    tooltip: 'Odwraca warunek: tak staje się nie.',
  },
];

function motorOptions(): Blockly.MenuOption[] {
  const motors = motorsOf(currentProfile);
  if (motors.length === 0) {
    return [['(brak silnika)', '']];
  }
  return motors.map((device) => [`${device.name} (${device.port})`, device.id]);
}

function imageField(name: IconName): Blockly.FieldImage {
  return new Blockly.FieldImage(iconUri(name), 26, 26, '');
}

function defineDynamicBlocks(): void {
  Blockly.Blocks.silnik_obroc = {
    init() {
      this.appendDummyInput()
        .appendField(imageField('motor'))
        .appendField('silnik')
        .appendField(new Blockly.FieldDropdown(motorOptions), 'URZ')
        .appendField('obróć')
        .appendField(new Blockly.FieldDropdown(MOTOR_TURN), 'KIER')
        .appendField('o')
        .appendField(new Blockly.FieldNumber(90, 1, 3600, 1), 'KAT')
        .appendField('°');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('motors_blocks');
      this.setTooltip('Obróć silnik o podaną liczbę stopni.');
    },
  };

  Blockly.Blocks.silnik_czas = {
    init() {
      this.appendDummyInput()
        .appendField(imageField('motor'))
        .appendField('silnik')
        .appendField(new Blockly.FieldDropdown(motorOptions), 'URZ')
        .appendField('kręć')
        .appendField(new Blockly.FieldDropdown(MOTOR_TURN), 'KIER')
        .appendField('przez')
        .appendField(new Blockly.FieldNumber(1, 0.1, 30, 0.1), 'SEK')
        .appendField('s');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('motors_blocks');
      this.setTooltip('Kręć silnikiem przez chwilę.');
    },
  };

  Blockly.Blocks.silnik_na_zero = {
    init() {
      this.appendDummyInput()
        .appendField(imageField('motor'))
        .appendField('silnik')
        .appendField(new Blockly.FieldDropdown(motorOptions), 'URZ')
        .appendField('ustaw na pozycję 0');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('motors_blocks');
      this.setTooltip('Obróć silnik do pozycji zerowej.');
    },
  };

  Blockly.Blocks.silnik_zeruj = {
    init() {
      this.appendDummyInput()
        .appendField(imageField('motor'))
        .appendField('silnik')
        .appendField(new Blockly.FieldDropdown(motorOptions), 'URZ')
        .appendField('wyzeruj licznik');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('motors_blocks');
      this.setTooltip('Zapamiętaj obecną pozycję jako zero.');
    },
  };

  Blockly.Blocks.silnik_luz = {
    init() {
      this.appendDummyInput()
        .appendField(imageField('motor'))
        .appendField('silnik')
        .appendField(new Blockly.FieldDropdown(motorOptions), 'URZ')
        .appendField('puść luźno');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('motors_blocks');
      this.setTooltip('Silnik można kręcić ręką.');
    },
  };

  Blockly.Blocks.pokaz_obrot = {
    init() {
      this.appendDummyInput()
        .appendField(imageField('grid'))
        .appendField('pokaż obrót silnika')
        .appendField(new Blockly.FieldDropdown(motorOptions), 'URZ');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('light_blocks');
      this.setTooltip('Pokaż na hubie, o ile stopni obrócono silnik.');
    },
  };

  Blockly.Blocks.silnik_kat_ponad = {
    init() {
      this.appendDummyInput()
        .appendField(imageField('sensor'))
        .appendField('silnik')
        .appendField(new Blockly.FieldDropdown(motorOptions), 'URZ')
        .appendField('obrócony o więcej niż')
        .appendField(new Blockly.FieldNumber(180, 1, 3600, 1), 'KAT')
        .appendField('°');
      this.setOutput(true, 'Boolean');
      this.setStyle('sensors_blocks');
      this.setTooltip('Czy silnik został obrócony o więcej niż tyle stopni.');
    },
  };

  Blockly.Blocks.czekaj_az = {
    init() {
      this.appendValueInput('WARUNEK')
        .setCheck('Boolean')
        .appendField(imageField('clock'))
        .appendField('czekaj aż');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('control_blocks');
      this.setTooltip('Czekaj, aż warunek będzie prawdziwy.');
    },
  };

  Blockly.Blocks.jezeli = {
    init() {
      this.appendValueInput('WARUNEK').setCheck('Boolean').appendField(imageField('branch')).appendField('jeżeli');
      this.appendStatementInput('DO');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('control_blocks');
      this.setTooltip('Zrób klocki w środku tylko wtedy, gdy warunek jest prawdziwy.');
    },
  };

  Blockly.Blocks.jezeli_inaczej = {
    init() {
      this.appendValueInput('WARUNEK').setCheck('Boolean').appendField(imageField('branch')).appendField('jeżeli');
      this.appendStatementInput('DO');
      this.appendDummyInput().appendField('inaczej');
      this.appendStatementInput('INACZEJ');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('control_blocks');
      this.setTooltip('Jeśli warunek jest prawdziwy, zrób pierwsze klocki. Jeśli nie — drugie.');
    },
  };

  Blockly.Blocks.powtarzaj_dopoki_nie = {
    init() {
      this.appendValueInput('WARUNEK')
        .setCheck('Boolean')
        .appendField(imageField('repeat'))
        .appendField('powtarzaj, dopóki nie');
      this.appendStatementInput('DO');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('control_blocks');
      this.setTooltip('Powtarzaj klocki, aż warunek będzie prawdziwy.');
    },
  };
}

const CATEGORY_ICONS: Record<string, IconName> = {
  Ruch: 'arrowUp',
  Silniki: 'motor',
  Światło: 'bulb',
  Dźwięk: 'sound',
  Czujniki: 'sensor',
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
  Blockly.common.defineBlocksWithJsonArray(JSON_BLOCKS);
  defineDynamicBlocks();
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    SpikeCategory,
    true,
  );
}

function toolbox(profile: RobotProfile): Blockly.utils.toolbox.ToolboxInfo {
  const block = (type: string) => ({ kind: 'block', type });
  const contents: Blockly.utils.toolbox.ToolboxItemInfo[] = [];
  if (profile.driveBase) {
    contents.push({
      kind: 'category',
      name: 'Ruch',
      categorystyle: 'movement_category',
      contents: ['jedz', 'skrec', 'predkosc'].map(block),
    });
  }
  if (motorsOf(profile).length > 0) {
    contents.push({
      kind: 'category',
      name: 'Silniki',
      categorystyle: 'motors_category',
      contents: ['silnik_obroc', 'silnik_czas', 'silnik_na_zero', 'silnik_zeruj', 'silnik_luz'].map(block),
    });
  }
  contents.push(
    {
      kind: 'category',
      name: 'Światło',
      categorystyle: 'light_category',
      contents: ['zapal_swiatlo', 'zgas_swiatlo', 'pokaz_obrazek', 'napisz', 'wyczysc_ekran', ...(motorsOf(profile).length > 0 ? ['pokaz_obrot'] : [])].map(block),
    },
    {
      kind: 'category',
      name: 'Dźwięk',
      categorystyle: 'sound_category',
      contents: [block('dzwiek')],
    },
    {
      kind: 'category',
      name: 'Czujniki',
      categorystyle: 'sensors_category',
      contents: [
        ...['przycisk_wcisniety', ...(motorsOf(profile).length > 0 ? ['silnik_kat_ponad'] : []), 'i', 'lub', 'nie'].map(
          block,
        ),
      ],
    },
    {
      kind: 'category',
      name: 'Sterowanie',
      categorystyle: 'control_category',
      contents: ['czekaj', 'czekaj_az', 'jezeli', 'jezeli_inaczej', 'powtorz', 'powtarzaj_dopoki_nie', 'zawsze'].map(
        block,
      ),
    },
  );
  return { kind: 'categoryToolbox', contents };
}

export function applyProfile(workspace: WorkspaceSvg, profile: RobotProfile): void {
  setWorkspaceProfile(profile);
  workspace.updateToolbox(toolbox(profile));
  for (const block of workspace.getAllBlocks(false)) {
    const field = block.getField('URZ');
    field?.forceRerender();
  }
}

export function createWorkspace(host: HTMLElement, profile: RobotProfile): WorkspaceSvg {
  registerOnce();
  setWorkspaceProfile(profile);
  const workspace = Blockly.inject(host, {
    toolbox: toolbox(profile),
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

export function loadTemplate(workspace: WorkspaceSvg, state: Record<string, unknown>): void {
  Blockly.Events.disable();
  try {
    Blockly.serialization.workspaces.load(state, workspace);
    ensureStartBlock(workspace);
  } finally {
    Blockly.Events.enable();
  }
  workspace.scrollCenter();
  saveWorkspace(workspace);
}

export function isWorkspaceEmpty(workspace: WorkspaceSvg): boolean {
  const start = workspace.getBlocksByType(START_TYPE, false)[0];
  if (!start) {
    return true;
  }
  return !start.getNextBlock() && workspace.getTopBlocks(false).length <= 1;
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
