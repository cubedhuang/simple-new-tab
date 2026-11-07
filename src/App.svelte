<script lang="ts">
	import Clock from './lib/components/Clock.svelte';
	import Discord from './lib/components/Discord.svelte';
	import Links from './lib/components/Links.svelte';
	import Quote from './lib/components/Quote.svelte';
	import Settings from './lib/components/Settings.svelte';
	import SettingsIcon from './lib/components/icons/SettingsIcon.svelte';
	import TabStats from './lib/components/TabStats.svelte';
	import Weather from './lib/components/Weather.svelte';
	import { clock, tweaks } from './lib/stores.svelte';

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
	<title>{tweaks.value.capitalizedTitle ? 'New Tab' : 'new tab'}</title>
</svelte:head>

<main
	class="min-h-screen p-16 sm:flex gap-8 font-main text-body transition-colors duration-300"
	class:unfocused
>
	<div class="min-w-0 flex-1 flow">
		<h1>
			{tweaks.value.capitalizedTitle ? 'New Tab' : 'new tab'}
		</h1>

		{#if !tweaks.value.hideQuote}
			<Quote />
		{/if}
		<Links />

		<button
			class="hover:text-accent hover:rotate-[22.5deg] transition"
			title="open settings"
			on:click={() => (settingsOpen = true)}
		>
			<SettingsIcon />
		</button>
	</div>

	<div class="max-w-96 shrink-0 flow text-right">
		{#if !clock.value.hidden}
			<Clock />
		{/if}

		<Weather />

		{#if !tweaks.value.hideTabCount}
			<TabStats />
		{/if}

		<Discord />
	</div>

	<Settings bind:open={settingsOpen} />
</main>
