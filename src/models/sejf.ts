import type { RobotProfile } from '../types.ts';
import { legoPdf } from './assets.ts';
import { programFrom } from './builder.ts';
import type { ModelTemplate } from './types.ts';

export const SEJF_PROFILE: RobotProfile = {
  modelId: 'sejf',
  name: 'Sejf',
  devices: [
    { id: 'pokretlo', name: 'pokrętło', kind: 'motor', port: 'B', reversed: false },
    { id: 'zamek', name: 'zamek', kind: 'motor', port: 'C', reversed: false },
  ],
};

export const sejfModel: ModelTemplate = {
  id: 'sejf',
  name: 'Sejf',
  description: 'Zamek jedzie na pozycję 270°. Otwiera się po lewym przycisku i obrocie pokrętła o ponad 180°.',
  image: './models/sejf.png',
  lessonUrl: 'https://education.lego.com/en-us/lessons/prime-kickstart-a-business/keep-it-safe/',
  pdfs: [
    {
      id: 'skrzynia',
      label: 'Skrzynia sejfu',
      url: legoPdf('blt3ee6ec3b5bb66752/5f88027b69efd81ab4debf10/keep-ti-safe-bi-pdf-book1of2.pdf'),
    },
    {
      id: 'drzwi',
      label: 'Drzwi sejfu',
      url: legoPdf('bltd437f3c489eb2124/5f8802cbe787ed1c0227088b/keep-ti-safe-bi-pdf-book2of2.pdf'),
    },
  ],
  profile: SEJF_PROFILE,
  workspaceNote: [
    'Po starcie sejf się zamyka, a na hubie pojawia się krzyżyk (NIE).',
    'Naciśnij mały lewy przycisk obok dużego środkowego — nie wciskaj dużego, bo zatrzyma program.',
    'Potem kręć pokrętłem z przodu w prawo, aż silnik B przekroczy 180° (w aplikacji SPIKE widać to w Dashboardzie).',
    'Dopiero wtedy zamek się otworzy i zobaczysz ptaszka (TAK).',
  ],
  program: programFrom([
    { type: 'dzwiek', fields: { TON: '250', SEK: 0.5 } },
    { type: 'dzwiek', fields: { TON: '500', SEK: 0.5 } },
    { type: 'silnik_na_zero', fields: { URZ: 'zamek', KAT: 270, STOP: 'HOLD' } },
    { type: 'silnik_na_zero', fields: { URZ: 'pokretlo', KAT: 0, STOP: 'COAST' } },
    { type: 'silnik_zeruj', fields: { URZ: 'pokretlo' } },
    { type: 'pokaz_obrazek', fields: { OBRAZEK: 'FALSE' } },
    {
      type: 'czekaj_az',
      inputs: { WARUNEK: { type: 'przycisk_wcisniety', fields: { PRZYCISK: 'lewy' } } },
    },
    { type: 'dzwiek', fields: { TON: '500', SEK: 0.5 } },
    {
      type: 'czekaj_az',
      inputs: {
        WARUNEK: { type: 'silnik_kat_ponad', fields: { URZ: 'pokretlo', STRONA: 'prawo', KAT: 180 } },
      },
    },
    { type: 'dzwiek', fields: { TON: '250', SEK: 0.5 } },
    { type: 'silnik_czas', fields: { URZ: 'zamek', KIER: 'prawo', SEK: 1 } },
    { type: 'pokaz_obrazek', fields: { OBRAZEK: 'FALSE' } },
    { type: 'czekaj', fields: { SEK: 2 } },
    { type: 'pokaz_obrazek', fields: { OBRAZEK: 'TRUE' } },
    { type: 'czekaj', fields: { SEK: 5 } },
  ]),
};
