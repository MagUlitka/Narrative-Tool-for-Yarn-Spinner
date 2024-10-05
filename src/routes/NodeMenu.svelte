<script lang="ts">
    import { useEdges, useNodes } from '@xyflow/svelte';
    import { get, writable, type Writable } from 'svelte/store';
    import NodeData from "./StoryNode.svelte";
    import { createEventDispatcher } from 'svelte';
    import { createNode, nodes } from './stores';

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
    const numberPattern = /(\d+)$/;

    function duplicateNode() {
      const node = $allNodes.find((node) => node.id === id);
      if (node) {
       let foundNode = $allNodes.find((node) => parseInt(node.id) == lastId);
       if(foundNode) {
        let newNode;
        lastId = parseInt(foundNode.id) + 1;
        if(nodeType == "story-node"){
          let duplicateTitle = get(nodeTitle);
          let titleExists = true;
          while (titleExists) {
          if (numberPattern.test(duplicateTitle)) {
            let match = duplicateTitle.match(numberPattern);
            duplicateTitle = duplicateTitle.replace(numberPattern, (parseInt(match[1]) + 1).toString());
          } else {
            duplicateTitle += 1;
          }
          titleExists = $allNodes.some(existingNode => {
            let existingNodeData = existingNode.data as NodeData;
            return get(existingNodeData.title) === duplicateTitle;
          });
        }
        
        newNode = createNode(
        nodeType, node.position.x + 100, node.position.y + 100, get(nodeColor), get(nodeDelta), get(nodeContent), duplicateTitle);
       }
       else {
        newNode = createNode(
        nodeType, node.position.x + 100, node.position.y + 100, get(nodeColor), get(nodeDelta), get(nodeContent));
       }
       $allNodes.push(newNode);
       }
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
      const cursorX = event.clientX;
      const cursorY = event.clientY;
      let newNode;
      if(event.target.value == "story-node"){
        let titleExists = true;
        let defaultTitle = 'default-title';
          while (titleExists) {
          if (numberPattern.test(defaultTitle)) {
            let match = defaultTitle.match(numberPattern);
            defaultTitle = defaultTitle.replace(numberPattern, (parseInt(match[1]) + 1).toString());
          } else {
            defaultTitle += 1;
          }
          titleExists = $allNodes.some(existingNode => {
            let existingNodeData = existingNode.data as NodeData;
            return get(existingNodeData.title) === defaultTitle;
          });
        }
        newNode = createNode(event.target.value, cursorX, cursorY, '#eeeeee',{ops: [
    { insert: 'default content'}]}, 'default content', defaultTitle);
      }
      else {
        newNode = createNode(event.target.value, cursorX, cursorY, '#454545',{ops: [
          { insert: 'default content'}]}, 'default content');
      }
      $allNodes.push(newNode);
      $allNodes = $allNodes;
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
    <button on:click={(event) => addNode(event)} value="choice-node">add choice node</button>
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