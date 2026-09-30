import type { RobotProfile } from '../types.ts';

export interface PdfPart {
  id: string;
  label: string;
  url: string;
}

export interface ModelTemplate {
  id: string;
  name: string;
  description: string;
  image?: string;
  lessonUrl?: string;
  pdfs: PdfPart[];
  profile: RobotProfile;
  program: Record<string, unknown>;
}
