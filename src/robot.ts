import { defaultProfile } from './models/index.ts';
import { DRIVING_PROFILE } from './models/robot.ts';
import type { Device, DeviceKind, PortId, RobotProfile } from './types.ts';
import { PORTS } from './types.ts';

const STORAGE_KEY = 'pybricks-junior-robot';

export const DEFAULT_ROBOT: RobotProfile = structuredClone(DRIVING_PROFILE);

const KINDS: DeviceKind[] = ['motor', 'colorSensor', 'distanceSensor', 'forceSensor'];
const ID_OK = /^[a-z][a-z0-9_]*$/;
const KIND_PL: Record<DeviceKind, string> = {
  motor: 'silnika',
  colorSensor: 'czujnika koloru',
  distanceSensor: 'czujnika odleglosci',
  forceSensor: 'czujnika nacisku',
};

export function loadRobot(): RobotProfile {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return structuredClone(DEFAULT_ROBOT);
  }
  try {
    return sanitizeRobot(migrate(JSON.parse(raw)));
  } catch {
    return structuredClone(DEFAULT_ROBOT);
  }
}

export function saveRobot(profile: RobotProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeRobot(profile)));
}

export function clearRobotOverride(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function resetToModelDefaults(modelId: string, keepName?: string): RobotProfile {
  const restored = defaultProfile(modelId);
  if (keepName?.trim()) {
    restored.name = keepName.trim();
  }
  saveRobot(restored);
  return restored;
}

export function sanitizeRobot(profile: RobotProfile): RobotProfile {
  const usedPorts = new Set<PortId>();
  const usedIds = new Set<string>();
  const devices: Device[] = [];

  for (const raw of profile.devices ?? []) {
    const kind: DeviceKind = KINDS.includes(raw.kind) ? raw.kind : 'motor';
    const id = uniqueId(raw.id, usedIds);
    usedIds.add(id);
    const port = uniquePort(isPort(raw.port) ? raw.port : 'A', usedPorts);
    usedPorts.add(port);
    devices.push({
      id,
      name: raw.name?.trim() || id,
      kind,
      port,
      reversed: kind === 'motor' ? Boolean(raw.reversed) : undefined,
    });
  }

  if (devices.length === 0) {
    return structuredClone(DEFAULT_ROBOT);
  }

  const name = profile.name?.trim() || DEFAULT_ROBOT.name;
  const modelId = profile.modelId?.trim() || 'robot';
  const drive = sanitizeDrive(profile.driveBase, devices);
  return drive ? { modelId, name, devices, driveBase: drive } : { modelId, name, devices };
}

function sanitizeDrive(
  drive: RobotProfile['driveBase'],
  devices: Device[],
): RobotProfile['driveBase'] | undefined {
  if (!drive) {
    return undefined;
  }
  const motorIds = devices.filter((d) => d.kind === 'motor').map((d) => d.id);
  if (motorIds.length < 2) {
    return undefined;
  }
  const left = motorIds.includes(drive.left) ? drive.left : motorIds[0];
  let right = motorIds.includes(drive.right) ? drive.right : (motorIds.find((id) => id !== left) ?? motorIds[1]);
  if (right === left) {
    right = motorIds.find((id) => id !== left) ?? motorIds[1];
  }
  if (right === left) {
    return undefined;
  }
  return {
    left,
    right,
    wheelDiameter: clampNumber(drive.wheelDiameter, 20, 120, 56),
    axleTrack: clampNumber(drive.axleTrack, 40, 250, 115),
    useGyro: Boolean(drive.useGyro),
  };
}

function migrate(raw: unknown): RobotProfile {
  if (!raw || typeof raw !== 'object') {
    return structuredClone(DEFAULT_ROBOT);
  }
  const data = raw as Record<string, unknown>;
  if (Array.isArray(data.devices)) {
    return data as unknown as RobotProfile;
  }
  const left = asMotor(data.leftMotor, 'C', true);
  const right = asMotor(data.rightMotor, 'D', false);
  return {
    modelId: 'robot',
    name: typeof data.name === 'string' ? data.name : DEFAULT_ROBOT.name,
    devices: [
      { id: 'lewe_kolo', name: 'lewe koło', kind: 'motor', port: left.port, reversed: left.reversed },
      { id: 'prawe_kolo', name: 'prawe koło', kind: 'motor', port: right.port, reversed: right.reversed },
    ],
    driveBase: {
      left: 'lewe_kolo',
      right: 'prawe_kolo',
      wheelDiameter: Number(data.wheelDiameter) || 56,
      axleTrack: Number(data.axleTrack) || 115,
      useGyro: data.useGyro !== false,
    },
  };
}

function asMotor(value: unknown, fallbackPort: PortId, fallbackReversed: boolean): { port: PortId; reversed: boolean } {
  if (!value || typeof value !== 'object') {
    return { port: fallbackPort, reversed: fallbackReversed };
  }
  const motor = value as { port?: unknown; reversed?: unknown };
  return {
    port: isPort(motor.port) ? motor.port : fallbackPort,
    reversed: Boolean(motor.reversed),
  };
}

function uniqueId(raw: unknown, used: Set<string>): string {
  const base = typeof raw === 'string' && ID_OK.test(raw) ? raw : 'urzadzenie';
  if (!used.has(base)) {
    return base;
  }
  let i = 2;
  while (used.has(`${base}_${i}`)) {
    i += 1;
  }
  return `${base}_${i}`;
}

function uniquePort(preferred: PortId, used: Set<PortId>): PortId {
  if (!used.has(preferred)) {
    return preferred;
  }
  return PORTS.find((port) => !used.has(port)) ?? preferred;
}

function isPort(value: unknown): value is PortId {
  return PORTS.includes(value as PortId);
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(n)));
}

function asciiName(name: string): string {
  return name.normalize('NFD').replace(/\p{M}/gu, '');
}

export function motorDirection(reversed: boolean): string {
  return reversed ? 'Direction.COUNTERCLOCKWISE' : 'Direction.CLOCKWISE';
}

const CLASS_BY_KIND: Record<DeviceKind, string> = {
  motor: 'Motor',
  colorSensor: 'ColorSensor',
  distanceSensor: 'UltrasonicSensor',
  forceSensor: 'ForceSensor',
};

export function generatePreamble(robot: RobotProfile): string {
  const classes = [...new Set(robot.devices.map((d) => CLASS_BY_KIND[d.kind]))];
  const needsDirection = robot.devices.some((d) => d.kind === 'motor');
  const needsDrive = Boolean(robot.driveBase);
  const params = ['Port', 'Color', 'Icon', 'Button'];
  if (needsDirection) {
    params.unshift('Direction');
  }

  const lines = [
    'from pybricks.hubs import PrimeHub',
    `from pybricks.pupdevices import ${classes.join(', ')}`,
    `from pybricks.parameters import ${params.join(', ')}`,
  ];
  if (needsDrive) {
    lines.push('from pybricks.robotics import DriveBase');
  }
  lines.push('from pybricks.tools import wait', '', 'hub = PrimeHub()');

  for (const device of robot.devices) {
    const cls = CLASS_BY_KIND[device.kind];
    const extra = device.kind === 'motor' ? `, ${motorDirection(Boolean(device.reversed))}` : '';
    const varName = `d_${device.id}`;
    const missing = `Brak ${KIND_PL[device.kind]} ${asciiName(device.name)} w porcie ${device.port}`;
    lines.push(
      'try:',
      `    ${varName} = ${cls}(Port.${device.port}${extra})`,
      'except OSError:',
      `    hub.display.text(${JSON.stringify(`${device.port}?`)})`,
      `    print(${JSON.stringify(missing)})`,
      '    while True:',
      '        wait(1000)',
    );
  }

  if (robot.driveBase) {
    lines.push(
      `robot = DriveBase(d_${robot.driveBase.left}, d_${robot.driveBase.right}, wheel_diameter=${robot.driveBase.wheelDiameter}, axle_track=${robot.driveBase.axleTrack})`,
    );
    if (robot.driveBase.useGyro) {
      lines.push('robot.use_gyro(True)');
    }
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function generateFullProgram(robot: RobotProfile, body: string): string {
  return `${generatePreamble(robot)}${body.endsWith('\n') ? body : `${body}\n`}`;
}
