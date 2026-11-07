<script lang="ts">
	export let type: 'button' | 'submit' | 'reset' = 'button';

	let className = '';

	export { className as class };
</script>

<button
	{type}
	class="px-2 py-1 bg-control hover:text-accent focus:text-accent focus:outline-hidden transition-colors rounded-lg {className}"
	on:click
>
	<slot />
</button>
