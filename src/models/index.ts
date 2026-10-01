import { advancedUpgradeModel } from './advancedUpgrade.ts';
import { robotModel } from './robot.ts';
import { sejfModel } from './sejf.ts';
import { superSejfModel } from './superSejf.ts';
import type { ModelTemplate } from './types.ts';
import type { RobotProfile } from '../types.ts';

export type { ModelTemplate, PdfPart } from './types.ts';

export const MODELS: ModelTemplate[] = [robotModel, advancedUpgradeModel, sejfModel, superSejfModel];

export function getModel(id: string): ModelTemplate | undefined {
  return MODELS.find((model) => model.id === id);
}

export function cloneProfile(profile: RobotProfile): RobotProfile {
  return structuredClone(profile);
}

export function defaultProfile(modelId: string): RobotProfile {
  const model = getModel(modelId) ?? robotModel;
  return cloneProfile(model.profile);
}
