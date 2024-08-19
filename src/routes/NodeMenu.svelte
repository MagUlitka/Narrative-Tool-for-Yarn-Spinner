<script lang="ts">
    import { useEdges, useNodes } from '@xyflow/svelte';
  
    export let onClick: () => void;
    export let id: string;
    export let top: number | undefined;
    export let left: number | undefined;
    export let right: number | undefined;
    export let bottom: number | undefined;
  
    const allNodes = useNodes();
    const edges = useEdges();
    let lastId = $allNodes.at(-1)?.id == undefined ? 1 : $allNodes.at(-1)?.id;

    console.log(lastId);
  
    function duplicateNode() {
      const node = $allNodes.find((node) => node.id === id);
      console.log(node);
      if (node) {
       let foundNode = $allNodes.find((node) => parseInt(node.id) == lastId);
       console.log(foundNode);
       console.log(lastId);
       if(foundNode) {
        lastId = parseInt(foundNode.id) + 1;
       }
    console.log(lastId);
        $allNodes.push({
          ...node,
          id: `${lastId}`,
          position: {
            x: node.position.x,
            y: node.position.y + 50
          }
        });
      }
      $allNodes = $allNodes;
    }
    function deleteNode() {
      $allNodes = $allNodes.filter((node) => node.id !== id);
      $edges = $edges.filter((edge) => edge.source !== id && edge.target !== id);
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
    <button on:click={deleteNode}>edit</button>
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