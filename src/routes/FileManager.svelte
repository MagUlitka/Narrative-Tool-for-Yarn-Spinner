<script lang="ts">
	import { generatedCode, saveFileTriggered } from "./stores";

    // const { writeFile } = require('./FileWriter');

    // function saveFile(fileContent: string){
    //     writeFile('new_script.yarn',fileContent)
    //     console.log("File saved!");
    // }

    $: if($saveFileTriggered){
        // saveFile($generatedCode);
        $saveFileTriggered = false;
    }
</script>