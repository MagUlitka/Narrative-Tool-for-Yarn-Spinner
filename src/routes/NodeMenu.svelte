<script lang="ts">
    import { useEdges, useNodes, useNodesData, useSvelteFlow } from '@xyflow/svelte';
    import { get, writable, type Writable } from 'svelte/store';
    import NodeData from "./StoryNode.svelte";
    import { createEventDispatcher } from 'svelte';
    import { createNode, nodes } from './stores';
    import fitView from './+page.svelte';

    export let onClick: ({ detail: { event } }) => void;
    export let id: string = '0';
    export let top: number | undefined;
    export let left: number | undefined;
    export let right: number | undefined;
    export let bottom: number | undefined;

    export let nodeTitle: Writable<string> = writable('');
    export let nodeContent: Writable<string> = writable('');
    export let nodeColor: Writable<string> = writable("#ffffff");
    export let nodeType: string = '';
    export let nodeDelta: Writable<any> = writable({});

    const dispatch = createEventDispatcher();
      $: {
        nodes.subscribe(nodeArray => {
          const selectedNode = nodeArray.find(node => node.id === id);
          if (selectedNode) {
             const nodeData = selectedNode.data as NodeData;
             nodeType = selectedNode.type as string;
             nodeTitle = nodeData.title as Writable<string>;
             nodeContent =  nodeData.content as Writable<string>;
             nodeColor =  nodeData.color as Writable<string>;
             nodeDelta = nodeData.delta as Writable<any>;
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
       const newNode = createNode(
        nodeType, node.position.x + 100, node.position.y + 100, get(nodeTitle), get(nodeColor), get(nodeDelta), get(nodeContent))
       
        $allNodes.push(newNode);
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
        const delta = nodeDelta;

        const editPanelData = { id: node.id, nodeTitle: title, deltaInput: delta, content: content, color: color };
        dispatch('editnode', editPanelData);
        
        $allNodes = $allNodes;

  }
}

  function addNode(event) {
    if(left && top){
    const newNode = createNode(event.target.value, 200, 200, 'default-title', '#eeeeee',{}, '');
    $allNodes.push(newNode);
    $allNodes = $allNodes;

    // const { zoomIn, zoomOut, setZoom, fitView, setCenter, setViewport, getViewport, viewport } =
    // useSvelteFlow();

   

    // setViewport({x: left, y: top, zoom: 2});
    


    }

  }
  </script>
  
  <div
    style="top: {top}px; left: {left}px; right: {right}px; bottom: {bottom}px;"
    class="context-menu"
    on:click={onClick}
  >
    {#if id == '0'}
    <button on:click={(event) => addNode(event)} value="story-node">add story node</button>
    <button disabled on:click={(event) => addNode(event)} value="choice-node">add choice node</button>
    {:else}
    <p style="margin: 0.5em;">
      <small>node: {id}</small>
    </p>
    <button on:click={editNode}>edit</button>
    <button on:click={duplicateNode}>duplicate</button>
    <button on:click={deleteNode}>delete</button>
    {/if}
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