import type { RobotProfile } from '../types.ts';
import { EMPTY_PROGRAM } from './builder.ts';
import type { ModelTemplate } from './types.ts';

export const DRIVING_PROFILE: RobotProfile = {
  modelId: 'robot',
  name: 'Mój robot',
  devices: [
    { id: 'lewe_kolo', name: 'lewe koło', kind: 'motor', port: 'C', reversed: true },
    { id: 'prawe_kolo', name: 'prawe koło', kind: 'motor', port: 'D', reversed: false },
  ],
  driveBase: {
    left: 'lewe_kolo',
    right: 'prawe_kolo',
    wheelDiameter: 56,
    axleTrack: 115,
    useGyro: true,
  },
};

export const robotModel: ModelTemplate = {
  id: 'robot',
  name: 'Robot jeżdżący',
  description: 'Baza z dwoma kołami. Jedź, skręcaj i pokazuj obrazki na hubie.',
  image: './models/robot.png',
  pdfs: [],
  profile: DRIVING_PROFILE,
  program: EMPTY_PROGRAM,
};
