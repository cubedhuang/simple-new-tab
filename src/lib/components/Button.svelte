<script lang="ts">
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let pressed: boolean | undefined = undefined;

	let className = '';

	export { className as class };
</script>

<button
	{type}
	aria-pressed={pressed}
	class="px-2 py-0.5 border-2 border-current/10 transition-colors rounded-lg
	{pressed
		? 'bg-accent text-background'
		: 'bg-control hover:text-accent focus:text-accent'} {className}"
	on:click
>
	<slot />
</button>
