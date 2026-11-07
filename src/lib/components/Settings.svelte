<script lang="ts">
	import { fade } from 'svelte/transition';

	import {
		clock,
		colors,
		discordId,
		font,
		fontSize,
		columns,
		links,
		presetFonts,
		quoteTags,
		tweaks,
		weatherLayout,
		weatherPrecise,
		weatherUnits
	} from '../stores.svelte';

	import Button from './Button.svelte';
	import ColorSettings from './ColorSettings.svelte';
	import QuoteSettings from './QuoteSettings.svelte';
	import Text from './Text.svelte';
	import SettingsLinks from './SettingsLinks.svelte';
	import Number from './Number.svelte';

	export let open = true;

	let customFont = presetFonts.includes(font.value) ? '' : font.value;

	let resetSettingsConfirmation = false;

	let importSettings = '';
	let exportMessage = '';
	let importMessage = '';

	$: if (!open) {
		resetSettingsConfirmation = false;
		exportMessage = '';
		importMessage = '';
	}

	function modal(dialog: HTMLDialogElement) {
		const previouslyFocused = document.activeElement;

		dialog.showModal();
		dialog.focus();

		return {
			destroy() {
				if (previouslyFocused instanceof HTMLElement) {
					previouslyFocused.focus();
				}
			}
		};
	}

	function encodeSettings(data: unknown) {
		const bytes = new TextEncoder().encode(JSON.stringify(data));

		return btoa(
			Array.from(bytes, byte => String.fromCharCode(byte)).join('')
		);
	}

	function decodeSettings(encoded: string) {
		const binary = atob(encoded.trim());
		const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));

		try {
			return JSON.parse(
				new TextDecoder('utf-8', { fatal: true }).decode(bytes)
			);
		} catch {
			// backwards compatibility for old saves
			return JSON.parse(binary);
		}
	}

	async function exportToClipboard() {
		const data = {
			tweaks: tweaks.value,
			font: font.value,
			fontSize: fontSize.value,
			colors: colors.value,
			clock: clock.value,
			links: links.value,
			columns: columns.value,
			quoteTags: quoteTags.value,
			weatherPrecise: weatherPrecise.value,
			weatherUnits: weatherUnits.value,
			weatherLayout: weatherLayout.value,
			discordId: discordId.value
		};

		try {
			await navigator.clipboard.writeText(encodeSettings(data));
			exportMessage = 'Copied to clipboard!';
		} catch {
			exportMessage = 'Failed to copy settings to clipboard.';
		}
	}

	let weatherMessage = '';

	function togglePreciseWeather() {
		weatherMessage = '';
		if (weatherPrecise.value) {
			weatherPrecise.value = false;
			return;
		}
		navigator.geolocation.getCurrentPosition(
			() => {
				weatherPrecise.value = true;
			},
			error => {
				weatherMessage =
					error.code === error.PERMISSION_DENIED
						? 'Allow location access to use your precise location.'
						: "Couldn't get your location.";
			},
			{ maximumAge: 600_000 }
		);
	}

	function importFromText() {
		if (!importSettings) return;

		let data;

		try {
			data = decodeSettings(importSettings);
		} catch {
			importMessage = "That doesn't look like exported settings.";
			return;
		}

		if (
			typeof data !== 'object' ||
			data === null ||
			Array.isArray(data) ||
			(data.links && !Array.isArray(data.links)) ||
			(data.quoteTags && !Array.isArray(data.quoteTags))
		) {
			importMessage = "That doesn't look like exported settings.";
			return;
		}

		if (data.tweaks) tweaks.value = data.tweaks;
		if (data.font) font.value = data.font;
		if (data.fontSize) fontSize.value = data.fontSize;
		if (data.colors) colors.value = data.colors;
		if (data.clock) clock.value = data.clock;
		if (data.links) links.value = data.links;
		if (data.columns) columns.value = data.columns;
		if (data.quoteTags) quoteTags.value = data.quoteTags;
		// older exports have an OpenWeather API key instead, which used the browser's location
		if (typeof data.weatherPrecise === 'boolean') {
			weatherPrecise.value = data.weatherPrecise;
		} else if (data.weatherKey) {
			weatherPrecise.value = true;
		}
		if (data.weatherUnits) weatherUnits.value = data.weatherUnits;
		if (data.weatherLayout) weatherLayout.value = data.weatherLayout;
		if (data.discordId) discordId.value = data.discordId;

		customFont = presetFonts.includes(font.value) ? '' : font.value;
		importSettings = '';
		importMessage = 'Settings imported!';
	}
</script>

{#if open}
	<dialog
		class="fixed inset-0 z-10 grid place-items-center size-full max-w-none max-h-screen px-8 py-8 overflow-auto bg-transparent text-body outline-hidden before:fixed before:inset-0 before:-z-10 before:bg-black/50"
		aria-labelledby="settings-title"
		tabindex="-1"
		use:modal
		on:click|self={() => (open = false)}
		on:cancel|preventDefault={() => (open = false)}
		on:close={() => (open = false)}
		transition:fade={{ duration: 150 }}
	>
		<div
			class="w-full max-w-(--breakpoint-lg) p-8 rounded-xl bg-background flow"
		>
			<div class="flex items-baseline justify-between gap-2">
				<h2 id="settings-title">settings</h2>

				<Button on:click={() => (open = false)}>done</Button>
			</div>

			<div>
				<h3>tweaks</h3>

				<p class="mt-1 flex flex-wrap gap-1">
					<Button
						on:click={() => {
							tweaks.value.capitalizedTitle =
								!tweaks.value.capitalizedTitle;
						}}
					>
						{tweaks.value.capitalizedTitle
							? 'Capitalized'
							: 'Lowercase'}
						Title
					</Button>

					<Button
						on:click={() => {
							tweaks.value.hideQuote = !tweaks.value.hideQuote;
						}}
					>
						Quote
						{tweaks.value.hideQuote ? 'Hidden' : 'Shown'}
					</Button>

					<Button
						on:click={() => {
							tweaks.value.hideTabCount =
								!tweaks.value.hideTabCount;
						}}
					>
						Tab Stats
						{tweaks.value.hideTabCount ? 'Hidden' : 'Shown'}
					</Button>

					<Button
						on:click={() => {
							tweaks.value.bulletPoints =
								!tweaks.value.bulletPoints;
						}}
					>
						{tweaks.value.bulletPoints ? 'Bullet Points' : 'Dashes'}
					</Button>

					<Button
						on:click={() => {
							tweaks.value.boldHeadings =
								!tweaks.value.boldHeadings;
						}}
					>
						{tweaks.value.boldHeadings ? 'Bold' : 'Normal'} Headings
					</Button>
				</p>
			</div>

			<div>
				<h3>font</h3>

				<div class="mt-2 flex items-center">
					<div class="w-20">
						<Number
							bind:value={fontSize.value}
							step={5}
							min={50}
							max={200}
						/>
					</div>

					%
				</div>

				<div class="mt-4 flex flex-wrap gap-1">
					{#each presetFonts as name}
						<div class="contents" style:font-family={name}>
							<Button
								on:click={() => {
									font.value = name;
								}}
								pressed={name === font.value}
							>
								{name}
							</Button>
						</div>
					{/each}
				</div>

				<p class="mt-4">
					<Text
						placeholder="custom font name..."
						bind:value={customFont}
						on:input={() => {
							if (customFont === '') {
								font.value = 'Roboto Mono';
							} else {
								font.value = customFont;
							}
						}}
					/>
				</p>

				{#if customFont}
					<p class="mt-1">
						Make sure you have the custom font installed on your
						computer.
					</p>
				{/if}
			</div>

			<div>
				<h3>colors</h3>

				<ColorSettings />
			</div>

			<div>
				<h3>clock</h3>

				<p class="mt-1">
					<Button
						on:click={() => {
							clock.value.hidden = !clock.value.hidden;
						}}
					>
						Clock {clock.value.hidden ? 'Hidden' : 'Shown'}
					</Button>
				</p>

				<p class="mt-1">
					<Button
						on:click={() => {
							clock.value.longMonth = !clock.value.longMonth;
						}}
					>
						Month {clock.value.longMonth ? 'Name' : 'Number'}
					</Button>

					<Button
						on:click={() => {
							clock.value.showDay = !clock.value.showDay;
						}}
					>
						Day of Week {clock.value.showDay ? 'Shown' : 'Hidden'}
					</Button>

					<Button
						on:click={() => {
							clock.value.dayFirst = !clock.value.dayFirst;
						}}
					>
						{clock.value.dayFirst ? 'Day' : 'Month'} First
					</Button>
				</p>

				<p class="mt-1">
					<Button
						on:click={() => {
							clock.value.hour12 = !clock.value.hour12;
						}}
					>
						{clock.value.hour12 ? 12 : 24} Hour Format
					</Button>

					<Button
						on:click={() => {
							clock.value.showTimezone =
								!clock.value.showTimezone;
						}}
					>
						Timezone {clock.value.showTimezone ? 'Shown' : 'Hidden'}
					</Button>

					<Button
						on:click={() => {
							clock.value.hideSeconds = !clock.value.hideSeconds;
						}}
					>
						Seconds {clock.value.hideSeconds ? 'Hidden' : 'Shown'}
					</Button>
				</p>
			</div>

			<QuoteSettings />

			<SettingsLinks />

			<div>
				<h3>weather</h3>

				<p>
					This page uses the
					<a
						href="https://open-meteo.com/"
						class="underline underline-offset-2 hover:text-accent transition-colors"
					>
						Open-Meteo API</a
					>
					for weather data and
					<a
						href="https://www.bigdatacloud.com/"
						class="underline underline-offset-2 hover:text-accent transition-colors"
					>
						BigDataCloud</a
					> for location data. Your approximate location comes from your
					IP address. Turn on precise location to use your browser's location
					instead.
				</p>

				<p class="mt-1 flex flex-wrap gap-1">
					<Button
						on:click={() => {
							tweaks.value.hideWeather =
								!tweaks.value.hideWeather;
						}}
					>
						Weather {tweaks.value.hideWeather ? 'Hidden' : 'Shown'}
					</Button>

					{#if !tweaks.value.hideWeather}
						<Button on:click={togglePreciseWeather}>
							{weatherPrecise.value ? 'Precise' : 'Approximate'} Location
						</Button>

						<Button
							on:click={() => {
								weatherUnits.value =
									weatherUnits.value === 'metric'
										? 'imperial'
										: 'metric';
							}}
						>
							{weatherUnits.value === 'metric'
								? 'Metric'
								: 'Imperial'} Units
						</Button>

						<Button
							on:click={() => {
								weatherLayout.value =
									weatherLayout.value === 'compact'
										? 'detailed'
										: 'compact';
							}}
						>
							{weatherLayout.value === 'compact'
								? 'Compact'
								: 'Detailed'} Layout
						</Button>
					{/if}
				</p>

				{#if weatherMessage}
					<p class="mt-2" role="status">{weatherMessage}</p>
				{/if}
			</div>

			<div>
				<h3>discord</h3>

				<p>
					For your Discord presence to show up, you need to be in the
					Lanyard Discord server. Learn more at the
					<a
						href="https://github.com/phineas/Lanyard"
						class="underline underline-offset-2 hover:text-accent transition-colors"
					>
						Github page</a
					>.
				</p>

				{#if !tweaks.value.hideDiscord}
					<p class="mt-1">
						<Text
							placeholder="discord user id"
							bind:value={discordId.value}
						/>
					</p>
				{/if}

				<p class="mt-1">
					<Button
						on:click={() => {
							tweaks.value.hideDiscord =
								!tweaks.value.hideDiscord;
						}}
					>
						Discord {tweaks.value.hideDiscord ? 'Hidden' : 'Shown'}
					</Button>
				</p>
			</div>

			<div>
				<h3>danger</h3>

				<p class="mt-2">
					<Button
						on:click={() => {
							resetSettingsConfirmation = true;
						}}
					>
						reset all settings
					</Button>
				</p>
			</div>

			{#if resetSettingsConfirmation}
				<div>
					<p>Are you sure you want to reset all settings?</p>

					<p class="mt-2">
						<Button
							on:click={() => {
								localStorage.clear();
								sessionStorage.clear();
								location.reload();
							}}
						>
							yes
						</Button>

						<Button
							on:click={() => {
								resetSettingsConfirmation = false;
							}}
						>
							no
						</Button>
					</p>
				</div>
			{/if}

			<div>
				<h3>save and load data</h3>

				<p class="mt-2 flex items-baseline gap-2">
					<Button on:click={exportToClipboard}>
						export to clipboard
					</Button>
					{#if exportMessage}
						<span role="status">{exportMessage}</span>
					{/if}
				</p>

				<form
					on:submit|preventDefault={importFromText}
					class="flex gap-1 mt-1"
				>
					<Text
						bind:value={importSettings}
						placeholder="import..."
						on:input={() => (importMessage = '')}
					/>
					<Button type="submit">submit</Button>
				</form>

				{#if importMessage}
					<p class="mt-2" role="status">{importMessage}</p>
				{/if}
			</div>

			<p>Changes are automatically saved.</p>

			<Button on:click={() => (open = false)}>done</Button>
		</div>
	</dialog>
{/if}
