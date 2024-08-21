<script lang="ts" module="">
    import NodeData from "./StoryNode.svelte";
	  import { get, writable, type Writable } from "svelte/store";
    import { nodes } from "./stores";
	  import { useNodes } from "@xyflow/svelte";
    export let title: Writable<string> = writable('');
    export let id: string;
    export let content: Writable<Array<string>> = writable(Array());
    export let color: Writable<string> = writable("#ffffff");

    type Node = {
      id: string;
      data: NodeData;
      position: { x: number; y: number };
      }
    
    $: {
        const unsubscribe = nodes.subscribe(nodeArray => {
        const selectedNode = nodeArray.find(node => node.id === id);
        if (selectedNode) {
            console.log(selectedNode)
            const nodeData = selectedNode.data as NodeData;
            title = nodeData.title as Writable<string>;
            content =  nodeData.content as Writable<Array<string>>;
            color =  nodeData.color as Writable<string>;
        }
        return () => unsubscribe();
        })
    }

    $: updateNode({ title, content, color });

    function updateNode({title, content, color}: {
      title: Writable<string>;
      content: Writable<Array<string>>;
      color: Writable<string>;
    }) {
      const titleVal = title;
      const contentVal = content;
      const colorVal = color;

      nodes.update(nodeArray => {
          return nodeArray.map(node => {
            if (node.id === id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  title: titleVal,
                  content: contentVal,
                  color: colorVal
                }
              };
            }
            return node;
          });
        });
    }

</script>
<div class="updatenode__panel">
    <label>Title:</label>
    <input bind:value={$title}/>

    <label class="updatenode__bglabel">Color:</label>
    <input type="color" bind:value={$color}/>

    <label class="updatenode__content">Content:</label>
    <textarea bind:value={$content}></textarea>

  </div>

  <style>
    .updatenode__panel {
    position: absolute;
    left: 10px;
    top: 20%;
    z-index: 10;
    font-size: 12px;
    background-color: #eee;
    width: 25%;
    height: 50%;
}
  
    .updatenode__bglabel {
      margin-top: 10px;
    }
  
    .updatenode__content {
      margin-top: 10px;
      display: flex;
      align-items: center;
    }
  </style> 