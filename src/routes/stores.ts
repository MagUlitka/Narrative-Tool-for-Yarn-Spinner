import { writable, type Writable } from "svelte/store";
import { getIncomers, type Edge, type Node } from '@xyflow/svelte';

type NodeReference = {
  nodeRef: HTMLDivElement | null;
};

export type Variable = {
  name: Writable<string>;
  type: Writable<string>;
  declaredValue: Writable<any>;
  currentValue: Writable<any>;
  isEdited: Writable<boolean>;
}

export type Condition = {
  number: number;
  var1Type: string;
  var1: any;
  comparison: string;
  var2Type: string;
  var2: any;
  funcArgs1: Array<any>;
  funcArgs2: Array<any>;
  logicOp?: string;

}


let lastId = 0;

function getNextId(): number {
  lastId += 1;
  return lastId;
}

export function createNode(type: string, x: number, y: number, color: string, delta: any, content: string, title?: string): Node {
  const newId = `${getNextId()}`;
  return {
    id: newId,
    type,
    position: { x, y },
    data: {
      title: writable(title),
      color: writable(color),
      delta: writable(delta),
      content: writable(content),
      nodeId: newId,
      outgoers: null
    }
  };
}

export const nodes = writable<Node[]>([ 
  createNode('story-node', 100, 100, '#ffffff', {ops: [
    { insert: 'aaaaa'}
  ]},'aaaaa', 'New_Node1'), 
  createNode('choice-node', 200, 200, '#454545', {ops: [
    { insert: 'How could I lie to you?'}
  ]}, 'How could I lie to you?')
]);

export const nodeRefs = writable<NodeReference[]>([]);
export const edges = writable<Edge[]>([]);

export let variables: Writable<Array<Variable>> = writable([]);
export let conditions: Writable<Array<Condition>> = writable([]);
export let focusedNodeContent: Writable<string> = writable("");
export let isGlobalMode: Writable<boolean> = writable(true);

export const codeGenerationTriggered: Writable<boolean> = writable(false);
export let startNode: Writable<string> = writable('');
export let generatedCode: Writable<string> = writable('');


