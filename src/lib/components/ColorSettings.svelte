<script lang="ts">
	import { isSameColor } from '../oklch';
	import { applyTheme, colors, resetColors } from '../stores.svelte';
	import { themes, type Theme } from '../themes';

	import Button from './Button.svelte';
	import ColorPicker from './ColorPicker.svelte';

	let editing = $state<string | null>(null);

	function isActive(theme: Theme) {
		return Object.entries(theme.colors).every(([name, color]) =>
			isSameColor(colors.value[name] ?? '', color)
		);
	}
</script>

<div class="mt-2 flex flex-wrap gap-1">
	{#each themes as theme}
		{@const active = isActive(theme)}
		<button
			type="button"
			class="flex items-center gap-2 px-2 py-0.5 rounded-lg border-2 {active
				? 'border-accent'
				: 'border-current/10'}"
			style:background={theme.colors.background}
			style:color={theme.colors.body}
			aria-pressed={active}
			onclick={() => applyTheme(theme)}
		>
			<span
				class="size-3 rounded-full"
				style:background={theme.colors.accent}
			></span>
			{theme.name}
		</button>
	{/each}
</div>

<div class="mt-4 flex flex-wrap gap-2">
	{#each Object.keys(colors.value) as name}
		<button
			type="button"
			class="flex bg-control cursor-pointer rounded-lg border-2 border-current/10 hover:text-accent transition-colors focus:text-accent"
			class:text-accent={editing === name}
			aria-expanded={editing === name}
			onclick={() => {
				editing = editing === name ? null : name;
			}}
		>
			<span
				class="w-4 rounded-l-lg border-r-2 border-gray-600/30"
				style:background={colors.value[name]}
			></span>

			<span class="px-2 py-0.5">
				{name}
			</span>
		</button>
	{/each}

	<Button on:click={resetColors}>reset colors</Button>
</div>

{#if editing && colors.value[editing] !== undefined}
	{#key editing}
		<ColorPicker label={editing} bind:value={colors.value[editing]} />
	{/key}
{/if}
