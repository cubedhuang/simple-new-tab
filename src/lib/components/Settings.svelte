<script lang="ts">
	import { fade } from 'svelte/transition';

	import {
		clock,
		colors,
		migrateClock,
		discordId,
		font,
		fontSize,
		dayKey,
		linkColumns,
		splitIntoColumns,
		presetFonts,
		notes,
		notesTitle,
		quoteTags,
		tweaks,
		units,
		weatherLayout,
		weatherLocation
	} from '../stores.svelte';
	import { localeOptions } from '../locales';

	import Button from './Button.svelte';
	import ColorSettings from './ColorSettings.svelte';
	import QuoteSettings from './QuoteSettings.svelte';
	import TextInput from './TextInput.svelte';
	import NumberInput from './NumberInput.svelte';
	import Select from './Select.svelte';
	import WeatherSettings from './WeatherSettings.svelte';

	export let open = true;
	export let oneditlinks: () => void;

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

	function parseSettings(text: string) {
		const trimmed = text.trim();
		if (trimmed.startsWith('{')) return JSON.parse(trimmed);
		return decodeSettings(trimmed);
	}

	function collectSettings() {
		return {
			tweaks: tweaks.value,
			font: font.value,
			fontSize: fontSize.value,
			colors: colors.value,
			clock: clock.value,
			linkColumns: linkColumns.value,
			quoteTags: quoteTags.value,
			notes: notes.value,
			notesTitle: notesTitle.value,
			weatherLocation: weatherLocation.value,
			units: units.value,
			weatherLayout: weatherLayout.value,
			discordId: discordId.value
		};
	}

	async function exportToClipboard() {
		try {
			await navigator.clipboard.writeText(
				encodeSettings(collectSettings())
			);
			exportMessage = 'Copied to clipboard!';
		} catch {
			exportMessage = 'Failed to copy settings to clipboard.';
		}
	}

	function exportToFile() {
		const blob = new Blob([JSON.stringify(collectSettings(), null, '\t')], {
			type: 'application/json'
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `simple-new-tab-settings-${dayKey(new Date())}.json`;
		a.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
		exportMessage = 'Downloaded settings file!';
	}

	let fileInput: HTMLInputElement;

	async function importFromFile() {
		const file = fileInput.files?.[0];
		fileInput.value = '';
		if (!file) return;

		importMessage = '';
		try {
			importData(parseSettings(await file.text()));
		} catch {
			importMessage = "That doesn't look like a settings file.";
		}
	}

	function importFromText() {
		if (!importSettings) return;

		let data;

		try {
			data = parseSettings(importSettings);
		} catch {
			importMessage = "That doesn't look like exported settings.";
			return;
		}

		if (importData(data)) importSettings = '';
	}

	/** returns whether the import succeeded */
	function importData(data: any) {
		if (
			typeof data !== 'object' ||
			data === null ||
			Array.isArray(data) ||
			(data.linkColumns &&
				!(
					Array.isArray(data.linkColumns) &&
					data.linkColumns.every(
						(column: any) =>
							typeof column?.id === 'string' &&
							Array.isArray(column.sections)
					)
				)) ||
			(data.links && !Array.isArray(data.links)) ||
			(data.quoteTags && !Array.isArray(data.quoteTags))
		) {
			importMessage = "That doesn't look like exported settings.";
			return false;
		}

		if (data.tweaks) tweaks.value = data.tweaks;
		if (data.font) font.value = data.font;
		if (data.fontSize) fontSize.value = data.fontSize;
		if (data.colors) colors.value = data.colors;
		if (data.clock) clock.value = migrateClock(data.clock);
		if (data.linkColumns) {
			linkColumns.value = data.linkColumns;
		} else if (data.links) {
			linkColumns.value = splitIntoColumns(data.links, data.columns ?? 1);
		}
		if (data.quoteTags) quoteTags.value = data.quoteTags;
		if (typeof data.notes === 'string') notes.value = data.notes;
		if (typeof data.notesTitle === 'string') {
			notesTitle.value = data.notesTitle;
		}
		if (data.weatherLocation?.mode) {
			weatherLocation.value = data.weatherLocation;
		} else if (data.weatherKey) {
			// older exports have an OpenWeather API key instead, which used the browser's location
			weatherLocation.value = {
				mode: data.weatherKey ? 'precise' : 'approximate',
				place: null
			};
		}
		if (data.units) {
			units.value = data.units;
		} else if (data.weatherUnits) {
			units.value = {
				temperature:
					data.weatherUnits === 'metric' ? 'celsius' : 'fahrenheit',
				speed: data.weatherUnits === 'metric' ? 'kmh' : 'mph'
			};
		}
		if (data.weatherLayout) weatherLayout.value = data.weatherLayout;
		if (data.discordId) discordId.value = data.discordId;

		customFont = presetFonts.includes(font.value) ? '' : font.value;
		importMessage = 'Settings imported!';
		return true;
	}
</script>

{#if open}
	<dialog
		class="fixed inset-0 z-10 grid place-items-center size-full max-w-none max-h-screen px-8 py-8 overflow-auto bg-transparent text-body outline-hidden before:fixed before:inset-0 before:-z-10 before:bg-black/20"
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

				<p class="flex flex-wrap justify-end gap-1">
					<Button on:click={oneditlinks}>edit links</Button>
					<Button on:click={() => (open = false)}>done</Button>
				</p>
			</div>

			<div>
				<h3>tweaks</h3>

				<p class="mt-1 flex flex-wrap gap-1">
					<Button
						pressed={!tweaks.value.hideQuote}
						on:click={() => {
							tweaks.value.hideQuote = !tweaks.value.hideQuote;
						}}
					>
						Show Quote
					</Button>

					<Button
						pressed={!tweaks.value.hideTabCount}
						on:click={() => {
							tweaks.value.hideTabCount =
								!tweaks.value.hideTabCount;
						}}
					>
						Show Tab Stats
					</Button>

					<Button
						pressed={!tweaks.value.hideNotes}
						on:click={() => {
							tweaks.value.hideNotes = !tweaks.value.hideNotes;
						}}
					>
						Show Notes
					</Button>

					<Button
						pressed={tweaks.value.boldHeadings}
						on:click={() => {
							tweaks.value.boldHeadings =
								!tweaks.value.boldHeadings;
						}}
					>
						Bold Headings
					</Button>
				</p>

				<div class="mt-2 flex flex-wrap gap-x-4 gap-y-2">
					<Select
						label="Title"
						bind:value={tweaks.value.capitalizedTitle}
						options={[
							{ value: false, label: 'lowercase' },
							{ value: true, label: 'Capitalized' }
						]}
					/>

					<Select
						label="List Style"
						bind:value={tweaks.value.bulletPoints}
						options={[
							{ value: false, label: 'Dashes' },
							{ value: true, label: 'Bullet Points' }
						]}
					/>
				</div>
			</div>

			<div>
				<h3>font</h3>

				<div class="mt-2 flex items-center">
					<div class="w-20">
						<NumberInput
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
					<TextInput
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

				<p class="mt-1 flex flex-wrap gap-1">
					<Button
						pressed={!clock.value.hidden}
						on:click={() => {
							clock.value.hidden = !clock.value.hidden;
						}}
					>
						Show Clock
					</Button>

					{#if !clock.value.hidden}
						<Button
							pressed={clock.value.showDay}
							on:click={() => {
								clock.value.showDay = !clock.value.showDay;
							}}
						>
							Show Day of Week
						</Button>

						<Button
							pressed={!clock.value.hideSeconds}
							on:click={() => {
								clock.value.hideSeconds =
									!clock.value.hideSeconds;
							}}
						>
							Show Seconds
						</Button>

						<Button
							pressed={clock.value.showTimezone}
							on:click={() => {
								clock.value.showTimezone =
									!clock.value.showTimezone;
							}}
						>
							Show Timezone
						</Button>
					{/if}
				</p>

				{#if !clock.value.hidden}
					<div class="mt-2 flex flex-wrap gap-x-4 gap-y-2">
						<Select
							label="Month"
							bind:value={clock.value.longMonth}
							options={[
								{ value: true, label: 'Name' },
								{ value: false, label: 'Number' }
							]}
						/>

						<Select
							label="Locale"
							bind:value={clock.value.locale}
							options={localeOptions(clock.value.locale)}
						/>

						<Select
							label="Time Format"
							bind:value={clock.value.hour12}
							options={[
								{ value: true, label: '12 Hour' },
								{ value: false, label: '24 Hour' }
							]}
						/>
					</div>
				{/if}
			</div>

			<QuoteSettings />

			<WeatherSettings />

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

				<p class="mt-1 flex flex-wrap gap-1">
					<Button
						pressed={!tweaks.value.hideDiscord}
						on:click={() => {
							tweaks.value.hideDiscord =
								!tweaks.value.hideDiscord;
						}}
					>
						Show Discord
					</Button>

					{#if !tweaks.value.hideDiscord}
						<span class="flex-1">
							<TextInput
								placeholder="discord user id"
								bind:value={discordId.value}
							/>
						</span>
					{/if}
				</p>
			</div>

			<div>
				<h3>save and load data</h3>

				<p class="mt-2 flex flex-wrap items-baseline gap-1">
					<Button on:click={exportToFile}>download file</Button>
					<Button on:click={exportToClipboard}>
						copy to clipboard
					</Button>
					{#if exportMessage}
						<span class="ml-1" role="status">{exportMessage}</span>
					{/if}
				</p>

				<div class="mt-1 flex">
					<p>
						<Button on:click={() => fileInput.click()}>
							upload file
						</Button>
						<input
							bind:this={fileInput}
							type="file"
							accept=".json,application/json,text/plain"
							class="hidden"
							on:change={importFromFile}
						/>
					</p>

					<form
						on:submit|preventDefault={importFromText}
						class="flex-1 flex gap-1"
					>
						<TextInput
							bind:value={importSettings}
							placeholder="or paste copied settings..."
							on:input={() => (importMessage = '')}
						/>
						<Button type="submit">submit</Button>
					</form>
				</div>

				{#if importMessage}
					<p class="mt-2" role="status">{importMessage}</p>
				{/if}
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

			<p>Changes are automatically saved.</p>

			<Button on:click={() => (open = false)}>done</Button>
		</div>
	</dialog>
{/if}
