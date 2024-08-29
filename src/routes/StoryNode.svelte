<script lang="ts">
    import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';
    import {type Writable } from 'svelte/store';
    type $Props = NodeProps;

    type Line = {
    owner: Writable<string>;
    lineContent: Writable<string>;
    };

    type Variable = {
      name: Writable<string>;
      type: Writable<string>;
      value: Writable<any>;
    }

    type NodeData = {
        title: Writable<string>;
        color: Writable<string>;
        content: Writable<string>;
        delta: Writable<any>;
    };

    export let data: NodeData;
    export let localTitle: string = ''; 
    export let localContent: string = ''; 
    export let localDelta: any = {};
    export let localColor: string = '#ffffff'; 
    export let selected: $Props['selected'] = undefined;

    $: {
        data.title.subscribe(value => localTitle = value);
        data.color.subscribe(value => localColor = value);
        data.content.subscribe(value => localContent = value);
        data.delta.subscribe(value => localDelta = value);
    }

    $$restProps;
  </script>
   
  <div class="storynode" style="background-color: {localColor}">
    <NodeResizer minWidth={100} minHeight={100} isVisible={selected} />
    <Handle type="target" position={Position.Top} />
    <div>
    title: <strong>{localTitle}</strong><br>
    <div class="storynode__content">
      {@html localContent}
    </div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>

  <style>
    .storynode {
      padding: 10px;
      width: 100%;
      height: 100%;
    }
    
    .storynode__content {
      white-space: pre-wrap;
    }
  </style>