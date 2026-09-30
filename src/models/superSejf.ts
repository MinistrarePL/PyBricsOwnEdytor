import type { RobotProfile } from '../types.ts';
import { legoPdf } from './assets.ts';
import { programFrom } from './builder.ts';
import type { ModelTemplate } from './types.ts';

export const SUPER_SEJF_PROFILE: RobotProfile = {
  modelId: 'super-sejf',
  name: 'Super-sejf',
  devices: [
    { id: 'pokretlo', name: 'pokrętło', kind: 'motor', port: 'B', reversed: false },
    { id: 'zamek', name: 'zamek', kind: 'motor', port: 'C', reversed: false },
    { id: 'oslona', name: 'osłona', kind: 'motor', port: 'E', reversed: false },
  ],
};

export const superSejfModel: ModelTemplate = {
  id: 'super-sejf',
  name: 'Super-sejf',
  description: 'Sejf z osłoną pokrętła. Otworzy się, gdy wciśniesz lewy przycisk i przekręcisz pokrętło.',
  image: './models/super-sejf.png',
  lessonUrl: 'https://education.lego.com/en-us/lessons/prime-kickstart-a-business/keep-it-really-safe/',
  pdfs: [
    {
      id: 'skrzynia',
      label: 'Skrzynia sejfu',
      url: legoPdf('blte3102a7d67a0841b/5f88030d25a3fc0c1a86b360/keep-it-really-safe-bi-pdf-book1of2.pdf'),
    },
    {
      id: 'drzwi',
      label: 'Drzwi i ramię',
      url: legoPdf('blt212982b019995689/5f8804bb18bf360ec7ca88d1/keep-it-really-safe-bi-pdf-book2of2.pdf'),
    },
  ],
  profile: SUPER_SEJF_PROFILE,
  program: programFrom([
    { type: 'dzwiek', fields: { TON: '250', SEK: 0.2 } },
    { type: 'dzwiek', fields: { TON: '1000', SEK: 0.2 } },
    { type: 'silnik_czas', fields: { URZ: 'zamek', KIER: 'lewo', SEK: 1 } },
    { type: 'silnik_na_zero', fields: { URZ: 'pokretlo' } },
    { type: 'silnik_na_zero', fields: { URZ: 'oslona' } },
    { type: 'silnik_zeruj', fields: { URZ: 'pokretlo' } },
    { type: 'silnik_luz', fields: { URZ: 'pokretlo' } },
    { type: 'pokaz_obrazek', fields: { OBRAZEK: 'FALSE' } },
    {
      type: 'powtarzaj_dopoki_nie',
      inputs: {
        WARUNEK: {
          type: 'i',
          inputs: {
            A: { type: 'przycisk_wcisniety', fields: { PRZYCISK: 'lewy' } },
            B: { type: 'silnik_kat_ponad', fields: { URZ: 'pokretlo', KAT: 180 } },
          },
        },
        DO: [
          { type: 'dzwiek', fields: { TON: '250', SEK: 0.2 } },
          { type: 'silnik_obroc', fields: { URZ: 'oslona', KIER: 'prawo', KAT: 15 } },
          { type: 'czekaj', fields: { SEK: 0.8 } },
        ],
      },
    },
    { type: 'pokaz_obrazek', fields: { OBRAZEK: 'TRUE' } },
    { type: 'silnik_na_zero', fields: { URZ: 'oslona' } },
    { type: 'silnik_czas', fields: { URZ: 'zamek', KIER: 'prawo', SEK: 1 } },
  ]),
};
