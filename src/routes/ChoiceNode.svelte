<script lang="ts">
    import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';
    import {get, type Writable } from 'svelte/store';
    import { focusedNodeContent, isGlobalMode, nodeRefs, variables } from './stores';
	import { onDestroy, onMount } from 'svelte';
    type $Props = NodeProps;
    type NodeData = {
        color: Writable<string>;
        content: Writable<string>;
        delta: Writable<any>;
    };

    export let data: NodeData;
    export let localContent: string = ''; 
    export let localDelta: any = {};
    export let localColor: string = '#454545'; 
    export let selected: $Props['selected'] = undefined;


    export let nodeRef: HTMLDivElement | null = null;

    onMount(() => {
      if(nodeRef){
  nodeRefs.update(refs => [...refs, { nodeRef }]);
      }
});

    $: {
        data.color.subscribe(value => localColor = value);
        data.content.subscribe(value => localContent = value);
        data.delta.subscribe(value => localDelta = value);
    }

    $$restProps;

    function setCurrentValues(){
        $variables.forEach(variable => {
            let regex = new RegExp(`&lt;&lt;set\\s\\$${get(variable.name)}\\sto\\s([\\w\\d]+)&gt;&gt;`, 'g');
            const matches = Array.from(get(focusedNodeContent).matchAll(regex));
            if(matches.length == 0){
              //  console.log("No match");
                variable.currentValue.set(get(variable.declaredValue));
             //   console.log(get(variable.currentValue));
              }
              else {
            for (const match of matches) {
                variable.currentValue.set(match[1]);
              //  console.log(get(variable.currentValue));
            }
          }
        });
    }

    function handleNodeClick() {
        isGlobalMode.set(false);
        focusedNodeContent.set(get(data.content));
        setCurrentValues();
    }

  </script>
   
  <div class="choicenode" style="background-color: {localColor}"  bind:this={nodeRef} on:click={() => {isGlobalMode.set(false);
    focusedNodeContent.set(get(data.content));
    setCurrentValues();
  }}>
    <NodeResizer minWidth={100} minHeight={100} isVisible={selected} />
    <Handle type="target" position={Position.Top} />
    <div>
    <div class="choicenode__content">
      {@html localContent}
    </div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>

  <style>
    .choicenode {
      padding: 10px;
      width: 100%;
      height: 100%;
    }
    
    .choicenode__content {
      white-space: pre-wrap;
    }
  </style>