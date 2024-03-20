<svelte:options
    customElement={{
        tag: "lens-search-bar-multiple",
        props: {
            treeData: { type: "Object" },
            noMatchesFoundMessage: { type: "String" },
            chips: { type: "Boolean" },
        },
    }}
/>

<script lang="ts">
    import { queryStore } from "../../stores/query";
    import SearchBarComponent from "./SearchBarComponent.wc.svelte";
    import type { QueryStore } from "../../types/queryData";

    /**
     * props
     * @param treeData takes a Category tree to build the autocomplete items from
     * @param noMatchesFoundMessage takes a string to display when no matches are found
     */
    export let noMatchesFoundMessage: string = "No matches found";
    export let placeholderText: string = "Type to filter conditions";

    /**
     * Adds a new search bar to the query store
     */
    const addSearchBar = (): void => {
        queryStore.update((queryStore: QueryStore): QueryStore => {
            queryStore.include.push([]);
            return queryStore;
        });
    };
</script>

<div part="lens-searchbar-multiple">
    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
    {#each $queryStore.include as _, index}
        <div part="search-bar-wrapper">
            <SearchBarComponent
                {noMatchesFoundMessage}
                {placeholderText}
                {index}
            />
            {#if index === $queryStore.include.length - 1}
                <button part="lens-searchbar-add-button" on:click={addSearchBar}
                    >+</button
                >
            {:else}
                <span part="lens-searchbar-or-indicator">or</span>
            {/if}
        </div>
    {/each}
    <!-- here is a slot mainly for the search button if whished to place in this component -->
    <slot />
</div>
