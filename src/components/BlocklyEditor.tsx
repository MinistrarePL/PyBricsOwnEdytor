import * as Blockly from 'blockly';
import type { WorkspaceSvg } from 'blockly';
import { useEffect, useRef } from 'react';
import { applyProfile, createWorkspace } from '../blockly/blocks.ts';
import type { RobotProfile } from '../types.ts';

interface Props {
  profile: RobotProfile;
  onReady: (workspace: WorkspaceSvg | null) => void;
}

export function BlocklyEditor({ profile, onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<WorkspaceSvg | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }
    const workspace = createWorkspace(host, profile);
    workspaceRef.current = workspace;
    onReady(workspace);
    const observer = new ResizeObserver(() => Blockly.svgResize(workspace));
    observer.observe(host);
    return () => {
      observer.disconnect();
      workspaceRef.current = null;
      onReady(null);
      workspace.dispose();
    };
    // Profile is applied in the effect below; creating twice would wipe the program.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReady]);

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (workspace) {
      applyProfile(workspace, profile);
    }
  }, [profile]);

  return <div ref={hostRef} className="absolute inset-0" />;
}
