import defaults from './robot.json';
import type { PortId, RobotProfile } from './types.ts';
import { PORTS } from './types.ts';

const STORAGE_KEY = 'pybricks-junior-robot';

export const DEFAULT_ROBOT = defaults as RobotProfile;

export function loadRobot(): RobotProfile {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { ...DEFAULT_ROBOT, leftMotor: { ...DEFAULT_ROBOT.leftMotor }, rightMotor: { ...DEFAULT_ROBOT.rightMotor } };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<RobotProfile>;
    return sanitizeRobot({ ...DEFAULT_ROBOT, ...parsed });
  } catch {
    return { ...DEFAULT_ROBOT, leftMotor: { ...DEFAULT_ROBOT.leftMotor }, rightMotor: { ...DEFAULT_ROBOT.rightMotor } };
  }
}

export function saveRobot(profile: RobotProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeRobot(profile)));
}

export function clearRobotOverride(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function sanitizeRobot(profile: RobotProfile): RobotProfile {
  const leftPort = isPort(profile.leftMotor?.port) ? profile.leftMotor.port : DEFAULT_ROBOT.leftMotor.port;
  let rightPort = isPort(profile.rightMotor?.port) ? profile.rightMotor.port : DEFAULT_ROBOT.rightMotor.port;
  if (rightPort === leftPort) {
    rightPort = PORTS.find((p) => p !== leftPort) ?? DEFAULT_ROBOT.rightMotor.port;
  }
  return {
    name: profile.name?.trim() || DEFAULT_ROBOT.name,
    leftMotor: {
      port: leftPort,
      reversed: Boolean(profile.leftMotor?.reversed),
    },
    rightMotor: {
      port: rightPort,
      reversed: Boolean(profile.rightMotor?.reversed),
    },
    wheelDiameter: clampNumber(profile.wheelDiameter, 20, 120, DEFAULT_ROBOT.wheelDiameter),
    axleTrack: clampNumber(profile.axleTrack, 40, 250, DEFAULT_ROBOT.axleTrack),
    useGyro: Boolean(profile.useGyro),
  };
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

export function motorDirection(reversed: boolean): string {
  return reversed ? 'Direction.COUNTERCLOCKWISE' : 'Direction.CLOCKWISE';
}

export function generatePreamble(robot: RobotProfile): string {
  const leftDir = motorDirection(robot.leftMotor.reversed);
  const rightDir = motorDirection(robot.rightMotor.reversed);
  const gyro = robot.useGyro ? 'robot.use_gyro(True)\n' : '';
  return `from pybricks.hubs import PrimeHub
from pybricks.pupdevices import Motor
from pybricks.parameters import Direction, Port, Color, Icon
from pybricks.robotics import DriveBase
from pybricks.tools import wait

hub = PrimeHub()
left = Motor(Port.${robot.leftMotor.port}, ${leftDir})
right = Motor(Port.${robot.rightMotor.port}, ${rightDir})
robot = DriveBase(left, right, wheel_diameter=${robot.wheelDiameter}, axle_track=${robot.axleTrack})
${gyro}`;
}

export function generateFullProgram(robot: RobotProfile, body: string): string {
  return `${generatePreamble(robot)}${body.endsWith('\n') ? body : `${body}\n`}`;
}
