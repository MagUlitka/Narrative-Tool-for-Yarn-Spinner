
<script lang="ts">
  import { writable } from 'svelte/store';
 import { SvelteFlow, Background, Controls, MiniMap, type ColorMode} from '@xyflow/svelte';
 import '@xyflow/svelte/dist/style.css';
 import StoryNode from './StoryNode.svelte';
 import NodeMenu from './NodeMenu.svelte';
 import { Navbar, NavLi, NavUl, NavHamburger, Button} from 'flowbite-svelte';
import type { Writable } from 'svelte/store';
import color from './NodeMenu.svelte';
import NodeEditPanel from './NodeEditPanel.svelte';
	import type { ColorPicker } from 'svelvet';

 const nodeTypes = {
   'story-node': StoryNode
 };

 const nodes = writable([ {
   id: '1', 
   type: 'story-node',
   position: { x: 0, y: 0 }, 
   data: { title: 'default_title', color: '#ffffff', content: Array()}, 
 },
 {
   id: '2',
   type: 'story-node',
   position: { x: 100, y: 100 },
   data: { title: 'world', color: '#eeeeee', content: Array() },
 },]);
 const edges = writable([]);

 let menu: { id: string; top?: number; left?: number; right?: number; bottom?: number } | null;
  let width: number;
  let height: number;

  let editPanel = null;

  //let editPanel: {nodeId: string; nodeTitle: Writable<unknown>; color: Writable<unknown>; content: Writable<unknown>} | null;

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
    console.log(event.detail);
    editPanel = { nodeId: id, title, content, color };
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
