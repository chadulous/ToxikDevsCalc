<script lang="ts">
    export let span: boolean
    export let name: string
    export let type
    export let button
    console.log(type)
</script>
<svelte:options accessors></svelte:options>

<button bind:this={button} class="button {span? 'span-two' : ''}">
    {name}
</button>