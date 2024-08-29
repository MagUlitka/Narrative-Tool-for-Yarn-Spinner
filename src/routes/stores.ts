import { writable } from "svelte/store";
import type { Node } from '@xyflow/svelte'; 


let lastId = 0;

function getNextId(): number {
  lastId += 1;
  return lastId;
}

export function createNode(type: string, x: number, y: number, title: string, color: string, delta: any, content: string): Node {
  return {
    id: `${getNextId()}`,
    type,
    position: { x, y },
    data: {
      title: writable(title),
      color: writable(color),
      delta: writable(delta),
      content: writable(content)
    }
  };
}

export const nodes = writable<Node[]>([ 
  createNode('story-node', 100, 100, 'New Node1', '#ffffff', {ops: [
    { insert: 'aaaaa'}
  ]},'aaaaa'), 
  createNode('story-node', 200, 200, 'New Node2', '#eeeeee', {}, '')
]);


function addNode() {
  nodes.subscribe(allNodes => {
    const newNode = createNode(
      'story-node',    
      100,             
      100,             
      'New Node',      
      '#ffffff',
      {},      
      ''               
    );

    nodes.set([
      ...allNodes,
      {
        ...newNode,
        position: {
          x: newNode.position.x + 100,
          y: newNode.position.y + 100
        }
      }
    ]);
  });
}

export const edges = writable([]);


