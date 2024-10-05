<script lang="ts" module="">
    import NodeData from "./StoryNode.svelte";
	  import { get, writable, type Writable } from "svelte/store";
    import { conditions, hideTitleSelected, nodes } from "./stores";
    import 'quill/dist/quill.snow.css';
    import type Quill  from "quill";
    import { onDestroy, onMount } from 'svelte';
    import { type Variable } from "./stores";
    import { variables } from "./stores";
    import { Button, Input, Label, Radio, Select, Helper, Checkbox} from "flowbite-svelte";
    import ConditionSetter from "./ConditionSetter.svelte";
  
    export let title: Writable<string> = writable('');
    export let id: string;
    export let content: Writable<string> = writable('');
    export let color: Writable<string> = writable("#ffffff");
    export let deltaInput: Writable<any> = writable({});

    let quill:  Quill | null;

    let lastSelectedNodeId: string | null = null;
    let selectedNode: any;

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

    const numberPattern = /(\d+)$/;
    let inputTitle = ''; 
    let lastValidTitle = '';
    let titleExists = false;


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
          if(selectedNode == "story-node"){
          const lineOwnerContent = (document.getElementById("line-owner") as HTMLInputElement).value;
          if(lineOwnerContent != ""){
            const replaceString = lineOwnerContent + ': ';
            quill.deleteText(position, 1);  
            quill.insertText(position, replaceString); 
            position += replaceString.length; 
            quill.setSelection(position, 0); 
            }
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
    inputTitle = get(title);
  });

  onDestroy(() => {
    if (quill) {
      quill.disable();
      quill = null;
    }
  });

  $:console.log(get(hideTitleSelected));

    $: {
      // constantly check whether the node was changed and load its content into editor
        const unsubscribe = nodes.subscribe(nodeArray => {
        selectedNode = nodeArray.find(node => node.id === id);
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
                    if(selectedOption == "if" && selectedNode.type == "choice-node"){
                      quill.insertText(quill.getLength(), functionalLine); 
                    }
                    else {
                    quill.insertText(position.index, functionalLine); 
                    }
                    addFunctionEnds = false;
                    functionalLine = "";
                    if(selectedOption == "if" && selectedNode.type == "story-node"){
                      quill.setSelection(quill.getLength()-11,0);
                    }
                  }
    }

//   $: updateNode({ title, content, color });

    function validateTitle() {
      const titleVal = inputTitle.trim();
      const currentNodes = get(nodes);
      titleExists = currentNodes.some(node => {
          return node.id !== id && get(node.data.title) === titleVal;
      });
      if (!titleExists && titleVal) {
          lastValidTitle = titleVal;
      }
  }

  $: title.subscribe(validateTitle);

  function saveTitle() {
    if (!titleExists && inputTitle.trim()) {
      title.set(inputTitle);
      updateNode({ title, content, color });
    }
    else {
      inputTitle = lastValidTitle;
      title.set(inputTitle);
      console.log(get(title));
      updateNode({ title, content, color });
    }
  }

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
          if(selectedNode.type == "story-node"){
          functionalLine = "<<if " + joinedConditions + ">>" + "\n\n<<endif>>";
          }
          else {
            functionalLine = "<<if " + joinedConditions + ">>";
          }
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
  <div class="grid gap-6 mb-6 md:grid-cols-2">
  {#if selectedNode && selectedNode.type != "choice-node"}
  <Label for='titleInput' class='block mb-2'>Title:</Label>
    <Input id='titleInput' bind:value={inputTitle} on:input={validateTitle} on:blur={saveTitle} />
    {#if titleExists}
    <Helper class='mt-2' color='red'><span class="font-medium">This title is already in use.</Helper>
    {/if}
    {/if}
    <Label for='hideTitle'>Hide title?</Label>
    <Checkbox id="hideTitle" bind:checked={$hideTitleSelected}></Checkbox>
    <Label for='colorInput' class='block mb-2'>Color:</Label>
    <input id="colorInput" type="color" bind:value={$color}/>
  </div>

    <Button on:click={() => (addFunctionClicked = true)}>+ Add functional line</Button>
 
    {#if addFunctionClicked}
    <select bind:value={selectedOption} style="background-color:#374151;">
      {#if selectedNode && selectedNode.type != "choice-node"}
      <option value="set" selected>set variable</option>
      {/if}
      <option value="if">add condition block</option>
      {#if selectedNode && selectedNode.type != "choice-node"}
      <option value="elseif">add another scenario</option>
      <option value="else">add alternative (else)</option>
      {/if}
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
  <div class="grid gap-6 mb-6 md:grid-cols-2">
  <Button id="addFunctionLine" on:click={() => {addFunctionalLine();
    addFunctionClicked = false;
  }}>Add line</Button>
  <Button on:click={() => (addFunctionClicked = false)}>Hide</Button>
</div>
    {/if}
  
    <div id="toolbar">
      <button class="ql-bold"></button>
      <button class="ql-italic"></button>
      {#if selectedNode && selectedNode.type != "choice-node"}
      <Label for="line-owner" class='block mb-2' style='float:left;'>Line owner: </Label><input type="text" id="line-owner" bind:this={lineOwner}/>
      {/if}
    </div>
    <div bind:this={editorElement} class:addFunctionClicked id="editor">
    </div>

  </div>

  <style>
    .updatenode__panel {
      position: absolute;
    left: 50px;
    top: 10%;
    z-index: 10000000;
    font-size: 12px;
    background-color: #282828;
    height: auto;
    max-height: 80vh;
    padding: 20px;
    border-radius: 10px;
    color: #eee;
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
      height: 29px;
    display: inline-block;
    float: left;
    background-color: #374151;
    border-radius: 5px;
    margin-left: 10px;
    }

    #toolbar {
      background-color: #1f2937;
      padding: 10px;
    }

    #editor {
      height:auto;
      overflow-y: auto;
    }

    #editor:not(.addFunctionClicked) {
    max-height: 50vh; 
  }

    .addFunctionClicked {
      max-height: 20vh;

    }

    input[type="color" i] {
      inline-size: 180px;
    block-size: 30px;
    border-width: 3px;
    border-style: solid;
    border-color: rgb(31 41 55);
}

input[type="color" i]::-webkit-color-swatch-wrapper {
    padding: 1px;
    background-color: rgb(31 41 55);
}
  </style> 