<script lang="ts">
    export let span: boolean
    export let name: string
    export let type: "number" | "operator" | "function.AC" | "function.DEL" | "function.EQ"
    export let button = ''
</script>
<svelte:options accessors></svelte:options>

<button bind:this={button} class="button {span? 'span-two' : ''}">
    {name}
</button>