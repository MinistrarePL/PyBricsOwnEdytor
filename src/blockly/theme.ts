import * as Blockly from 'blockly';

export const CATEGORY_COLOURS = {
  events: ['#FFBF00', '#E6AC00', '#CC9900'],
  movement: ['#FF4CCD', '#E644B8', '#CC3DA4'],
  light: ['#9966FF', '#855CD6', '#774DCB'],
  sound: ['#CF63CF', '#C94FC9', '#BD42BD'],
  control: ['#FFAB19', '#EC9C13', '#CF8B17'],
} as const;

export type CategoryKey = keyof typeof CATEGORY_COLOURS;

const blockStyles: Record<string, Partial<Blockly.Theme.BlockStyle>> = {};
const categoryStyles: Record<string, Blockly.Theme.CategoryStyle> = {};

for (const [key, [primary, secondary, tertiary]] of Object.entries(CATEGORY_COLOURS)) {
  blockStyles[`${key}_blocks`] = {
    colourPrimary: primary,
    colourSecondary: secondary,
    colourTertiary: tertiary,
  };
  categoryStyles[`${key}_category`] = { colour: primary };
}

export const spikeTheme = Blockly.Theme.defineTheme('spike', {
  name: 'spike',
  base: Blockly.Themes.Zelos,
  blockStyles,
  categoryStyles,
  componentStyles: {
    workspaceBackgroundColour: '#F4F7FC',
    toolboxBackgroundColour: '#FFFFFF',
    toolboxForegroundColour: '#334155',
    flyoutBackgroundColour: '#FFFFFF',
    flyoutForegroundColour: '#334155',
    flyoutOpacity: 0.97,
    scrollbarColour: '#CBD5E1',
    scrollbarOpacity: 0.8,
    insertionMarkerColour: '#1E293B',
    insertionMarkerOpacity: 0.25,
  },
  fontStyle: {
    family: '"Nunito Variable", "Nunito", system-ui, sans-serif',
    weight: '800',
    size: 13,
  },
  startHats: true,
});
