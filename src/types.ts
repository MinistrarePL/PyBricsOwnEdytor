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
