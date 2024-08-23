<script lang="ts" module="">
    import NodeData from "./StoryNode.svelte";
	  import { get, writable, type Writable } from "svelte/store";
    import { nodes } from "./stores";
	  import { useNodes } from "@xyflow/svelte";
    import 'quill/dist/quill.snow.css';
	import type Quill  from "quill";
  import { onMount } from 'svelte';
  
    export let title: Writable<string> = writable('');
    export let id: string;
    export let content: Writable<Array<string>> = writable(Array());
    export let color: Writable<string> = writable("#ffffff");

    export let contentInput: Writable<Array<string>> = writable(Array());

    let quill:  Quill | null;

    let lastSelectedNodeId: string | null = null;

      onMount(() => {
    if (typeof document !== 'undefined') {
      import('quill').then((module) => {
        const Quill = module.default;

        quill = new Quill('#editor', {
          theme: 'snow',
          formats: ['italic', 'bold'],
          modules: {
          toolbar: ['bold', 'italic']
      }
        });


        quill.on('text-change', () => {
          if (quill) {
          const editorText = quill.getText(); 
        content.set(editorText.trim().split('\n')); 
        contentInput.set(editorText.trim().split('\n')); 
          }
        });
      });
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
            content =  nodeData.content as Writable<Array<string>>;
            color =  nodeData.color as Writable<string>;
            lastSelectedNodeId = selectedNode.id;
            

              if (quill) {
                const contentArray = get(nodeData.content) as Array<string>;
      //  console.log('Content Array:', contentArray);  

        const cursorPosition = quill.getSelection()?.index ?? 0;

    
       const contentHtml = contentArray.map(line => `${line}`).join('\n');
        quill.root.innerHTML = contentHtml;
        quill.setSelection(cursorPosition);
        }

            
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
        //console.log($content);
        console.log($contentInput);
    }

</script>
<div class="updatenode__panel">
    <label>Title:</label>
    <input bind:value={$title}/>

    <label class="updatenode__bglabel">Color:</label>
    <input type="color" bind:value={$color}/>

    <div id="editor">
    </div>

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

    textarea {
		width: 100%;
		height: 200px;
	}
  </style> 