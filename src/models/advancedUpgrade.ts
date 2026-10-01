import type { RobotProfile } from '../types.ts';
import { legoPdf } from './assets.ts';
import { programFrom } from './builder.ts';
import type { ModelTemplate } from './types.ts';

/** Koła ~27,63 cm obwodu (PDF LEGO Advanced Driving Base). */
const WHEEL_DIAMETER_MM = 88;

export const ADVANCED_UPGRADE_PROFILE: RobotProfile = {
  modelId: 'advanced-upgrade',
  name: 'Robot z narzędziami',
  devices: [
    { id: 'lewe_kolo', name: 'lewe koło', kind: 'motor', port: 'A', reversed: false },
    { id: 'prawe_kolo', name: 'prawe koło', kind: 'motor', port: 'E', reversed: false },
    { id: 'plug', name: 'pług', kind: 'motor', port: 'C', reversed: false },
    { id: 'ramie', name: 'ramię', kind: 'motor', port: 'D', reversed: false },
  ],
  driveBase: {
    left: 'lewe_kolo',
    right: 'prawe_kolo',
    wheelDiameter: WHEEL_DIAMETER_MM,
    axleTrack: 160,
    useGyro: true,
  },
};

export const advancedUpgradeModel: ModelTemplate = {
  id: 'advanced-upgrade',
  name: 'Zaawansowany robot + narzędzia',
  description:
    'Lekcja Time for an Upgrade: najpierw złóż zaawansowaną bazę jezdną, potem pług i ramię z zestawu rozszerzeń.',
  image: './models/advanced-upgrade.png',
  lessonUrl: 'https://education.lego.com/en-us/lessons/prime-competition-ready/time-for-an-upgrade/',
  pdfs: [
    {
      id: 'baza-1',
      label: 'Baza 1/5',
      url: legoPdf('blt2d17fa746ea991e5/5ec8e83df11f7e3ed6d502d7/advanced-driving-base-bi-pdf-book1of5.pdf'),
    },
    {
      id: 'baza-2',
      label: 'Baza 2/5',
      url: legoPdf('bltaab3ff32deffc66d/5ec8e800f32b1a633f9052dd/advanced-driving-base-bi-pdf-book2of5.pdf'),
    },
    {
      id: 'baza-3',
      label: 'Baza 3/5',
      url: legoPdf('blt43751cee8daa89a7/5ec8e7f4f32b1a633f9052d7/advanced-driving-base-bi-pdf-book3of5.pdf'),
    },
    {
      id: 'baza-4',
      label: 'Baza 4/5',
      url: legoPdf('bltbaec24f63e4075fc/5ec8e806f555a00375660930/advanced-driving-base-bi-pdf-book4of5.pdf'),
    },
    {
      id: 'baza-5',
      label: 'Baza 5/5',
      url: legoPdf('bltdfc58a87376f5440/5ec8e868afa52a7b5193fda0/advanced-driving-base-bi-pdf-book5of5.pdf'),
    },
    {
      id: 'dozer',
      label: 'Pług',
      url: legoPdf('blt87d3e0928886e2f9/5ec8e994daab7c7c2a55503f/dozer-bi-pdf-book1of1.pdf'),
    },
    {
      id: 'lift-arm',
      label: 'Ramię',
      url: legoPdf('blt93af2e55087807c6/5ec8e99a6b4f987c36ce7603/lift-arm-bi-pdf-book1of1.pdf'),
    },
  ],
  profile: ADVANCED_UPGRADE_PROFILE,
  workspaceNote: [
    'Potrzebujesz SPIKE Prime i zestawu rozszerzeń (Expansion Set).',
    'Najpierw złóż bazę z kart 1–5, potem pług i ramię — na końcu zablokuj narzędzia czerwonymi łącznikami (jak w lekcji LEGO).',
    'Kable: koła A i E, pług C, ramię D.',
    'Program testowy z PDF podnosi i opuszcza oba narzędzia — po uruchomieniu obserwuj ramię i pług.',
  ],
  program: programFrom([
    { type: 'silnik_czas', fields: { URZ: 'ramie', KIER: 'lewo', SEK: 0.5 } },
    { type: 'silnik_czas', fields: { URZ: 'plug', KIER: 'lewo', SEK: 0.5 } },
    { type: 'silnik_obroc', fields: { URZ: 'ramie', KIER: 'prawo', KAT: 70 } },
    { type: 'silnik_obroc', fields: { URZ: 'plug', KIER: 'prawo', KAT: 70 } },
    { type: 'dzwiek', fields: { TON: '250', SEK: 0.2 } },
    { type: 'silnik_obroc', fields: { URZ: 'ramie', KIER: 'prawo', KAT: 180 } },
    { type: 'silnik_obroc', fields: { URZ: 'ramie', KIER: 'lewo', KAT: 180 } },
    { type: 'silnik_obroc', fields: { URZ: 'plug', KIER: 'prawo', KAT: 180 } },
    { type: 'silnik_obroc', fields: { URZ: 'plug', KIER: 'lewo', KAT: 180 } },
    { type: 'dzwiek', fields: { TON: '250', SEK: 0.2 } },
    { type: 'silnik_obroc', fields: { URZ: 'ramie', KIER: 'prawo', KAT: 180 } },
    { type: 'silnik_obroc', fields: { URZ: 'ramie', KIER: 'lewo', KAT: 180 } },
    { type: 'silnik_obroc', fields: { URZ: 'plug', KIER: 'prawo', KAT: 180 } },
    { type: 'silnik_obroc', fields: { URZ: 'plug', KIER: 'lewo', KAT: 180 } },
  ]),
};
