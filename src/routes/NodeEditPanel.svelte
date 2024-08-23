<script lang="ts" module="">
    import NodeData from "./StoryNode.svelte";
	  import { get, writable, type Writable } from "svelte/store";
    import { nodes } from "./stores";
    import 'quill/dist/quill.snow.css';
	import type Quill  from "quill";
  import { onDestroy, onMount } from 'svelte';
  
    export let title: Writable<string> = writable('');
    export let id: string;
    export let content: Writable<string> = writable('');
    export let color: Writable<string> = writable("#ffffff");

    export let deltaInput: Writable<any> = writable({});

    let quill:  Quill | null;

    let lastSelectedNodeId: string | null = null;

    let editorElement: HTMLDivElement | null = null;
    export let panelRef: HTMLDivElement | null = null;

    onMount(() => {
    if (typeof document !== 'undefined' && editorElement) {
      import('quill').then((module) => {
        const Quill = module.default;
        if(editorElement){
        quill = new Quill('#editor', {
          theme: 'snow',
          formats: ['italic', 'bold'],
          modules: {
          toolbar: ['bold', 'italic']
      }
        });

        const delta = get(deltaInput);
        quill.setContents(delta);

        quill.on('text-change', () => {
          if (quill) {
            const delta = quill.getContents();  
            const html = quill.root.innerHTML; 
            content.set(html);  
            deltaInput.set(delta); 
          }
        });
      }
      });
    }
  });

  onDestroy(() => {
    if (quill) {
      quill.disable();
      quill = null;
    }
  });

    type Node = {
      id: string;
      data: NodeData;
      position: { x: number; y: number };
      }

    $: {
        const unsubscribe = nodes.subscribe(nodeArray => {
        const selectedNode = nodeArray.find(node => node.id === id);
        if (selectedNode && selectedNode.id != lastSelectedNodeId) {

          lastSelectedNodeId = selectedNode.id;

            const nodeData = selectedNode.data as NodeData;
            title = nodeData.title as Writable<string>;
              content = nodeData.content as Writable<string>;
                deltaInput = nodeData.delta as Writable<any>; 
            color =  nodeData.color as Writable<string>;
            lastSelectedNodeId = selectedNode.id;
            

              if (quill) {
                 const delta = get(deltaInput);
                  if (delta && quill) {
                        quill.setContents(delta);
                  }
        }

            
        }
        return () => unsubscribe();
        })
    }

    $: updateNode({ title, content, color });

    function updateNode({title, content, color}: {
      title: Writable<string>;
      content: Writable<string>;
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
                  localDelta: deltaInput,
                  color: colorVal
                }
              };
            }
            return node;
          });
        });
    }
</script>
<div class="updatenode__panel" bind:this={panelRef}>
    <label>Title:</label>
    <input bind:value={$title}/>

    <label class="updatenode__bglabel">Color:</label>
    <input type="color" bind:value={$color}/>

    <div bind:this={editorElement} id="editor">
    </div>

  </div>

  <style>
    .updatenode__panel {
    position: absolute;
    left: 10px;
    top: 20%;
    z-index: 10000000;
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

    textarea {
		width: 100%;
		height: 200px;
	}
  </style> 