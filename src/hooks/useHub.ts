import { useCallback, useEffect, useState } from 'react';
import { compilePython } from '../compile.ts';
import { PybricksHub } from '../hub.ts';
import type { Notify } from './useToasts.ts';

const hub = new PybricksHub();

export const bluetoothAvailable = typeof navigator !== 'undefined' && 'bluetooth' in navigator;

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useHub(notify: Notify) {
  const [connected, setConnected] = useState(hub.connected);
  const [running, setRunning] = useState(hub.running);
  const [name, setName] = useState(hub.name);
  const [connecting, setConnecting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    hub.onStatus = (status) => {
      setConnected(status.connected);
      setRunning(status.running);
      setName(status.name);
    };
    hub.onStdout = (chunk) => {
      const text = chunk.trim();
      if (text) {
        notify(text);
      }
    };
    return () => {
      hub.onStatus = null;
      hub.onStdout = null;
    };
  }, [notify]);

  const connect = useCallback(async (): Promise<boolean> => {
    setConnecting(true);
    try {
      await hub.connect();
      notify(`Połączono z ${hub.name}!`, 'success');
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        notify('Nie wybrano huba.');
      } else {
        notify(errorText(error), 'error');
      }
      return false;
    } finally {
      setConnecting(false);
    }
  }, [notify]);

  const disconnect = useCallback(async () => {
    await hub.disconnect();
    notify('Rozłączono hub.');
  }, [notify]);

  const run = useCallback(
    async (source: string): Promise<boolean> => {
      setUploading(true);
      try {
        const packed = await compilePython(source);
        await hub.downloadAndRun(packed);
        return true;
      } catch (error) {
        notify(errorText(error), 'error');
        return false;
      } finally {
        setUploading(false);
      }
    },
    [notify],
  );

  const stop = useCallback(async () => {
    try {
      await hub.stop();
    } catch (error) {
      notify(errorText(error), 'error');
    }
  }, [notify]);

  return { connected, running, name, connecting, uploading, connect, disconnect, run, stop };
}

export type HubControls = ReturnType<typeof useHub>;
