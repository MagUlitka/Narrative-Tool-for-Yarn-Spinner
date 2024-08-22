
<script lang="ts">
  import { SvelteFlow, Background, Controls, MiniMap } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import StoryNode from './StoryNode.svelte';
  import NodeMenu from './NodeMenu.svelte';
  import { Navbar, Button} from 'flowbite-svelte';
  import type { Writable } from 'svelte/store';
  import NodeEditPanel from './NodeEditPanel.svelte';
  import { nodes, edges } from './stores';

  const nodeTypes = {
    'story-node': StoryNode
  };

  let menu: { id: string; top?: number; left?: number; right?: number; bottom?: number } | null;
  let width: number;
  let height: number;

  let editPanel: {nodeId: string; nodeTitle: Writable<string>; color: Writable<string>; content: Writable<Array<string>>} | null;

  function handleContextMenu({ detail: { event, node } }) {
    event.preventDefault();

    menu = {
      id: node.id,
      top: event.clientY < height - 200 ? event.clientY : undefined,
      left: event.clientX < width - 200 ? event.clientX : undefined,
      right: event.clientX >= width - 200 ? width - event.clientX : undefined,
      bottom: event.clientY >= height - 200 ? height - event.clientY : undefined
    };
  }

  function handlePaneClick() {
    menu = null;
  }

  function handleEditNode(event) {
    const { id, title, content, color } = event.detail;
    editPanel = { nodeId: id, nodeTitle: title, content: content, color: color };
  }
</script>

  
  <div id="pageBody">
        <div class="relative px-8">
            <Navbar class="px-2 sm:px-4 py-2.5 fixed w-full z-20 top-0 start-0 border-b">
                <div class="flex md:order-2">
                  <div id="navspace">APP</div>
                    <Button size="sm">Load a tree</Button>
                    <Button size="sm">Save a tree & generate code</Button>
                   
                  </div>
            </Navbar>
          </div>
    <div id="svelteCanvas" bind:clientWidth={width} bind:clientHeight={height}>
      <SvelteFlow {nodes} {edges} {nodeTypes} colorMode="dark" on:nodecontextmenu={handleContextMenu}
      on:paneclick={handlePaneClick} fitView>
        <Background />
        <Controls />
        <MiniMap nodeStrokeWidth={3} pannable/>
        {#if menu}
        <NodeMenu
          onClick={handlePaneClick}
          id={menu.id}
          top={menu.top}
          left={menu.left}
          right={menu.right}
          bottom={menu.bottom}
          on:editnode={handleEditNode}
        />
      {/if}
      {#if editPanel}
      <NodeEditPanel id={editPanel.nodeId} title={editPanel.nodeTitle} content={editPanel.content} color={editPanel.color} />
          {/if}
      </SvelteFlow>  
    </div>
      </div>
