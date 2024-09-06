<script lang="ts">
	import { get, writable, type Writable } from "svelte/store";
    import { Button, AccordionItem, Accordion, Radio, Select, Label, Input, CloseButton, Heading, P, A, Mark, Secondary, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
    import  isGlobalMode  from "./+page.svelte";
    import { type Variable } from "./stores";
    import { variables } from "./stores";

    let selectedOption: string;
    export let visible: boolean = true;

    let newName: string;
    let newValue: any;
    let selectedRadio: string;
    let isEdited: boolean = false;


    function createVariable(name: string, type: string, declaredValue: any){
        return {
            name: writable(name),
            type: writable(type),
            declaredValue: writable(declaredValue),
            currentValue: writable(declaredValue),
            isEdited: writable(false)
        }
        }

    variables.update((currentArray) => {
		currentArray.push(createVariable("playerName","text","Player"));
		return currentArray;
	});

    function declareVariable(){
        if(selectedOption == "true/false"){
            newValue = selectedRadio;
        }
        variables.update((currentArray) => {
            if(currentArray.find(variable => get(variable.name) != newName)){
		currentArray.push(createVariable(newName,selectedOption,newValue));
        newName = "";
        newValue = "";
            }
		return currentArray;
	});

    }

    function editVariable(variable: Variable){
        variables.subscribe((currentArray) => {
            if(currentArray.find(variable => get(variable.name) != newName)){
                variable.name.set(newName);
                variable.type.set(selectedOption);
                if(selectedOption == "true/false"){
                    newValue = selectedRadio;
                }
                variable.declaredValue.set(newValue);
                variable.isEdited.set(false);
                isEdited = false;
                newName = "";
                newValue = "";
            }
        });
         
    }

    function deleteVariable(variable: Variable){
        variables.update(currentArray => {
            return currentArray.filter(v => v !== variable);
        });
    }


</script>

{#if visible == false}
<div class="panelButton">
<button style="background-color: rgb(235 79 39);
    font-size: 25px;
    border-radius: 15px;
    width: 50px;
    height: 50px;" on:click={() => (visible = true)}>+</button>
    </div>
{:else}
<div class="variable__panel">
    <Accordion>
        <AccordionItem open>
        <span slot="header"><Heading tag="h5">Variables</Heading></span>
        <Table striped={true}>
            <TableHead>
                <TableHeadCell>Variable name</TableHeadCell>
                <TableHeadCell>Variable type</TableHeadCell>
                <TableHeadCell>Value</TableHeadCell>
            </TableHead>
            
            <TableBody tableBodyClass="divide-y">
    {#each get(variables) as variable}
    <TableBodyRow>
        {#if !get(variable.isEdited) || !isEdited}
        <TableBodyCell>{get(variable.name)}</TableBodyCell>
        <TableBodyCell>{get(variable.type)}</TableBodyCell>
        {#if !isGlobalMode}
        <TableBodyCell>{get(variable.currentValue)}</TableBodyCell>
        {:else}
        <TableBodyCell>{get(variable.declaredValue)}</TableBodyCell>
        {/if}
        <TableBodyCell>
          <a class="font-medium text-primary-600 hover:underline dark:text-primary-500" on:click={() => {
            isEdited = true;
            variable.isEdited.set(true);
            newName = get(variable.name);
            selectedOption = get(variable.type);
            newValue = get(variable.declaredValue);
          }}>Edit</a>
        </TableBodyCell>
        <TableBodyCell>
            <a class="font-medium text-primary-600 hover:underline dark:text-primary-500" on:click={() => deleteVariable(variable)}>Delete</a>
          </TableBodyCell>
          {:else}
        <TableBodyCell><Label for="small-input">Variable name: </Label><Input id="variableName" size="sm" style="" type="text" bind:value={newName}/></TableBodyCell>
        <TableBodyCell><Label for="small-input">Variable type: </Label>
            <Select class="mt-2" id="variableType" style="" bind:value={selectedOption}>
                <option value="text" selected>word</option>
                <option value="number">number</option>
                <option value="true/false">true/false</option>
            </Select></TableBodyCell>
            <TableBodyCell>
                <Label for="small-input">Value: </Label>
    {#if selectedOption == "true/false"}
    <label>True </label><Radio checked={true} name="variableValue" value="true" bind:group={selectedRadio}/><label>False </label><Radio name="variableValue" value="false" bind:group={selectedRadio}/>
    {:else if selectedOption == "text"}
    <Input id="variableValue" name="variableValue" style="" type="text" bind:value={newValue}/>
    {:else}
    <Input id="variableValue" name="variableValue" style="" type="number" bind:value={newValue}/>
    {/if}
            </TableBodyCell>
        <TableBodyCell>
          <a class="font-medium text-primary-600 hover:underline dark:text-primary-500" on:click={() => editVariable(variable)}>Save</a>
        </TableBodyCell>
          {/if}
      </TableBodyRow>
    {/each}
    </TableBody>
    </Table>
</AccordionItem>
{#if !isEdited}
    <AccordionItem tag="h2">
        <span slot="header"> + Declare new variable</span>
    <Label for="small-input">Variable name: </Label><Input id="variableName" size="sm" style="width: 30%; display: inline-block;" type="text" bind:value={newName}/>
    <Label for="small-input">Variable type: </Label>
    <Select class="mt-2" id="variableType" style="width: 35%; display: inline-block;" bind:value={selectedOption}>
        <option value="text" selected>word</option>
        <option value="number">number</option>
        <option value="true/false">true/false</option>
    </Select>
    <Label for="small-input">Value: </Label>
    {#if selectedOption == "true/false"}
    <label>True </label><Radio checked={true} name="variableValue" value="true" bind:group={selectedRadio}/><label>False </label><Radio name="variableValue" value="false" bind:group={selectedRadio}/>
    {:else if selectedOption == "text"}
    <Input id="variableValue" name="variableValue" style="width: 30%;" type="text" bind:value={newValue}/>
    {:else}
    <Input id="variableValue" name="variableValue" style="width: 30%;" type="number" bind:value={newValue}/>
    {/if}
    <br>
    <Button on:click={declareVariable}>Declare new variable</Button>
</AccordionItem>
{/if}
    </Accordion>
    <button style="position: absolute;
    color: rgb(238, 238, 238);
    background-color: rgb(43 59 84);
    font-weight: 800;
    padding: 10px;
    width: 100%;
    text-align: center;
" on:click={() => {visible = false;
    isEdited = false;
    newName = "";
    newValue = "";}}>X Close</button>
  </div>
{/if}
  <style>
    .variable__panel {
    position: absolute;
    right: 10px;
    top: 20%;
    z-index: 10000000;
    font-size: 12px;
    background-color: #282828;
    width: 35%;
    height: auto;
}
    .panelButton {
    position: absolute;
    top: 70px;
    right: 1px;
    z-index: 100000000000000000000000;
    color: #eee !important;
    text-align: center;
}


  </style> 