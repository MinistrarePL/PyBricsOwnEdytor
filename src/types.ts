export type PortId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export const PORTS: PortId[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export interface MotorConfig {
  port: PortId;
  reversed: boolean;
}

export interface RobotProfile {
  name: string;
  leftMotor: MotorConfig;
  rightMotor: MotorConfig;
  wheelDiameter: number;
  axleTrack: number;
  useGyro: boolean;
}

export const DISTANCE_MM = {
  krotko: 150,
  srednio: 300,
  daleko: 500,
} as const;

export type DistanceKey = keyof typeof DISTANCE_MM;
