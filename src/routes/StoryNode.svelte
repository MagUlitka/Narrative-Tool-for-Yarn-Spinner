<script lang="ts">
    import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';
    import { get, writable, type Writable } from 'svelte/store';
	import NodeEditPanel from './NodeEditPanel.svelte';
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
        content: Writable<Array<string>>;
    };

    export let data: NodeData;
    export let localTitle: string = '';  // Initialize with default empty string
    export let localContent: Array<string> = [];  // Initialize with an empty array
    export let localColor: string = '#ffffff';  // Initialize with default color
    export let selected: $Props['selected'] = undefined;

    // Make sure that `localContent` and other variables are initialized from stores
    $: {
        data.title.subscribe(value => localTitle = value);
        data.color.subscribe(value => localColor = value);
        data.content.subscribe(value => {
            localContent = value;
        });
    }

    $$restProps;
  </script>
   
  <div class="storynode" style="background-color: {localColor}">
    <NodeResizer minWidth={100} minHeight={100} isVisible={selected} />
    <Handle type="target" position={Position.Top} />
    <div>
    title: <strong>{localTitle}</strong><br>
    <div class="storynode__content">
      {#each localContent as line}
      {line}<br>
  {/each}
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