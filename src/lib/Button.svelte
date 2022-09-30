<script lang="ts">
	export let type = "button";
</script>

<button
	{type}
	class="px-2 py-1 bg-black/30 hover:text-white focus:text-white focus:outline-none transition-colors rounded"
	on:click
>
	<slot />
</button>
