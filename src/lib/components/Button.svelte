<script lang="ts">
	export let type: 'button' | 'submit' | 'reset' = 'button';
</script>

<button
	{type}
	class="px-2 py-1 bg-black/30 hover:text-accent focus:text-accent focus:outline-none transition-colors rounded-lg"
	on:click
>
	<slot />
</button>
