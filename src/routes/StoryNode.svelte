<script lang="ts">
    import { Position, NodeResizer, type NodeProps, getOutgoers} from '@xyflow/svelte';
    import {get, type Writable } from 'svelte/store';
    import { edges, focusedNodeContent, hideTitleSelected, isGlobalMode, nodeRefs, nodes, variables } from './stores';
	import { onDestroy, onMount } from 'svelte';
	import CustomHandle from './CustomHandle.svelte';
    type $Props = NodeProps;

    type NodeData = {
        title: Writable<string>;
        color: Writable<string>;
        content: Writable<string>;
        delta: Writable<any>;
        nodeId: string;
        outgoers: Node[];
    };

    export let data: NodeData;
    export let localTitle: string = ''; 
    export let localContent: string = ''; 
    export let localDelta: any = {};
    export let localColor: string = '#ffffff'; 
    export let selected: $Props['selected'] = undefined;

    export let nodeRef: HTMLDivElement | null = null;


    onMount(() => {
      if(nodeRef){
  nodeRefs.update(refs => [...refs, { nodeRef }]);
      }
});

    $: {
        data.title.subscribe(value => localTitle = value);
        data.color.subscribe(value => localColor = value);
        data.content.subscribe(value => localContent = value);
        data.delta.subscribe(value => localDelta = value);
        data.outgoers = getOutgoers({ id: data.nodeId }, $nodes, $edges);

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
   
  <div class="storynode" style="background-color: {localColor}"  bind:this={nodeRef} on:click={() => {isGlobalMode.set(false);
    focusedNodeContent.set(get(data.content));
    setCurrentValues();
  }}>
    <NodeResizer minWidth={100} minHeight={100} isVisible={selected} />
    <CustomHandle handleType="target" position={Position.Top} data={data}></CustomHandle>
    <div>
      {#if !$hideTitleSelected}
    title: <strong>{localTitle}</strong><br>
    {/if}
    <div class="storynode__content">
      {@html localContent}
    </div>
    </div>
    <div>
      <CustomHandle handleType="source" position={Position.Bottom} data={data}></CustomHandle>
  </div>
  </div>

  <style>
    .storynode {
      padding: 10px;
      width: 100%;
      height: 100%;
    }
    
    .storynode__content {
      white-space: pre-wrap;
      max-height: 300px;
    }
  </style>