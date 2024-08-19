<script lang="ts">
    import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';
    type $Props = NodeProps;
    export let selected: $Props['selected'] = undefined;
    type Line = {
    owner: Writable<string>;
    lineContent: Writable<string>;
    };
    type Variable = {
      name: Writable<string>;
      type: Writable<string>;
      value: Writable<any>;
    }
    export let data: { title: Writable<string>, group: Writable<Node>, content: Writable<Array<Line>>, customVariables: Writable<Array<Variable>>, choices: Writable<Array<Node>> };
      const { title, group, content, customVariables, choices } = data;
    $$restProps;
  </script>
   
  <div class="storynode">
    <NodeResizer minWidth={100} minHeight={100} isVisible={selected} />
    <Handle type="target" position={Position.Top} />
    <div>
    title: <strong>{title}</strong><br>
    content: {content}
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>

  <style>
    .storynode {
      padding: 10px;
      background: #eee;
      width: 100%;
      height: 100%;
    }
  </style>