<script lang="ts">
    import { useEdges, useNodes, useNodesData } from '@xyflow/svelte';
    import { get, writable, type Writable } from 'svelte/store';
    import NodeData from "./StoryNode.svelte";
    import { createEventDispatcher } from 'svelte';
    import { nodes } from './stores';

    export let onClick: () => void;
    export let id: string;
    export let top: number | undefined;
    export let left: number | undefined;
    export let right: number | undefined;
    export let bottom: number | undefined;

    export let nodeTitle: Writable<string> = writable('');
    export let nodeContent: Writable<Array<string>> = writable(Array());
    export let nodeColor: Writable<string> = writable("#ffffff");

    const dispatch = createEventDispatcher();
      $: {
        nodes.subscribe(nodeArray => {
          const selectedNode = nodeArray.find(node => node.id === id);
          if (selectedNode) {
            console.log(selectedNode)
             const nodeData = selectedNode.data as NodeData;
             nodeTitle = nodeData.title as Writable<string>;
             nodeContent =  nodeData.content as Writable<Array<string>>;
             nodeColor =  nodeData.color as Writable<string>;
            }
        })
       
    }
  
    const allNodes = useNodes();
    const allEdges = useEdges();
    let lastId = $allNodes.at(-1)?.id == undefined ? 1 : $allNodes.at(-1)?.id;

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
      $allEdges = $allEdges.filter((edge) => edge.source !== id && edge.target !== id);
    }


    //enables editPanel

    function editNode() {

      const node = $allNodes.find((node) => node.id === id);
      if(node){
        const title = nodeTitle;
        const content = nodeContent;
        const color = nodeColor;

        const editPanelData = { id: node.id, nodeTitle: title, content: content, color: color };
        dispatch('editnode', editPanelData);
        
        $allNodes = $allNodes;

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