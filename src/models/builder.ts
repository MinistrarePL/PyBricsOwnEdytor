export type Fields = Record<string, string | number | boolean>;

export interface BlockNode {
  type: string;
  fields?: Fields;
  inputs?: Record<string, BlockNode | BlockNode[]>;
  next?: BlockNode;
}

function serializeNode(node: BlockNode): Record<string, unknown> {
  const block: Record<string, unknown> = { type: node.type };
  if (node.fields) {
    block.fields = node.fields;
  }
  if (node.inputs) {
    const inputs: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(node.inputs)) {
      if (Array.isArray(value)) {
        const inner = chain(value);
        if (inner) {
          inputs[name] = { block: serializeNode(inner) };
        }
      } else {
        inputs[name] = { block: serializeNode(value) };
      }
    }
    if (Object.keys(inputs).length > 0) {
      block.inputs = inputs;
    }
  }
  if (node.next) {
    block.next = { block: serializeNode(node.next) };
  }
  return block;
}

export function chain(nodes: BlockNode[]): BlockNode | undefined {
  if (nodes.length === 0) {
    return undefined;
  }
  const [head, ...tail] = nodes;
  const rest = chain(tail);
  return rest ? { ...head, next: rest } : { ...head };
}

export function programFrom(steps: BlockNode[]): Record<string, unknown> {
  const body = chain(steps);
  const start: Record<string, unknown> = {
    type: 'start',
    x: 60,
    y: 60,
    deletable: false,
  };
  if (body) {
    start.next = { block: serializeNode(body) };
  }
  return {
    blocks: {
      languageVersion: 0,
      blocks: [start],
    },
  };
}

export const EMPTY_PROGRAM = programFrom([]);
