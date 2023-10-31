<svelte:options
    customElement={{
        tag: "lens-options",
        props: {
            options: {type: 'Object'},
            catalogueData: { type: "Object" },
            cqlMapping: { type: "Object"}
        },
    }}
/>

<script lang="ts">
    /**
     * this component takes the catalogue and all options set from the project and passes them to the appropriate store
     * TODO: refactor all mappings and configurations to be passed in here
    */
    import {lensOptions} from "../stores/options";
    import { catalogue } from "../stores/catalogue";
    import type { Criteria } from "../types/treeData";
    import { cqlMappingStore } from "../stores/mappings";


    export let options: object = {};
    export let catalogueData: Criteria[] = [];
    export let cqlMapping: object = {};
    
    
    $: $lensOptions = options;
    $: $catalogue = catalogueData;
    $: $cqlMappingStore = cqlMapping;

</script>