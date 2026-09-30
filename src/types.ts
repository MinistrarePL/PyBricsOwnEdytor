export type PortId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export const PORTS: PortId[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export type DeviceKind = 'motor' | 'colorSensor' | 'distanceSensor' | 'forceSensor';

export const DEVICE_KIND_LABEL: Record<DeviceKind, string> = {
  motor: 'Silnik',
  colorSensor: 'Czujnik koloru',
  distanceSensor: 'Czujnik odległości',
  forceSensor: 'Czujnik nacisku',
};

export interface Device {
  id: string;
  name: string;
  kind: DeviceKind;
  port: PortId;
  reversed?: boolean;
}

export interface DriveBaseConfig {
  left: string;
  right: string;
  wheelDiameter: number;
  axleTrack: number;
  useGyro: boolean;
}

export interface RobotProfile {
  modelId: string;
  name: string;
  devices: Device[];
  driveBase?: DriveBaseConfig;
}

export function deviceVar(id: string): string {
  return `d_${id}`;
}

export function motorsOf(profile: RobotProfile): Device[] {
  return profile.devices.filter((device) => device.kind === 'motor');
}

export function deviceById(profile: RobotProfile, id: string): Device | undefined {
  return profile.devices.find((device) => device.id === id);
}
