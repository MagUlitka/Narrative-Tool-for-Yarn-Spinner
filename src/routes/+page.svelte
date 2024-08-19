
<script lang="ts">
  import { writable } from 'svelte/store';
 import { SvelteFlow, Background, Controls, MiniMap} from '@xyflow/svelte';
 import '@xyflow/svelte/dist/style.css';
 import StoryNode from './StoryNode.svelte';
 import NodeMenu from './NodeMenu.svelte';
 import { Navbar, NavLi, NavUl, NavHamburger, Button} from 'flowbite-svelte';

 const nodeTypes = {
   'story-node': StoryNode
 };

 const nodes = writable([ {
   id: '1', 
   type: 'story-node',
   position: { x: 0, y: 0 }, 
   data: { title: 'default_title', content: Array()}, 
 },
 {
   id: '2',
   position: { x: 100, y: 100 },
   data: { label: 'world' },
 },]);
 const edges = writable([]);

 let menu: { id: string; top?: number; left?: number; right?: number; bottom?: number } | null;
  let width: number;
  let height: number;

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
        <MiniMap nodeStrokeWidth={3} pannable zoomable/>
        {#if menu}
        <NodeMenu
          onClick={handlePaneClick}
          id={menu.id}
          top={menu.top}
          left={menu.left}
          right={menu.right}
          bottom={menu.bottom}
        />
      {/if}
      </SvelteFlow>  
    </div>
      </div>
