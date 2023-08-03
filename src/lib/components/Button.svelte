<script lang="ts">
	export let type: 'button' | 'submit' | 'reset' = 'button';

	let className = '';

	export { className as class };
</script>

<button
	{type}
	class="px-2 py-1 bg-black/30 hover:text-accent focus:text-accent focus:outline-none transition-colors rounded-lg {className}"
	on:click
>
	<slot />
</button>
