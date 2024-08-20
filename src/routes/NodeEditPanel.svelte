<script lang="ts">
    import StoryNode from "./StoryNode.svelte";
    import NodeMenu from "./NodeMenu.svelte";
    import editedNode from "./NodeMenu.svelte";
	import { writable, type Writable } from "svelte/store";
    
    export let id: string;
    export let title: Writable<unknown>;
    export let content: Writable<unknown>;
    export let color: Writable<unknown>;
</script>
<div class="updatenode__panel">
    <label>Title:</label>
    <input bind:value={$title} />

    <label class="updatenode__bglabel">Color:</label>
    <input type="color" bind:value={$color}/>

    <label class="updatenode__content">Content:</label>
    <textarea bind:value={$content}></textarea>

  </div>

  <style>
    .updatenode__panel {
    position: absolute;
    left: 10px;
    top: 20%;
    z-index: 10;
    font-size: 12px;
    background-color: #eee;
    width: 25%;
    height: 50%;
}
  
    .updatenode__controls label {
      display: block;
    }
  
    .updatenode__bglabel {
      margin-top: 10px;
    }
  
    .updatenode__content {
      margin-top: 10px;
      display: flex;
      align-items: center;
    }
  </style> 