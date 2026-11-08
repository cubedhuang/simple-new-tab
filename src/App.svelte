<script lang="ts">
	import Clock from './lib/components/Clock.svelte';
	import Discord from './lib/components/Discord.svelte';
	import Links from './lib/components/Links.svelte';
	import LinksEditor from './lib/components/LinksEditor.svelte';
	import Quote from './lib/components/Quote.svelte';
	import Settings from './lib/components/Settings.svelte';
	import EditIcon from './lib/components/icons/EditIcon.svelte';
	import SettingsIcon from './lib/components/icons/SettingsIcon.svelte';
	import TabStats from './lib/components/TabStats.svelte';
	import Weather from './lib/components/Weather.svelte';
	import { clock, tweaks, withViewTransition } from './lib/stores.svelte';

	let unfocused = false;

	addEventListener('blur', () => {
		unfocused = true;
	});

	addEventListener('focus', () => {
		unfocused = false;
	});

	let settingsOpen = false;
	let editingLinks = false;

	function setEditingLinks(editing: boolean) {
		if (editingLinks === editing) return;
		withViewTransition(() => (editingLinks = editing));
	}
</script>

<svelte:window
	on:keydown={e => {
		if (e.key === 'Escape' && !settingsOpen) setEditingLinks(false);
	}}
/>

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
		{#if editingLinks}
			<LinksEditor ondone={() => setEditingLinks(false)} />
		{:else}
			<Links />
		{/if}
	</div>

	<div class="ml-auto max-sm:mt-8 max-w-96 shrink-0 flow text-right">
		{#if !clock.value.hidden}
			<Clock />
		{/if}

		{#if !tweaks.value.hideWeather}
			<Weather />
		{/if}

		{#if !tweaks.value.hideTabCount}
			<TabStats />
		{/if}

		<Discord />

		<div class="flex justify-end gap-3">
			<button
				class="hover:text-accent transition"
				class:text-accent={editingLinks}
				title={editingLinks ? 'stop editing links' : 'edit links'}
				aria-pressed={editingLinks}
				on:click={() => setEditingLinks(!editingLinks)}
			>
				<span class="block transition {editingLinks ? '-rotate-45' : ''}">
					<EditIcon />
				</span>
			</button>

			<button
				class="group hover:text-accent transition"
				title="open settings"
				on:click={() => (settingsOpen = true)}
			>
				<span
					class="block transition {settingsOpen
						? 'text-accent rotate-[-22.5deg]'
						: 'group-hover:rotate-[-22.5deg]'}"
				>
					<SettingsIcon />
				</span>
			</button>
		</div>
	</div>

	<Settings
		bind:open={settingsOpen}
		oneditlinks={() => {
			settingsOpen = false;
			setEditingLinks(true);
		}}
	/>
</main>
