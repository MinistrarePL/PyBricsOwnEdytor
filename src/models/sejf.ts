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
  description: 'Zamknij sejf, a potem otwórz go małym przyciskiem huba i obrotem pokrętła.',
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
  program: programFrom([
    { type: 'dzwiek', fields: { TON: '250', SEK: 0.2 } },
    { type: 'dzwiek', fields: { TON: '1000', SEK: 0.2 } },
    { type: 'silnik_czas', fields: { URZ: 'zamek', KIER: 'lewo', SEK: 1 } },
    { type: 'silnik_zeruj', fields: { URZ: 'pokretlo' } },
    { type: 'silnik_luz', fields: { URZ: 'pokretlo' } },
    { type: 'pokaz_obrazek', fields: { OBRAZEK: 'NO' } },
    {
      type: 'czekaj_az',
      inputs: { WARUNEK: { type: 'przycisk_wcisniety', fields: { PRZYCISK: 'dowolny' } } },
    },
    { type: 'dzwiek', fields: { TON: '500', SEK: 0.2 } },
    {
      type: 'powtarzaj_dopoki_nie',
      inputs: {
        WARUNEK: { type: 'silnik_kat_ponad', fields: { URZ: 'pokretlo', KAT: 90 } },
        DO: [
          { type: 'pokaz_obrot', fields: { URZ: 'pokretlo' } },
          { type: 'czekaj', fields: { SEK: 0.1 } },
        ],
      },
    },
    { type: 'dzwiek', fields: { TON: '1000', SEK: 0.2 } },
    { type: 'silnik_czas', fields: { URZ: 'zamek', KIER: 'prawo', SEK: 1 } },
    { type: 'pokaz_obrazek', fields: { OBRAZEK: 'YES' } },
  ]),
};
