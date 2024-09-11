<script lang="ts">

	import { Button, Input, Label, Radio, Select, Table, TableBody, TableBodyCell, TableBodyRow } from "flowbite-svelte";
	import { get } from "svelte/store";
	import { conditions, variables } from "./stores";
	import type { Condition } from "./stores";

    function createCondition(number: number, var1Type: string, var1: any, comparision: string, var2Type: string, var2: any, funcArgs1: Array<any>, funcArgs2: Array<any>, logicOp?: string){
        return {
          number: number,  
          var1Type: var1Type, 
          var1: var1, 
          comparison: comparision, 
          var2Type: var2Type,  
          var2: var2,
          funcArgs1: funcArgs1,
          funcArgs2: funcArgs2,
          logicOp: logicOp
        }
        }
        function addCondition(condition: Condition){
          conditions.update((currentArray) => {
          currentArray.push(condition);
          return currentArray;
	});
        }
        if($conditions.length == 0){
        addCondition(createCondition(1,"variable",null,"","variable",null,[],[]));
        }

        function deleteCondition(condition: Condition){
        conditions.update(currentArray => {
            return currentArray.filter(c => c !== condition);
        });
    }

</script>
<Table striped={true}>
    <TableBody tableBodyClass="divide-y">
    {#each $conditions as condition, i}
    <TableBodyRow>
    <TableBodyCell>Condition {i+1}:</TableBodyCell>
    <TableBodyCell><Label for="small-input">Variable/Function: </Label>
      <Label>Variable </Label><Radio checked={condition.var1Type === 'variable'} name="funcVarValue1Con{i+1}" value="variable" bind:group={condition.var1Type}/>
      <Label>Function </Label><Radio checked={condition.var1Type === 'function'} name="funcVarValue1Con{i+1}" value="function" bind:group={condition.var1Type}/>
    </TableBodyCell>
    {#if condition.var1Type == "variable"}
    <TableBodyCell>
      <Select bind:value={condition.var1}>
        {#each get(variables) as variable}
        <option value="{variable}">{get(variable.name)}</option> 
        {/each}
    </Select>
    </TableBodyCell>
    {:else}
    <TableBodyCell>
      <Select bind:value={condition.var1}>
        <option value="visited">visited(node_name)</option>
        <option value="visitedCount">visited_count(node_name)</option>
        <option value="random">random()</option>
        <option value="randomRange">random_range(num1,num2)</option>  
        <option value="dice">dice(numOfSides)</option>  
        <option value="inc">inc(num)</option>
        <option value="dec">dec(num)</option>
    </Select>
    </TableBodyCell>
    {#if condition.var1 == "visited" || condition.var1 == "visitedCount"}
    <TableBodyCell>
      <Label for="small-input">Node name: </Label><Input size="sm" style="" type="text" bind:value={condition.funcArgs1[0]}/>
    </TableBodyCell>
    {:else if condition.var1 == "dice" || condition.var1 == "inc" || condition.var1 == "dec"}
    <TableBodyCell>
      <Label for="small-input">Number: </Label><Input size="sm" style="" type="number" bind:value={condition.funcArgs1[0]}/>
    </TableBodyCell>
    {:else if condition.var1 == "randomRange"}
    <TableBodyCell>
      <Label for="small-input">From: </Label><Input size="sm" style="" type="number" bind:value={condition.funcArgs1[0]}/>
      <Label for="small-input">To: </Label><Input size="sm" style="" type="number" bind:value={condition.funcArgs1[1]}/>
    </TableBodyCell>
    {/if}
    {/if}
    <TableBodyCell>
      <Select bind:value={condition.comparison}>
        <option value="<">less than</option>
        <option value="<=">less or equal to</option> 
        <option value="==">equal to</option> 
        <option value="!=">not equal to</option>
        <option value=">">more than</option>
        <option value=">=">more or equal to</option>   
    </Select>
    </TableBodyCell>
    {#if condition.comparison != ""}
    <TableBodyCell>
      <Label>Variable </Label><Radio checked={condition.var2Type === 'variable'} name="funcVarValue2Con{i+1}" value="variable" bind:group={condition.var2Type}/>
      <Label>Function </Label><Radio checked={condition.var2Type === 'function'} name="funcVarValue2Con{i+1}" value="function" bind:group={condition.var2Type}/>
      <Label>Value </Label><Radio checked={condition.var2Type === 'value'} name="funcVarValue2Con{i+1}" value="value" bind:group={condition.var2Type}/>
    </TableBodyCell>
      {#if condition.var2Type == "variable"}
      <TableBodyCell>
        <Select bind:value={condition.var2}>
          {#each get(variables) as variable}
          {#if condition.var1 != null && get(variable.name) != get(condition.var1.name)  && get(variable.type) == get(condition.var1.type)}
          <option value="{get(variable.name)}">{get(variable.name)}</option> 
          {/if}
          {/each}
      </Select>
      </TableBodyCell>
      {:else if condition.var2Type == "function"}
      <TableBodyCell>
        <Select bind:value={condition.var2}>
          <option value="visited">visited(node_name)</option>
          <option value="visitedCount">visited_count(node_name)</option>
          <option value="random">random()</option>
          <option value="randomRange">random_range(num1,num2)</option>  
          <option value="dice">dice(numOfSides)</option>  
          <option value="inc">inc(num)</option>
          <option value="dec">dec(num)</option>
      </Select>
      </TableBodyCell>
        {#if condition.var2 == "visited" || condition.var2 == "visitedCount"}
        <TableBodyCell>
          <Label for="small-input">Node name: </Label><Input size="sm" style="" type="text" bind:value={condition.funcArgs2[0]}/>
        </TableBodyCell>
        {:else if condition.var2 == "dice" || condition.var2 == "inc" || condition.var2 == "dec"}
        <TableBodyCell>
          <Label for="small-input">Number: </Label><Input size="sm" style="" type="number" bind:value={condition.funcArgs2[0]}/>
        </TableBodyCell>
        {:else if condition.var2 == "randomRange"}
        <TableBodyCell>
          <Label for="small-input">From: </Label><Input size="sm" style="" type="number" bind:value={condition.funcArgs2[0]}/>
          <Label for="small-input">To: </Label><Input size="sm" style="" type="number" bind:value={condition.funcArgs2[1]}/>
        </TableBodyCell>
        {/if}
      {:else}
      {#if condition.var1 != null}
      <TableBodyCell>
          {#if get(condition.var1.type) == "number" || condition.var1 == "visitedCount" || condition.var1 == "random" || condition.var1 == "randomRange" || condition.var1 == "dice" || condition.var1 == "inc" || condition.var1 == "dec"}
          <Label for="small-input">Value: </Label><Input size="sm" type="number" bind:value={condition.var2}/>
          {:else if get(condition.var1.type) == "text"}
          <Label for="small-input">Value: </Label><Input size="sm" type="text" bind:value={condition.var2}/>
          {:else}
          <Label for="small-input">Value: </Label> 
          <Label>True </Label><Radio checked={true} name="valRadioCon{i+1}" value="true" bind:group={condition.var2}/>
          <Label>False </Label><Radio name="valRadioCon{i+1}" value="false" bind:group={condition.var2}/>
          {/if}
      </TableBodyCell>
      {/if}
      {/if}
      {/if}
      {#if condition.number != $conditions.length}
    <TableBodyCell>
      <Label>Join conditions: </Label>
      <Select bind:value={condition.logicOp}>
        <option value="&&">and</option>
        <option value="||">or</option>
    </Select>
  </TableBodyCell>
      {/if}
      <TableBodyCell>
        <a class="font-medium text-primary-600 hover:underline dark:text-primary-500" on:click={() => deleteCondition(condition)}>Delete</a>
      </TableBodyCell>
    </TableBodyRow>
    {/each}
    <Button on:click={() => {addCondition(createCondition($conditions.length+1,"",null,"","",null,[],[]));
    }}>Add condition</Button>
    </TableBody>
    </Table>