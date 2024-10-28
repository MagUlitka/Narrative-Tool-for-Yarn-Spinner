<script lang="ts">
	import { useNodes, useEdges } from "@xyflow/svelte";
	import { createNode, edges, fileLoader, lastId, nodes, recreateNode, treeLoadingTriggered, yarnConversionCode, fileSelected } from "./stores";

    let fileName: string | null = null;

    const allNodes = useNodes();
    const allEdges = useEdges();
    let nodesChildren: Array<string | null> = [];
    let nodesParents: Array<string> = [];

    const choiceColorPattern = /#color:\s*(#[0-9a-fA-F]{3,6})/;
    const choicePositionPattern = /#position:\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)/;
    const choiceIdPattern = /#id:(\d+)/;
    const choiceChildrenPattern = /#children:(\d+(?:,\d+)*)?/;

    function createDelta(content) {
    const lines = content.split("<br>");
    let deltaArray = [];
    const pattern = /(<b>(.*?)<\/b>)|(<i>(.*?)<\/i>)|([^<]+)(?=<|$)/g;

    lines.forEach(line => {
        const matches = [...line.matchAll(pattern)];
        if (matches.length > 0) {
            matches.forEach(match => {
                let deltaInsert;
                
                // Check for bold text
                if (match[1]) {
                    deltaInsert = { insert: match[2], attributes: { bold: true } };
                }
                // Check for italic text
                else if (match[3]) {
                    deltaInsert = { insert: match[4], attributes: { italic: true } };
                }
                // Check for plain text
                else if (match[5]) {
                    deltaInsert = { insert: match[5] };
                }
                
                // Add each part to the deltaArray
                if (deltaInsert) {
                    deltaArray.push(deltaInsert);
                }
            });
        }
        
        // Add newline at the end of each line
        deltaArray.push({ insert: '\n' });
    });
    return { ops: deltaArray };
}

    function joinNodes(nodeId1: string, nodeId2: string) {
    const newEdge = {
      id: `edge-${nodeId1}-${nodeId2}`,
      source: nodeId1,
      target: nodeId2,
    };
    $allEdges.push(newEdge);
}
  
    function onFileUpload() {
      if ($fileLoader && $fileLoader.files) {
        const file = $fileLoader.files[0]; 
        fileName = file.name;

      if(fileName.endsWith(".yarn")){
        const reader = new FileReader();

        reader.onload = function(event) {
        const fileContent = event.target?.result as string;
        $yarnConversionCode = fileContent;
      };
      reader.readAsText(file);
    }
      }
    }

    function loadTree(){
        $nodes = [];
        $edges = [];
        lastId.set(0);

        const pattern = /title:((.*)\n)*?===/g;
        const matches = $yarnConversionCode.match(pattern);

        if (matches) {
            const titlePattern = /title:((.*)\n)/g;
            const colorPattern = /color:((.*)\n)/g;
            const positionPattern = /position:\s*(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/;
            const contentPattern = /---\n((.*)\n)*?===/g;
            const choicePattern = /(\t)*->(.*)\n/g;
            const idPattern = /id: \d*/g;
            const childrenPattern = /children: (\d*(,))*\d*/g;
            matches.forEach(match => {               
                const titleMatch = match.match(titlePattern);
                const title = titleMatch[0].replace(/title: /g, "");
                const colorMatch = match.match(colorPattern);
                const color = colorMatch[0].replace(/color: /g, "");
                const positionMatch = positionPattern.exec(match);
                const x = Number(positionMatch[1]);
                const y = Number(positionMatch[3]);
                const contentMatch = contentPattern.exec(match);
                contentPattern.lastIndex = 0;
                const content = contentMatch[0].replace(/<<declare .*\n/g,"").replace(/---\n/g, "").replace(/((\t)*->(.*)\n|<<jump .*)/g,"").replace(/\n*===/g, "");
                const idMatch = match.match(idPattern);
                const id = idMatch[0].replace(/id: /g,"");
                const childrenMatch = match.match(childrenPattern);
                const children = childrenMatch[0].replace(/children: /g,"");
                const choices = [...contentMatch[0].matchAll(choicePattern)].map(match => match[2].trim());
                nodesChildren.push(children);
                nodesParents.push(id);
                choices.forEach(choice => {
                  const choiceColor = choiceColorPattern.exec(choice);
                  const choicePosition = choicePositionPattern.exec(choice);
                  const choiceId = choiceIdPattern.exec(choice);
                  const choiceChildren = choiceChildrenPattern.exec(choice);
                  const choiceContent = choice.replace(/#color:(#[0-9a-fA-F]{3,6}) #position:([-]?\d*\.?\d+),([-]?\d*\.?\d+) #id:(\d)* #children:(\d+(?:,\d+)*)?/g,"");
                  if (choiceId && choiceId[1] && choicePosition && choicePosition[1] && choicePosition[2] && choiceColor && choiceColor[1]) {
                  const choiceX = parseInt(choicePosition[1]);
                  const choiceY = parseInt(choicePosition[2]);
                  const choiceNode = recreateNode(choiceId[1],'choice-node',choiceX,choiceY,choiceColor[1],createDelta(choiceContent),choiceContent);
                  $allNodes.push(choiceNode);
                  }
                  if(choiceChildren && choiceChildren[1] != undefined && choiceId){
                  nodesChildren.push(choiceChildren[1]);
                  nodesParents.push(choiceId[1]);
                  }
                });
                const node = recreateNode(id,'story-node',x,y,color,createDelta(content),content,title);
                $allNodes.push(node);
                $allNodes = $allNodes;
                let maxId = 0;
                $allNodes.forEach(node => {
                  const nodeId = parseInt(node.id);
                  if(nodeId > maxId){
                    maxId = nodeId;
                  }
                });
                lastId.set(maxId);
            });
        }
        nodesParents.forEach((parentNodeId: string, index) => {
          const childNodes = nodesChildren[index];
          if (childNodes && parentNodeId === nodesParents[index]) {
              const childNodeList = childNodes.split(",");
              childNodeList.forEach(nodeId => {
                joinNodes(parentNodeId, nodeId);
              });
          }
        });
                $allEdges = $allEdges;
      }

    $: {if($treeLoadingTriggered && $yarnConversionCode == ''){
        onFileUpload();
        loadTree();
        $treeLoadingTriggered = false;
    }
    else if($treeLoadingTriggered && $yarnConversionCode != ''){
        loadTree();
        $treeLoadingTriggered = false;
    }}
  
</script>