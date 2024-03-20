<script lang="ts">
    import {
        queryStore,
        removeItemFromQuery,
        removeValueFromQuery,
    } from "../../stores/query";
    import type { QueryItem, QueryStore } from "../../types/queryData";
    export let itemToDelete: { type: string; index: number; item: QueryItem };

    const { type, index, item } = itemToDelete;

    /**
     * deletes the given item from the query
     * can be a group, item or value
     */
    const deleteItem = (): void => {
        if (type === "group") {
            queryStore.update((store: QueryStore) => {
                store.include = store.include.filter((group, i) => i !== index);
                if (store.include.length === 0) {
                    store.include = [[]];
                }
                return store;
            });
        }
        if (type === "item") {
            removeItemFromQuery(item, index);
        }
        if (type === "value") {
            removeValueFromQuery(item, index);
        }
    };
</script>

<button
    part="query-delete-button query-delete-button-{type}"
    on:click={deleteItem}>&#x2715;</button
>
