<script lang="ts">
	import { get } from "svelte/store";
	import { codeGenerationTriggered, generatedCode, nodes, startNode, variables } from "./stores";

    type YarnNodeData = {
        title: string;
        group?: string;
        color?: string;
        background?: string;
        position?: {
            x: number,
            y: number
        };
        content: string;
    }

    let yarnNode: YarnNodeData = {
        title: 'title: ',
        color: 'color: ',
        content: ''
    };

    let yarnCode = '';
    let yarnJumps = '';
    let tabCounter = 0;
    let nodeChildren: Array<Array<Node>> = [];

        function convertFontEffects(nodeContent: string){
            return nodeContent.replace(/<strong>/g, "<b>").replace(/<\/strong>/g, "</b>").replace(/<em>/g, "<i>").replace(/<\/em>/g, "</i>");
        }

        function getAllChildren(parentNode): boolean {
        const children = parentNode.data.outgoers as Node[];
        nodeChildren.push(children);
        const firstNode = children[0];
        if(firstNode && firstNode.type == "story-node") return true;
        for(const child of children){
            while(child.data.outgoers.length != 0){
                if(getAllChildren(child)){
                    break;
                }
            }
        }
       return true;
    }

    function writeJumps(childrenArray) {
       childrenArray.forEach(child => {
        tabCounter += 1;
        if(child.type == "story-node"){
                    yarnJumps = yarnJumps + "\t".repeat(tabCounter) + "<<jump " + get(child.data.title) + ">>";
                    tabCounter++;
                }
                else {
                    let choiceContent = get(child.data.content) as string;
                    yarnJumps = yarnJumps + "\n" + "\t".repeat(tabCounter) + "-> " + convertFontEffects(choiceContent).replace(/<\/?p>/g, "") + "\n";
                    tabCounter++;

                }
        for(let i = 1; i < nodeChildren.length; i++){
            if(nodeChildren[i] == child.data.outgoers){
                writeJumps(nodeChildren[i]);
            }
        }
        tabCounter = 0;
       });
    }

    function generateCode(){
        const startingNode = $nodes.find(node => get(node.data.title) == $startNode);
        yarnNode.title = yarnNode.title + get(startingNode.data.title);
        yarnNode.color = yarnNode.color + get(startingNode.data.color);
        yarnNode.content = get(startingNode.data.content);
        let yarnDeclaredVariables = '';
        $variables.forEach(variable => {
            yarnDeclaredVariables = yarnDeclaredVariables + "<<declare $" + get(variable.name) + " = \"" + get(variable.declaredValue) + "\">>\n";            
        });

        getAllChildren(startingNode);
        writeJumps(nodeChildren[0]);

        const yarnNodeText = yarnNode.title + "\n" + yarnNode.color + "\n---\n" + yarnDeclaredVariables + convertFontEffects(yarnNode.content).replace(/<\/?p>/g, "") + yarnJumps + "\n===\n\n";
        yarnCode = yarnCode + yarnNodeText;
        $nodes.forEach(node => {
            if(get(node.data.title) != $startNode){
                yarnNode = {title: 'title: ', color: 'color: ', content: ''};
                nodeChildren = [];
                yarnJumps = '';
                if(node.type == "story-node"){
                    yarnNode.title = yarnNode.title + get(node.data.title);
                    yarnNode.color = yarnNode.color + get(node.data.color);
                    yarnNode.content = get(node.data.content);
                    getAllChildren(node);
                    writeJumps(nodeChildren[0]);
                    const yarnNodeText = yarnNode.title + "\n" + yarnNode.color + "\n---\n" + convertFontEffects(yarnNode.content).replace(/<\/?p>/g, "") + yarnJumps + "\n===\n\n";
                    yarnCode = yarnCode + yarnNodeText;
                }
            } 
        });
        generatedCode.set(yarnCode);    
    }

    $: if($codeGenerationTriggered){
        generateCode();
        $codeGenerationTriggered = false;
    }

</script>
