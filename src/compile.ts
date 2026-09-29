import { compile as mpyCrossCompile } from '@pybricks/mpy-cross-v6';
import wasmUrl from '@pybricks/mpy-cross-v6/build/mpy-cross-v6.wasm?url';

const encoder = new TextEncoder();

export async function compilePython(source: string, moduleName = '__main__'): Promise<Uint8Array> {
  const result = await mpyCrossCompile(`${moduleName}.py`, source, undefined, wasmUrl);
  if (result.status !== 0 || !result.mpy) {
    const details = [...result.err, ...result.out].join('\n').trim();
    throw new Error(details || 'Kompilacja MicroPython nie powiodła się.');
  }
  return packMultiMpy(moduleName, result.mpy);
}

/** Pybricks multi-file MPY v6 blob: size + name\\0 + mpy bytes. */
function packMultiMpy(moduleName: string, mpy: Uint8Array): Uint8Array {
  const nameBytes = encoder.encode(`${moduleName}\0`);
  const packed = new Uint8Array(4 + nameBytes.length + mpy.byteLength);
  const view = new DataView(packed.buffer);
  view.setUint32(0, mpy.byteLength, true);
  packed.set(nameBytes, 4);
  packed.set(mpy, 4 + nameBytes.length);
  return packed;
}
