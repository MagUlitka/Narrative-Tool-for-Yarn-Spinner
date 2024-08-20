<script lang="ts">
    import { useEdges, useNodes, useNodesData } from '@xyflow/svelte';
    import NodeEditPanel from './NodeEditPanel.svelte';
    import { writable, type Writable } from 'svelte/store';
	import StoryNode from './StoryNode.svelte';
  import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
  
    export let onClick: () => void;
    export let id: string;
    export let top: number | undefined;
    export let left: number | undefined;
    export let right: number | undefined;
    export let bottom: number | undefined;
  
    const allNodes = useNodes();
    const edges = useEdges();
    let lastId = $allNodes.at(-1)?.id == undefined ? 1 : $allNodes.at(-1)?.id;
    let editedNode = $allNodes.find((node) => node.id === id) === undefined ? $allNodes.find((node) => parseInt(node.id) === 1) : $allNodes.find((node) => node.id === id);

    export let title = writable('' || editedNode?.data.title);
    export let content = writable('' || editedNode?.data.content);  
    export let color = writable(editedNode?.data.color || '#000000');  

    function duplicateNode() {
      const node = $allNodes.find((node) => node.id === id);
      if (node) {
       let foundNode = $allNodes.find((node) => parseInt(node.id) == lastId);
       if(foundNode) {
        lastId = parseInt(foundNode.id) + 1;
       }
        $allNodes.push({
          ...node,
          id: `${lastId}`,
          position: {
            x: node.position.x + 100,
            y: node.position.y + 100
          }
        });
      }
      $allNodes = $allNodes;
    }
    function deleteNode() {
      $allNodes = $allNodes.filter((node) => node.id !== id);
      $edges = $edges.filter((edge) => edge.source !== id && edge.target !== id);
    }

    function editNode() {
      const node = $allNodes.find((node) => node.id === id);
      console.log(node);
      if(node){
      const title = writable(node.data.title ?? '');
      const content = writable(node.data.content ?? '');
      const color = writable(node.data.color ?? '#000000');

      const editPanelData = { id: node.id, title, content, color };
      dispatch('editnode', editPanelData);
    }  
    }

    
      
  </script>
  
  <div
    style="top: {top}px; left: {left}px; right: {right}px; bottom: {bottom}px;"
    class="context-menu"
    on:click={onClick}
  >
    <p style="margin: 0.5em;">
      <small>node: {id}</small>
    </p>
    <button on:click={editNode}>edit</button>
    <button on:click={duplicateNode}>duplicate</button>
    <button on:click={deleteNode}>delete</button>
  </div>
 
  
  <style>
    .context-menu {
      background: white;
      border-style: solid;
      box-shadow: 10px 19px 20px rgba(0, 0, 0, 10%);
      position: absolute;
      z-index: 10;
    }
  
    .context-menu button {
      border: none;
      display: block;
      padding: 0.5em;
      text-align: left;
      width: 100%;
    }
  
    .context-menu button:hover {
      background: white;
    }
  </style>