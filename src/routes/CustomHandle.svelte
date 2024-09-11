<script lang="ts">
	import { getOutgoers, Handle, Position, type IsValidConnection } from "@xyflow/svelte";
	import { edges, nodes } from "./stores";

    let isConnectableStart = true;
    let isConnectableEnd = true;
    let isValidConnection: IsValidConnection;
    export let handleType;
    export let position: Position;
    export let data;

    function getSourceNode(connection) {
        const sourceNode = $nodes.find(node => node.id === connection.source);
            return sourceNode;
    }
    function getTargetNode(connection) {
        const targetNode = $nodes.find(node => node.id === connection.target);
            return targetNode;
    }

function updateConnectionStatusOut() {
    const outgoers = getOutgoers({ id: data.nodeId }, $nodes, $edges);
        const storyNodeConnectionsOut = outgoers.filter(node => node.type === "story-node").length;
        const choiceNodeConnectionsOut = outgoers.filter(node => node.type === "choice-node").length;
        isConnectableEnd = storyNodeConnectionsOut < 1;
        isValidConnection = (connection) => {
          const targetNode = getTargetNode(connection);
          if(targetNode?.type == 'story-node'){
            return isConnectableEnd && choiceNodeConnectionsOut == 0;
          }
          else {
            return isConnectableEnd;
          }
        }
    }  
  
  function updateConnectionStatusIn() {
     return isValidConnection = (connection) => {
    const sourceNode = getSourceNode(connection);
            const SourceOutgoers = sourceNode?.data.outgoers as Node[];
            const storyNodeConnectionsIn = SourceOutgoers.filter(node => node.type === "story-node").length;
            const choiceNodeConnectionsIn = SourceOutgoers.filter(node => node.type === "choice-node").length;
            isConnectableStart = storyNodeConnectionsIn < 1; 
              if(sourceNode?.type === 'story-node'){
                return isConnectableStart && choiceNodeConnectionsIn == 0; 
              }
              else {
                return isConnectableStart;
              }
            };
  }

    $: {
      if ($nodes && $edges && data.nodeId) {
        if(handleType == "source"){
            updateConnectionStatusOut();
        }
        else updateConnectionStatusIn();
      }
    }

</script>
<Handle type="{handleType}" position={position} isValidConnection={isValidConnection}/>