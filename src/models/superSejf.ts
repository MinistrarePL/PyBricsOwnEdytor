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
  description: 'Jak w PDF LEGO: osłona schodzi w pętli, a sejf otwiera się tylko gdy w 5 s wciśniesz lewy przycisk i obrócisz pokrętło o ponad 180°.',
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
  workspaceNote: [
    'Po starcie sejf się zamyka, osłona wraca na górę, potem zaczyna schodzić w dół — to normalne.',
    'Nie czekaj, aż osłona opadnie! Od razu, gdy zaczyna schodzić: trzymaj mały lewy przycisk i kręć pokrętłem w prawo.',
    'Musisz zrobić obie rzeczy naraz i w ciągu około 5 sekund, zanim program uzna, że nie zdążyłeś.',
    'Sejf otworzy się tylko wtedy, gdy pokrętło przekroczy 180° przy wciśniętym lewym przycisku — wtedy zamek się odsunie i na hubie będzie ptaszek (TAK).',
    'Duży środkowy przycisk zatrzymuje program — używaj tylko małego lewego.',
  ],
  program: programFrom([
    { type: 'dzwiek', fields: { TON: '250', SEK: 0.2 } },
    { type: 'dzwiek', fields: { TON: '500', SEK: 0.2 } },
    { type: 'silnik_czas', fields: { URZ: 'zamek', KIER: 'lewo', SEK: 1 } },
    { type: 'silnik_na_zero', fields: { URZ: 'pokretlo', KAT: 0, STOP: 'COAST' } },
    { type: 'silnik_zeruj', fields: { URZ: 'pokretlo' } },
    { type: 'silnik_na_zero', fields: { URZ: 'oslona', KAT: 0, STOP: 'HOLD' } },
    { type: 'pokaz_obrazek', fields: { OBRAZEK: 'FALSE' } },
    { type: 'stoper_zeruj' },
    {
      type: 'powtarzaj_dopoki_nie',
      inputs: {
        WARUNEK: {
          type: 'i',
          inputs: {
            A: { type: 'przycisk_wcisniety', fields: { PRZYCISK: 'lewy' } },
            B: { type: 'silnik_kat_ponad', fields: { URZ: 'pokretlo', STRONA: 'prawo', KAT: 180 } },
          },
        },
        DO: [
          { type: 'dzwiek', fields: { TON: '250', SEK: 0.2 } },
          { type: 'silnik_obroc', fields: { URZ: 'oslona', KIER: 'prawo', KAT: 15 } },
          { type: 'czekaj', fields: { SEK: 0.8 } },
        ],
      },
    },
    {
      type: 'jezeli',
      inputs: {
        WARUNEK: { type: 'stoper_minelo', fields: { SEK: 5 } },
        DO: [
          { type: 'dzwiek', fields: { TON: '250', SEK: 0.5 } },
          { type: 'zatrzymaj' },
        ],
      },
    },
    { type: 'pokaz_obrazek', fields: { OBRAZEK: 'TRUE' } },
    { type: 'silnik_na_zero', fields: { URZ: 'oslona', KAT: 0, STOP: 'HOLD' } },
    { type: 'silnik_czas', fields: { URZ: 'zamek', KIER: 'prawo', SEK: 1 } },
    { type: 'dzwiek', fields: { TON: '1000', SEK: 0.4 } },
  ]),
};
