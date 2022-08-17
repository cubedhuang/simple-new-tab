<script lang="ts">
	import Clock from "./lib/Clock.svelte";
	import Discord from "./lib/Discord.svelte";
	import Links from "./lib/Links.svelte";
	import Quote from "./lib/Quote.svelte";
	import Settings from "./lib/Settings.svelte";
	import SettingsIcon from "./lib/SettingsIcon.svelte";
	import Weather from "./lib/Weather.svelte";

	let unfocused = false;

	addEventListener("blur", () => {
		unfocused = true;
	});

	addEventListener("focus", () => {
		unfocused = false;
	});

	let settingsOpen = false;
</script>

<main
	class="min-h-screen p-16 flex gap-8 font-main text-light transition-colors duration-300"
	class:unfocused
>
	<div class="flex-1 flow">
		<h1>new tab</h1>

		<Quote />
		<Links />

		<button
			class="hover:text-white hover:rotate-[22.5deg] transition"
			title="open settings"
			on:click={() => (settingsOpen = true)}
		>
			<SettingsIcon />
		</button>
	</div>

	<div class="flow text-right">
		<Clock />
		<Weather />
		<Discord />
	</div>

	<Settings bind:open={settingsOpen} />
</main>
