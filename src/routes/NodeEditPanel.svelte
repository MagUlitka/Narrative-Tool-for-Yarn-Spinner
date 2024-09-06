<script lang="ts" module="">
    import NodeData from "./StoryNode.svelte";
	  import { get, writable, type Writable } from "svelte/store";
    import { conditions, nodes } from "./stores";
    import 'quill/dist/quill.snow.css';
    import type Quill  from "quill";
    import { onDestroy, onMount } from 'svelte';
    import { type Variable } from "./stores";
    import { variables } from "./stores";
	import { Button, Input, Label, Radio, Select} from "flowbite-svelte";
	import ConditionSetter from "./ConditionSetter.svelte";
  
    export let title: Writable<string> = writable('');
    export let id: string;
    export let content: Writable<string> = writable('');
    export let color: Writable<string> = writable("#ffffff");
    export let deltaInput: Writable<any> = writable({});

    let quill:  Quill | null;

    let lastSelectedNodeId: string | null = null;

    let editorElement: HTMLDivElement | null = null;
    let lineOwner: HTMLInputElement | null = null;
    export let panelRef: HTMLDivElement | null = null;

    let addFunctionClicked = false;
    let selectedOption: string = "";
    let addFunctionEnds: boolean = false;
    let functionalLine: string = "";

    let chosenVariable: Variable;
    let newValue: any;
    let selectedRadio: string;


    onMount(() => {
      //initialize quill
    if (typeof document !== 'undefined' && editorElement) {
      import('quill').then((module) => {
        const Quill = module.default;
        if(editorElement){
        quill = new Quill('#editor', {
          theme: 'snow',
          formats: ['italic', 'bold'],
          modules: {
          toolbar: '#toolbar'
      }
        });
        //load node delta
        const delta = get(deltaInput);
        quill.setContents(delta);

        //set line owner for the first time
        quill.once('text-change', () => {
          if(quill){
          let position = quill.getLength() - 1;
          const lineOwnerContent = (document.getElementById("line-owner") as HTMLInputElement).value;
          if(lineOwnerContent != ""){
            const replaceString = lineOwnerContent + ': ';
            quill.deleteText(position, 1);  
            quill.insertText(position, replaceString); 
            position += replaceString.length; 
            quill.setSelection(position, 0); 
            }
                  }

});
        // manage quill content on change - save quill's content into editor vars and listen for enter to add line owner
        quill.on('text-change', () => {
          if (quill) {
            let delta = quill.getContents();  
            let html = quill.root.innerHTML; 
            content.set(html);  
            deltaInput.set(delta);
          }
        });

        const editorContainer = document.querySelector('#editor .ql-editor');
        if (editorContainer) {
          editorContainer.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && quill) {
                let position = quill.getLength() - 1;
                const lineOwnerContent = (document.getElementById("line-owner") as HTMLInputElement).value;
                if(lineOwnerContent != ""){
                  const replaceString = lineOwnerContent + ': ';
                  quill.deleteText(position, 1);  
                  quill.insertText(position, replaceString); 
                  position += replaceString.length; 
                  quill.setSelection(position, 0); 
                }
            }
          });
        }

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
      // constantly check whether the node was changed and load its content into editor
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
        // write functionalLine into editor
                  if (quill && addFunctionEnds){
                    let position = quill.getSelection();
                    if(!position){
                      quill.focus();
                      position = quill.getSelection();
                    }
                    quill.insertText(position.index, functionalLine); 
                    addFunctionEnds = false;
                    functionalLine = "";
                    if(selectedOption == "if"){
                      quill.setSelection(quill.getLength()-11,0);
                    }
                  }
    }

    $: updateNode({ title, content, color });

    // update node array with new values
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

    function addFunctionalLine(){
      switch(selectedOption){
        case "set": {
          if(selectedRadio == "true" || selectedRadio == "false"){
            newValue = selectedRadio;
        }
          functionalLine = "<<set $" + chosenVariable + " to " + newValue + ">>";
          addFunctionEnds = true;
          break;
        }
        case "if": {
          let joinedConditions = "";
          $conditions.forEach(condition => {
            if(condition.var1Type == "variable"){
          joinedConditions = joinedConditions + "($" + get(condition.var1.name) + " " + condition.comparison + " ";
            }
            else {
              let functionArgs = "";
              let argsLen = condition.funcArgs1.length;
              condition.funcArgs1.forEach(arg => {
                functionArgs = functionArgs + arg;
                if(arg !== condition.funcArgs1[argsLen-1]){
                  functionArgs = functionArgs + ", ";
                }     
              });
              joinedConditions = joinedConditions + "(" + condition.var1 + "(" + functionArgs + ") " + condition.comparison + " ";

            }
            if(condition.var2Type == "variable"){
              joinedConditions = joinedConditions + "$" + condition.var2 + ")";
            }
            else if(condition.var2Type == "value"){
              joinedConditions = joinedConditions + condition.var2 + ")";
            }
            else {
              let functionArgs = "";
              let argsLen = condition.funcArgs2.length;
              condition.funcArgs2.forEach(arg => {
                functionArgs = functionArgs + arg;
                if(arg !== condition.funcArgs2[argsLen-1]){
                  functionArgs = functionArgs + ", ";
                }     
              });
              joinedConditions = joinedConditions + condition.var2 + "(" + functionArgs + "))";
            }
            if(condition.number != $conditions.length){
              joinedConditions = joinedConditions + " " + condition.logicOp + " ";
            }
            
          });
          functionalLine = "<<if " + joinedConditions + ">>" + "\n\n<<endif>>";
          conditions.update((currentArray) => {
          currentArray = [];
          return currentArray;
	});
          addFunctionEnds = true;
          break;

        }
        case "elseif": {
          let joinedConditions = "";
          $conditions.forEach(condition => {
            if(condition.var1Type == "variable"){
          joinedConditions = joinedConditions + "($" + get(condition.var1.name) + " " + condition.comparison + " ";
            }
            else {
              let functionArgs = "";
              let argsLen = condition.funcArgs1.length;
              condition.funcArgs1.forEach(arg => {
                functionArgs = functionArgs + arg;
                if(arg !== condition.funcArgs1[argsLen-1]){
                  functionArgs = functionArgs + ", ";
                }     
              });
              joinedConditions = joinedConditions + "(" + condition.var1 + "(" + functionArgs + ") " + condition.comparison + " ";

            }
            if(condition.var2Type == "variable"){
              joinedConditions = joinedConditions + "$" + condition.var2 + ")";
            }
            else if(condition.var2Type == "value"){
              joinedConditions = joinedConditions + condition.var2 + ")";
            }
            else {
              let functionArgs = "";
              let argsLen = condition.funcArgs2.length;
              condition.funcArgs2.forEach(arg => {
                functionArgs = functionArgs + arg;
                if(arg !== condition.funcArgs2[argsLen-1]){
                  functionArgs = functionArgs + ", ";
                }     
              });
              joinedConditions = joinedConditions + condition.var2 + "(" + functionArgs + "))";
            }
            if(condition.number != $conditions.length){
              joinedConditions = joinedConditions + " " + condition.logicOp + " ";
            }
            
          });
          functionalLine = "<<elseif " + joinedConditions + ">>";
          conditions.update((currentArray) => {
          currentArray = [];
          return currentArray;
	});
          addFunctionEnds = true;
          break;

        }
        case "else": {
          functionalLine = "<<else>>";
          addFunctionEnds = true;
          break;

        }
        default: { 
      break; 
        } 
      }
    }
</script>
<div class="updatenode__panel" bind:this={panelRef}>
    <label>Title:</label>
    <input bind:value={$title}/>

    <label class="updatenode__bglabel">Color:</label>
    <input type="color" bind:value={$color}/>

    <Button on:click={() => (addFunctionClicked = true)}>+ Add functional line</Button>
    {#if addFunctionClicked}
    <select bind:value={selectedOption}>
      <option value="set" selected>set variable</option>
      <option value="if">add condition block</option>
      <option value="elseif">add another scenario</option>
      <option value="else">add alternative (else)</option>
  </select>

  {#if selectedOption == "set"}
  <Select bind:value={chosenVariable}>
    {#each get(variables) as variable}
    <option value="{get(variable.name)}">{get(variable.name)}</option> 
    {/each}
</Select>
{#each get(variables) as variable}
{#if get(variable.type) == "true/false"}
<Label>True </Label><Radio checked={true} name="variableValue" value="true" bind:group={selectedRadio}/><Label>False </Label><Radio name="variableValue" value="false" bind:group={selectedRadio}/>
{:else if get(variable.type) == "text"}
<Input id="variableValue" name="variableValue" style="" type="text" bind:value={newValue}/>
{:else}
<Input id="variableValue" name="variableValue" style="" type="number" bind:value={newValue}/>
{/if}
{/each}
{:else if selectedOption == "if"}
<ConditionSetter></ConditionSetter>
{:else if selectedOption == "elseif"}
<ConditionSetter></ConditionSetter>
  {/if}
  <Button id="addFunctionLine" on:click={() => {addFunctionalLine();
    addFunctionClicked = false;
  }}>Add line</Button>
  <Button on:click={() => (addFunctionClicked = false)}>Hide</Button>
    {/if}
    <div id="toolbar">
      <button class="ql-bold"></button>
      <button class="ql-italic"></button>
      <label>Line owner: </label><input type="text" id="line-owner" bind:this={lineOwner}/>
    </div>
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
    height: 70%;
}
  
    .updatenode__bglabel {
      margin-top: 10px;
    }
  
    .updatenode__content {
      margin-top: 10px;
      display: flex;
      align-items: center;
    }

    #line-owner {
      height: 10px;
      width: 30%;
    }

    #editor {
      height: 80%;
      overflow-y: auto;
    }
  </style> 