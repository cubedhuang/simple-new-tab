<script lang="ts">
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let pressed: boolean | undefined = undefined;

	let className = '';

	export { className as class };
</script>

<button
	{type}
	aria-pressed={pressed}
	class="px-2 py-0.5 border-2 transition-colors rounded-lg
	{pressed
		? 'bg-accent/10 text-accent border-accent/50'
		: 'bg-control border-current/10 hover:text-accent focus:text-accent'} {className}"
	on:click
>
	<slot />
</button>
