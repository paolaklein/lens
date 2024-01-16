<svelte:options
    customElement={{
        tag: "lens-query-download-button",
    }}
/>

<script lang="ts">
    import { queryStore } from "../../stores/query";
    export let title: string = "Suche kopieren";
    

    let showCheckmark: boolean = false;
    /**
     * copys the current query to the clipboard as URL
     */
    const downloadQuery = (): void => {
        const splitUrl = window.location.href.split("/?query=")[0];
        const queryAsBase64 = btoa(JSON.stringify($queryStore))
        navigator.clipboard.writeText(splitUrl + "?query=" + queryAsBase64);
        showCheckmark = true;
        setTimeout(() => {
            showCheckmark = false;
        }, 1000);
    }

</script>

<div part="container">
    <button part="button" on:click={downloadQuery}>
        {title}
    </button>
    {#if showCheckmark}
    <span part="checkmark">
        &#10004;
    </span>
    {/if}
</div>