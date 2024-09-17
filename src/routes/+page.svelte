
<script lang="ts">
  import { SvelteFlow, Background, Controls, MiniMap, useEdges } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import StoryNode from './StoryNode.svelte';
  import ChoiceNode from './ChoiceNode.svelte';
  import NodeMenu from './NodeMenu.svelte';
  import { Navbar, Button, Modal, Card, Select} from 'flowbite-svelte';
  import { get, writable, type Writable } from 'svelte/store';
  import NodeEditPanel from './NodeEditPanel.svelte';
  import { nodes, edges, variables, codeGenerationTriggered, startNode, generatedCode } from './stores';
	import { onMount } from 'svelte';
  import { nodeRefs } from './stores';
	import VariablePanel from './VariablePanel.svelte';
  import { focusedNodeContent } from './stores';
  import { isGlobalMode } from './stores';
	import CodeGenerator from './CodeGenerator.svelte';

  const nodeTypes = {
    'story-node': StoryNode,
    'choice-node': ChoiceNode
  };

  let menu: { id: string; top?: number; left?: number; right?: number; bottom?: number } | null;
  let width: number;
  let height: number;

  let editPanel: {nodeId: string; nodeTitle: Writable<string>; deltaInput: Writable<any>; color: Writable<string>; content: Writable<string>} | null;

  let editPanelRef: HTMLDivElement | null = null;

  export let defaultModal = false;
  let modalTitle = "Generate code";


  
  function setCurrentValues(){
        $variables.forEach(variable => {
            let regex = new RegExp(`&lt;&lt;set\\s\\$${get(variable.name)}\\sto\\s([\\w\\d]+)&gt;&gt;`, 'g');
            const matches = Array.from(get(focusedNodeContent).matchAll(regex));
            if(matches.length == 0){
                variable.currentValue.set(get(variable.declaredValue));
              }
              else {
            for (const match of matches) {
                variable.currentValue.set(match[1]);
            }
          }
        });
    }

  function handleContextMenu({ detail: { event, node } }) {
    event.preventDefault();
    isGlobalMode.set(false);
    focusedNodeContent.set(get(node.data.content));
    setCurrentValues();
    menu = {
      id: node.id,
      top: event.clientY < height - 200 ? event.clientY : undefined,
      left: event.clientX < width - 200 ? event.clientX : undefined,
      right: event.clientX >= width - 200 ? width - event.clientX : undefined,
      bottom: event.clientY >= height - 200 ? height - event.clientY : undefined
    };
  }

  function handlePaneClick(event: MouseEvent) {
    event.preventDefault();
    let target = event.target as HTMLElement;
    if(event.button === 2){
      nodeRefs.subscribe(refs => {
        const nodeRef = refs.find(ref => {
          return ref.nodeRef?.contains(event.target as Node);
        });
        if (!nodeRef) {
          menu = {
      id: '0',
      top: event.clientY < height - 200 ? event.clientY : undefined,
      left: event.clientX < width - 200 ? event.clientX : undefined,
      right: event.clientX >= width - 200 ? width - event.clientX : undefined,
      bottom: event.clientY >= height - 200 ? height - event.clientY : undefined
    };
      }
    })
    console.log(get(isGlobalMode));
    isGlobalMode.set(true);
    focusedNodeContent.set("");
    }
    else {
      menu = null;
    if (editPanelRef && !editPanelRef.contains(event.target as Node) && !target) {
      editPanel = null;
    }
    }
    
  }

  onMount(() => {
    document.addEventListener('contextmenu', handlePaneClick);
  });

  function handleEditNode(event) {
    const { id, title, delta, content, color } = event.detail;
    editPanel = { nodeId: id, nodeTitle: title, deltaInput: delta, content: content, color: color };
  }

  function deleteEdge(event){
    const id  = event.detail.edge.id;
    $edges = $edges.filter((edge) => edge.id !== id);
  }

</script>

  <div id="pageBody">
        <div class="relative px-8">
            <Navbar class="px-2 sm:px-4 py-2.5 fixed w-full z-20 top-0 start-0 border-b">
                <div class="flex md:order-2">
                  <div id="navspace">APP</div>
                    <Button size="sm">Load a tree</Button>
                    <Button size="sm" on:click={() => {defaultModal = true;}}>Save a tree & generate code</Button>
                  </div>
            </Navbar>
          </div>
    <div id="svelteCanvas" bind:clientWidth={width} bind:clientHeight={height}>
      <SvelteFlow {nodes} {edges} {nodeTypes} colorMode="dark" on:nodecontextmenu={handleContextMenu}
      on:paneclick={(event) => handlePaneClick(event)}  on:contextmenu={(event) => handlePaneClick(event)} fitView defaultEdgeOptions={{deletable: true}} on:edgeclick={deleteEdge}>
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
      <NodeEditPanel bind:panelRef={editPanelRef}
      id={editPanel.nodeId} title={editPanel.nodeTitle} deltaInput={editPanel.delta} content={editPanel.content} color={editPanel.color} on:close={() => editPanel = null}/>
          {/if}
      <VariablePanel/>
      {#if $codeGenerationTriggered}
      <CodeGenerator/>
      {/if}
        {#if modalTitle == "Generate code"}
        <Modal title={modalTitle} bind:open={defaultModal} autoclose outsideclose>
        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">Choose the starting node:</p>
        <Select bind:value={$startNode}>
          {#each $nodes as node}
          {#if node.type == "story-node"}
          <option value="{get(node.data.title)}">{get(node.data.title)}</option> 
          {/if}
          {/each}
      </Select>
      {#if $startNode != ''}
      <Button size="sm" on:click={() => {modalTitle = "Code generated!"; codeGenerationTriggered.set(true);}}>Generate code</Button>
      {/if}
      </Modal>
        {:else}
        <Modal title={modalTitle} bind:open={defaultModal} autoclose outsideclose>
        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">You now can preview and copy the code or save it in /saves folder.</p>
        <div id="generatedCode">
          <p class="font-normal text-gray-700 dark:text-gray-400 leading-tight">{$generatedCode}</p>
        </div>
        <Button>Copy to clipboard</Button>
        <svelte:fragment slot="footer">
          <Button on:click={() => alert('Handle "success"')}>Export to a .yarn file</Button>
          <Button color="alternative">Regenerate</Button>
        </svelte:fragment>
      </Modal>
      {/if}
      </SvelteFlow>  
    </div>
      </div>
<style>
  #generatedCode {
    height: 300px !important;
    width: 100%;
    overflow-y: auto;
    background-color: #384a6494;
    padding: 20px;
    border-radius: 2%;
    white-space: pre-wrap;
  }

</style>