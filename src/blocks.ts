import * as Blockly from 'blockly';
import type { WorkspaceSvg } from 'blockly';

const START_TYPE = 'kiedy_start';
const STORAGE_KEY = 'pybricks-junior-workspace';

export function defineBlocks(): void {
  Blockly.common.defineBlocksWithJsonArray([
    {
      type: START_TYPE,
      message0: 'gdy uruchomisz program',
      nextStatement: null,
      colour: 210,
      hat: 'cap',
      tooltip: 'Program zaczyna się od tego bloku.',
    },
    {
      type: 'jedz',
      message0: 'jedź %1 %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'KIERUNEK',
          options: [
            ['do przodu', 'przod'],
            ['do tyłu', 'tyl'],
          ],
        },
        {
          type: 'field_dropdown',
          name: 'DYSTANS',
          options: [
            ['krótko', 'krotko'],
            ['średnio', 'srednio'],
            ['daleko', 'daleko'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 210,
      tooltip: 'Jedź prosto. Krótko = 15 cm, średnio = 30 cm, daleko = 50 cm.',
    },
    {
      type: 'skrec',
      message0: 'skręć w %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'STRONA',
          options: [
            ['prawo', 'prawo'],
            ['lewo', 'lewo'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Obróć się w miejscu o 90 stopni.',
    },
    {
      type: 'czekaj',
      message0: 'czekaj %1 s',
      args0: [
        {
          type: 'field_dropdown',
          name: 'SEKUNDY',
          options: [
            ['1', '1'],
            ['2', '2'],
            ['3', '3'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 160,
      tooltip: 'Poczekaj chwilę, zanim zrobisz następny krok.',
    },
    {
      type: 'zapal_swiatlo',
      message0: 'zapal światło %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'KOLOR',
          options: [
            ['zielone', 'zielony'],
            ['czerwone', 'czerwony'],
            ['niebieskie', 'niebieski'],
            ['żółte', 'zolty'],
            ['pomarańczowe', 'pomaranczowy'],
            ['fioletowe', 'fioletowy'],
            ['białe', 'bialy'],
            ['wyłącz', 'wylacz'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 45,
      tooltip: 'Zmień kolor lampki na hubie.',
    },
  ]);

}

export function toolbox(): Blockly.utils.toolbox.ToolboxInfo {
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Ruch',
        colour: '210',
        contents: [
          { kind: 'block', type: 'jedz' },
          { kind: 'block', type: 'skrec' },
        ],
      },
      {
        kind: 'category',
        name: 'Czas',
        colour: '160',
        contents: [{ kind: 'block', type: 'czekaj' }],
      },
      {
        kind: 'category',
        name: 'Hub',
        colour: '45',
        contents: [{ kind: 'block', type: 'zapal_swiatlo' }],
      },
    ],
  };
}

export function createWorkspace(host: HTMLElement): WorkspaceSvg {
  defineBlocks();
  const workspace = Blockly.inject(host, {
    toolbox: toolbox(),
    trashcan: true,
    renderer: 'zelos',
    move: { scrollbars: true, drag: true, wheel: true },
    zoom: { controls: true, wheel: true, startScale: 1.05, maxScale: 2, minScale: 0.4 },
    grid: { spacing: 24, length: 1, colour: '#d7e3f4', snap: true },
    theme: Blockly.Themes.Classic,
    sounds: false,
    media: './blockly-media/',
  });

  loadWorkspace(workspace);
  ensureStartBlock(workspace);
  workspace.addChangeListener((event) => {
    if (event.isUiEvent) {
      return;
    }
    if (event.type === Blockly.Events.FINISHED_LOADING) {
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
  saveWorkspace(workspace);
}

function ensureStartBlock(workspace: WorkspaceSvg): void {
  const existing = workspace.getBlocksByType(START_TYPE, false);
  if (existing.length === 0) {
    const block = workspace.newBlock(START_TYPE);
    block.initSvg();
    block.render();
    block.moveBy(48, 48);
    block.setDeletable(false);
    block.setMovable(true);
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
    const state = JSON.parse(raw) as Record<string, unknown>;
    Blockly.serialization.workspaces.load(state, workspace);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}
