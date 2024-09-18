<script lang="ts">
	import { createNode, edges, fileLoader, nodes, treeLoadingTriggered, yarnConversionCode } from "./stores";

    let fileName: string | null = null;

    function createDelta(content: string){
        const lines = content.split("\n");
        let deltaArray
        
        console.log(lines);
        lines.forEach(line => {
        const pattern = /(<b>|<i>)(.*)(<\/b>|<\/i>)/g;
        const matches = pattern.exec(line);
         if(matches){
            matches.forEach(match => {
                console.log(match);
            });

        }


            
        });
        //return delta;

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

        const pattern = /title:((.*)\n)*?===/g;
        const matches = $yarnConversionCode.match(pattern);

        if (matches) {
            const titlePattern = /title:((.*)\n)/g;
            const colorPattern = /color:((.*)\n)/g;
            const positionPattern = /position:\s*(-?\d+),\s*(-?\d+)/;
            const contentPattern = /---\n((.*)\n)*?((\t)*->|<<jump .*|===)/g;
            matches.forEach(match => {
                
                const titleMatch = match.match(titlePattern);
                const title = titleMatch[0].replace(/title: /g, "");
                const colorMatch = match.match(colorPattern);
                const color = colorMatch[0].replace(/color: /g, "");
                const positionMatch = positionPattern.exec(match);
                const x = Number(positionMatch[1]);
                const y = Number(positionMatch[2]);
                const contentMatch = contentPattern.exec(match);
                const content = contentMatch[0].replace(/<<declare .*\n/g,"").replace(/---\n/g, "").replace(/((\t)*->|<<jump .*)/g, "");
                createDelta(content);
                //const node = createNode('story-node',x,y,color,createDelta(content),content,title);
            });

        
        }
      }

    $: {if($treeLoadingTriggered && $yarnConversionCode == ''){
        onFileUpload();
    }
    else if($treeLoadingTriggered && $yarnConversionCode != ''){
        loadTree();
    }}
  </script>