import { writable } from "svelte/store";

export const cqlStore = writable<string>()