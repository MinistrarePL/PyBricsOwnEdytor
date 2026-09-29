/** Pybricks GATT UUIDs and command helpers. Based on pybricks-code (MIT). */

export const PYBRICKS_SERVICE_UUID = 'c5f50001-8280-46da-89f4-6d8051e4aeef';
export const PYBRICKS_COMMAND_EVENT_UUID = 'c5f50002-8280-46da-89f4-6d8051e4aeef';
export const PYBRICKS_HUB_CAPABILITIES_UUID = 'c5f50003-8280-46da-89f4-6d8051e4aeef';

export const DI_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb';
export const SW_REV_UUID = '00002a28-0000-1000-8000-00805f9b34fb';
export const FW_REV_UUID = '00002a26-0000-1000-8000-00805f9b34fb';

export const CommandType = {
  StopUserProgram: 0,
  StartUserProgram: 1,
  WriteUserProgramMeta: 3,
  WriteUserRam: 4,
} as const;

export const EventType = {
  StatusReport: 0,
  WriteStdout: 1,
} as const;

export const StatusFlag = {
  UserProgramRunning: 1 << 6,
} as const;

export const HubCapabilityFlag = {
  UserProgramMultiMpy6: 1 << 1,
} as const;

export function stopUserProgramCommand(): Uint8Array {
  return Uint8Array.of(CommandType.StopUserProgram);
}

export function startUserProgramCommand(slot?: number): Uint8Array {
  if (slot === undefined) {
    return Uint8Array.of(CommandType.StartUserProgram);
  }
  return Uint8Array.of(CommandType.StartUserProgram, slot);
}

export function writeUserProgramMetaCommand(size: number): Uint8Array {
  const msg = new Uint8Array(5);
  const view = new DataView(msg.buffer);
  view.setUint8(0, CommandType.WriteUserProgramMeta);
  view.setUint32(1, size, true);
  return msg;
}

export function writeUserRamCommand(offset: number, payload: Uint8Array): Uint8Array {
  const msg = new Uint8Array(5 + payload.byteLength);
  const view = new DataView(msg.buffer);
  view.setUint8(0, CommandType.WriteUserRam);
  view.setUint32(1, offset, true);
  msg.set(payload, 5);
  return msg;
}

export function parseStatusReport(data: DataView): {
  flags: number;
  runningProgId: number;
  selectedSlot: number;
} {
  return {
    flags: data.byteLength >= 5 ? data.getUint32(1, true) : 0,
    runningProgId: data.byteLength > 5 ? data.getUint8(5) : 0,
    selectedSlot: data.byteLength > 6 ? data.getUint8(6) : 0,
  };
}

export function unpackHubCapabilities(data: DataView): {
  maxCharSize: number;
  flags: number;
  maxUserProgramSize: number;
  slotCount: number;
} {
  const maxCharSize = data.getUint16(0, true);
  const flags = data.getUint32(2, true);
  const maxUserProgramSize = data.getUint32(6, true);
  const slotCount = data.byteLength >= 11 ? data.getUint8(10) : 0;
  return { maxCharSize, flags, maxUserProgramSize, slotCount };
}

export function protocolAtLeast(version: string, major: number, minor: number): boolean {
  const parts = version.split('.').map((p) => Number.parseInt(p, 10) || 0);
  const a = parts[0] ?? 0;
  const b = parts[1] ?? 0;
  return a > major || (a === major && b >= minor);
}
