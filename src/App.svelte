<script lang="ts">
	import Clock from './lib/components/Clock.svelte';
	import Discord from './lib/components/Discord.svelte';
	import Links from './lib/components/Links.svelte';
	import Quote from './lib/components/Quote.svelte';
	import Settings from './lib/components/Settings.svelte';
	import SettingsIcon from './lib/components/icons/SettingsIcon.svelte';
	import Weather from './lib/components/Weather.svelte';
	import { clock, tweaks } from './lib/stores';

	let unfocused = false;

	addEventListener('blur', () => {
		unfocused = true;
	});

	addEventListener('focus', () => {
		unfocused = false;
	});

	let settingsOpen = false;
</script>

<svelte:head>
	<title>{$tweaks.capitalizedTitle ? 'New Tab' : 'new tab'}</title>
</svelte:head>

<main
	class="min-h-screen p-16 grid grid-cols-2 gap-8 font-main text-body transition-colors duration-300"
	class:unfocused
>
	<div class="flow">
		<h1>
			{$tweaks.capitalizedTitle ? 'New Tab' : 'new tab'}
		</h1>

		<Quote />
		<Links />

		<button
			class="hover:text-accent hover:rotate-[22.5deg] transition"
			title="open settings"
			on:click={() => (settingsOpen = true)}
		>
			<SettingsIcon />
		</button>
	</div>

	<div class="flow text-right">
		{#if !$clock.hidden}
			<Clock />
		{/if}

		<Weather />
		<Discord />
	</div>

	<Settings bind:open={settingsOpen} />
</main>
