<script lang="ts">
	export let type: 'button' | 'submit' | 'reset' = 'button';

	let className = '';

	export { className as class };
</script>

<button
	{type}
	class="px-2 py-0.5 bg-control border-2 border-current/10 hover:text-accent focus:text-accent focus:outline-hidden transition-colors rounded-lg {className}"
	on:click
>
	<slot />
</button>
