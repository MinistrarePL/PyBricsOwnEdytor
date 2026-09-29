import {
  DI_SERVICE_UUID,
  FW_REV_UUID,
  HubCapabilityFlag,
  PYBRICKS_COMMAND_EVENT_UUID,
  PYBRICKS_HUB_CAPABILITIES_UUID,
  PYBRICKS_SERVICE_UUID,
  SW_REV_UUID,
  StatusFlag,
  parseStatusReport,
  protocolAtLeast,
  startUserProgramCommand,
  stopUserProgramCommand,
  unpackHubCapabilities,
  writeUserProgramMetaCommand,
  writeUserRamCommand,
} from './protocol.ts';

export interface HubStatus {
  connected: boolean;
  name: string;
  running: boolean;
  selectedSlot: number;
  protocolVersion: string;
  firmwareVersion: string;
}

export class HubError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HubError';
  }
}

export class PybricksHub {
  private server: BluetoothRemoteGATTServer | null = null;
  private control: BluetoothRemoteGATTCharacteristic | null = null;
  private decoder = new TextDecoder();

  name = '';
  protocolVersion = '';
  firmwareVersion = '';
  maxWriteSize = 20;
  maxProgramSize = 0;
  slotCount = 0;
  selectedSlot = 0;
  running = false;

  onStatus: ((status: HubStatus) => void) | null = null;
  onStdout: ((text: string) => void) | null = null;

  get connected(): boolean {
    return this.server?.connected === true;
  }

  private emitStatus(): void {
    this.onStatus?.({
      connected: this.connected,
      name: this.name,
      running: this.running,
      selectedSlot: this.selectedSlot,
      protocolVersion: this.protocolVersion,
      firmwareVersion: this.firmwareVersion,
    });
  }

  async connect(): Promise<void> {
    if (!navigator.bluetooth) {
      throw new HubError(
        'Ta przeglądarka nie obsługuje Web Bluetooth. Użyj Chrome lub Edge.',
      );
    }

    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [PYBRICKS_SERVICE_UUID] }],
      optionalServices: [DI_SERVICE_UUID],
    });

    if (!device.gatt) {
      throw new HubError('Hub nie udostępnia połączenia GATT.');
    }

    device.addEventListener('gattserverdisconnected', () => {
      this.resetConnection();
      this.emitStatus();
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(PYBRICKS_SERVICE_UUID);
    const control = await service.getCharacteristic(PYBRICKS_COMMAND_EVENT_UUID);
    const capsChar = await service.getCharacteristic(PYBRICKS_HUB_CAPABILITIES_UUID);
    const caps = unpackHubCapabilities(await capsChar.readValue());

    let protocolVersion = '1.2.0';
    let firmwareVersion = '';
    try {
      const di = await server.getPrimaryService(DI_SERVICE_UUID);
      const sw = await di.getCharacteristic(SW_REV_UUID);
      protocolVersion = this.decoder.decode(await sw.readValue()).trim();
      try {
        const fw = await di.getCharacteristic(FW_REV_UUID);
        firmwareVersion = this.decoder.decode(await fw.readValue()).trim();
      } catch {
        firmwareVersion = '';
      }
    } catch {
      // Some browsers hide Device Information; capabilities still work from v1.2.
    }

    if (!protocolAtLeast(protocolVersion, 1, 2)) {
      server.disconnect();
      throw new HubError(
        `Firmware Pybricks jest za stary (protokół ${protocolVersion}). Zaktualizuj go na code.pybricks.com.`,
      );
    }

    if ((caps.flags & HubCapabilityFlag.UserProgramMultiMpy6) === 0) {
      server.disconnect();
      throw new HubError(
        'Ten hub nie przyjmuje programów w formacie MPY v6. Zaktualizuj firmware Pybricks.',
      );
    }

    await control.startNotifications();
    control.addEventListener('characteristicvaluechanged', (event) => {
      const target = event.target as BluetoothRemoteGATTCharacteristic;
      const value = target.value;
      if (!value || value.byteLength === 0) {
        return;
      }
      const type = value.getUint8(0);
      if (type === 0) {
        const report = parseStatusReport(value);
        this.running = (report.flags & StatusFlag.UserProgramRunning) !== 0;
        this.selectedSlot = report.selectedSlot;
        this.emitStatus();
      } else if (type === 1) {
        const bytes = new Uint8Array(value.buffer, value.byteOffset + 1, value.byteLength - 1);
        this.onStdout?.(this.decoder.decode(bytes));
      }
    });

    this.server = server;
    this.control = control;
    this.name = device.name ?? 'Pybricks Hub';
    this.protocolVersion = protocolVersion;
    this.firmwareVersion = firmwareVersion;
    this.maxWriteSize = caps.maxCharSize;
    this.maxProgramSize = caps.maxUserProgramSize;
    this.slotCount = caps.slotCount;
    this.emitStatus();
  }

  async disconnect(): Promise<void> {
    if (this.server?.connected) {
      this.server.disconnect();
    }
    this.resetConnection();
    this.emitStatus();
  }

  async stop(): Promise<void> {
    await this.writeCommand(stopUserProgramCommand());
  }

  async downloadAndRun(program: Uint8Array): Promise<void> {
    if (!this.control) {
      throw new HubError('Najpierw połącz się z hubem.');
    }
    if (program.byteLength > this.maxProgramSize) {
      throw new HubError(
        `Program jest za duży (${program.byteLength} B, limit ${this.maxProgramSize} B).`,
      );
    }

    if (this.running) {
      await this.stop();
      await wait(150);
    }

    await this.writeCommand(writeUserProgramMetaCommand(0));

    const chunkSize = Math.max(1, this.maxWriteSize - 5);
    for (let offset = 0; offset < program.byteLength; offset += chunkSize) {
      const slice = program.subarray(offset, offset + chunkSize);
      await this.writeCommand(writeUserRamCommand(offset, slice));
    }

    await this.writeCommand(writeUserProgramMetaCommand(program.byteLength));

    const useSlot = this.slotCount > 0 || protocolAtLeast(this.protocolVersion, 1, 4);
    await this.writeCommand(
      useSlot ? startUserProgramCommand(this.selectedSlot) : startUserProgramCommand(),
    );
  }

  private async writeCommand(payload: Uint8Array): Promise<void> {
    if (!this.control) {
      throw new HubError('Brak połączenia z hubem.');
    }
    const buffer = payload.buffer.slice(
      payload.byteOffset,
      payload.byteOffset + payload.byteLength,
    ) as ArrayBuffer;
    if (this.control.writeValueWithResponse) {
      await this.control.writeValueWithResponse(buffer);
    } else {
      await this.control.writeValue(buffer);
    }
  }

  private resetConnection(): void {
    this.server = null;
    this.control = null;
    this.running = false;
    this.name = '';
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
