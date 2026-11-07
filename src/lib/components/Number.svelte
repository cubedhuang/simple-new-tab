<script lang="ts">
	export let value: number;
	export let step: number | undefined = undefined;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
</script>

<input
	class="w-full px-2 py-1 bg-control focus:text-accent focus:outline-hidden transition-colors rounded-lg placeholder:text-body placeholder:opacity-50"
	type="number"
	bind:value
	{step}
	{min}
	{max}
/>
