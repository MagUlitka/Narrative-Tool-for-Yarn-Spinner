<script lang="ts">
    import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';
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
    export let localTitle: string;
    export let localContent: Array<string>;
    export let localColor: string;
    export let selected: $Props['selected'] = undefined;


    $: {
        data.title.subscribe(value => localTitle = value);
        data.color.subscribe(value => localColor = value);
        data.content.subscribe(value => localContent = value);
    }

    $$restProps;
  </script>
   
  <div class="storynode" style="background-color: {localColor}">
    <NodeResizer minWidth={100} minHeight={100} isVisible={selected} />
    <Handle type="target" position={Position.Top} />
    <div>
    title: <strong>{localTitle}</strong><br>
    content: {localContent}
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>

  <style>
    .storynode {
      padding: 10px;
      width: 100%;
      height: 100%;
    }
  </style>