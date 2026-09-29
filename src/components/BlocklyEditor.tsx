import * as Blockly from 'blockly';
import type { WorkspaceSvg } from 'blockly';
import { useEffect, useRef } from 'react';
import { createWorkspace } from '../blockly/blocks.ts';

interface Props {
  onReady: (workspace: WorkspaceSvg | null) => void;
}

export function BlocklyEditor({ onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }
    const workspace = createWorkspace(host);
    onReady(workspace);
    const observer = new ResizeObserver(() => Blockly.svgResize(workspace));
    observer.observe(host);
    return () => {
      observer.disconnect();
      onReady(null);
      workspace.dispose();
    };
  }, [onReady]);

  return <div ref={hostRef} className="absolute inset-0" />;
}
