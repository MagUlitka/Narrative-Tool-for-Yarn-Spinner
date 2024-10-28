

<script lang="ts">
  import { SvelteFlow, Background, Controls, MiniMap, useSvelteFlow, SvelteFlowProvider } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import StoryNode from './StoryNode.svelte';
  import ChoiceNode from './ChoiceNode.svelte';
  import NodeMenu from './NodeMenu.svelte';
  import { Navbar, Button, Modal, Select, Textarea, Fileupload, Label} from 'flowbite-svelte';
  import { get, writable, type Writable } from 'svelte/store';
  import NodeEditPanel from './NodeEditPanel.svelte';
  import { nodes, edges, variables, codeGenerationTriggered, startNode, generatedCode, saveFileTriggered, yarnConversionCode, treeLoadingTriggered, fileLoader, fileSelected} from './stores';
	import { onMount } from 'svelte';
  import { nodeRefs } from './stores';
	import VariablePanel from './VariablePanel.svelte';
  import { focusedNodeContent } from './stores';
  import { isGlobalMode } from './stores';
	import CodeGenerator from './CodeGenerator.svelte';
  import { copy } from 'svelte-copy';
	import FileManager from './FileManager.svelte';
	import TreeLoader from './TreeLoader.svelte';

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
  export let loadModal = false;
  let modalTitle = "Generate code";



  $: if(!defaultModal){
    $generatedCode = '';
    $startNode = '';
    modalTitle = "Generate code";
    $saveFileTriggered = false;
  }

  function handleFileChange() {
    if ($fileLoader && $fileLoader.files && $fileLoader.files.length > 0) {
      fileSelected.set(true);
      console.log('File selected:', $fileLoader.files[0].name);
    } else {
      fileSelected.set(false);
    }
  }

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
    //console.log(get(isGlobalMode));
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
                  <div id="navspace">Narrative Tool for Yarn Spinner</div>
                    <Button size="sm" on:click={() => {loadModal = true; defaultModal = false;}}>Load a tree</Button>
                    <Button size="sm" on:click={() => {defaultModal = true; loadModal = false;}}>Save a tree & generate code</Button>
                  </div>
            </Navbar>
          </div>
    <div id="svelteCanvas" bind:clientWidth={width} bind:clientHeight={height}>
      
      <SvelteFlow {nodes} {edges} {nodeTypes} fitView colorMode="dark" on:nodecontextmenu={handleContextMenu}
      on:paneclick={(event) => handlePaneClick(event)}  on:contextmenu={(event) => handlePaneClick(event)} defaultEdgeOptions={{deletable: true}} on:edgeclick={deleteEdge}>
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
      <Modal title="Load the tree" bind:open={loadModal} autoclose outsideclose>
      <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">Paste the code:</p>
      <Textarea id="yarnConversionInput" rows=15 placeholder="Paste your .yarn code here" bind:value={$yarnConversionCode}/>
      <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">Or upload the file from disk:</p>
      <Label class="pb-2">Upload file</Label>
      <input type='file' id="fileLoader" bind:this={$fileLoader} on:change={handleFileChange}/>
   {#if $yarnConversionCode != '' || fileSelected}
    <Button size="sm" on:click={() => {treeLoadingTriggered.set(true)}}>Load tree</Button>
    {/if}
    </Modal>
    {#if $treeLoadingTriggered}
    <TreeLoader/>
    {/if}
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
        <Modal title={modalTitle} bind:open={defaultModal} outsideclose>
        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">You now can preview and copy the code or save it in /saves folder.</p>
        <div id="generatedCode">
          <p class="font-normal text-gray-700 dark:text-gray-400 leading-tight">{$generatedCode}</p>
        </div>
        <button use:copy={$generatedCode} on:svelte-copy={(event) => alert("Copied to clipboard!")}>Copy to clipboard</button>
        <svelte:fragment slot="footer">
          <Button disabled on:click={() => ($saveFileTriggered = true)}>Export to a .yarn file</Button>
        </svelte:fragment>
        {#if $saveFileTriggered}
        <FileManager/>
        {/if}
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