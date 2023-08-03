<script lang="ts">
	import { fade } from 'svelte/transition';

	import {
		clock,
		colors,
		discordId,
		font,
		fontSize,
		links,
		presetFonts,
		resetColors,
		weatherKey
	} from '../stores';

	import Button from './Button.svelte';
	import Password from './Password.svelte';
	import Text from './Text.svelte';
	import SettingsLinks from './SettingsLinks.svelte';
	import Number from './Number.svelte';

	export let open = true;

	let customFont = presetFonts.includes($font) ? '' : $font;

	let resetSettingsConfirmation = false;

	$: if (!open) {
		resetSettingsConfirmation = false;
	}

	let importSettings = '';
</script>

{#if open}
	<div
		class="fixed inset-0 z-10 grid place-items-center px-8 py-8 max-h-screen overflow-auto before:fixed before:inset-0 before:-z-10 before:bg-black before:bg-opacity-50"
		on:click|self={() => (open = false)}
		on:keydown={() => {}}
		aria-hidden="true"
		transition:fade={{ duration: 150 }}
	>
		<div
			class="w-full max-w-screen-lg p-8 rounded-xl bg-background flow"
			role="dialog"
		>
			<h2>settings</h2>

			<div>
				<h3>font</h3>

				<div class="mt-2 flex items-center">
					<p class="shrink-0">font size</p>

					<div class="ml-2 w-fit">
						<Number
							bind:value={$fontSize}
							step={5}
							min={50}
							max={200}
						/>
					</div>

					<p>%</p>
				</div>

				<div class="mt-4 flex flex-wrap gap-1">
					{#each presetFonts as name}
						<div class="contents" style:font-family={name}>
							<Button
								on:click={() => {
									$font = name;
								}}
								class={name === $font
									? 'bg-accent text-background hover:bg-accent hover:text-background focus:bg-accent focus:text-background'
									: ''}
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
								$font = 'Roboto Mono';
							} else {
								$font = customFont;
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

				<div class="mt-2 flex flex-wrap gap-2">
					{#each Object.keys($colors) as name}
						<label
							class="flex items-center bg-black/30 cursor-pointer rounded-lg hover:text-accent transition-colors focus-within:text-accent"
						>
							<span
								class="h-full w-4 rounded-l-lg border-2 border-gray-600/30"
								style:background={$colors[name]}
							></span>

							<span class="px-2 py-1">
								{name}
							</span>

							<input
								type="color"
								class="sr-only self-end"
								bind:value={$colors[name]}
							/>
						</label>
					{/each}

					<Button on:click={resetColors}>reset colors</Button>
				</div>
			</div>

			<div>
				<h3>clock</h3>

				<p class="mt-1">
					<Button
						on:click={() => {
							$clock.longMonth = !$clock.longMonth;
						}}
					>
						Month {$clock.longMonth ? 'Name' : 'Number'}
					</Button>

					<Button
						on:click={() => {
							$clock.showDay = !$clock.showDay;
						}}
					>
						Day of Week {$clock.showDay ? 'Shown' : 'Hidden'}
					</Button>

					<Button
						on:click={() => {
							$clock.dayFirst = !$clock.dayFirst;
						}}
					>
						{$clock.dayFirst ? 'Day' : 'Month'} First
					</Button>
				</p>

				<p class="mt-1">
					<Button
						on:click={() => {
							$clock.hour12 = !$clock.hour12;
						}}
					>
						{$clock.hour12 ? 12 : 24} Hour Format
					</Button>

					<Button
						on:click={() => {
							$clock.showTimezone = !$clock.showTimezone;
						}}
					>
						Timezone {$clock.showTimezone ? 'Shown' : 'Hidden'}
					</Button>
				</p>
			</div>

			<SettingsLinks />

			<div>
				<h3>weather</h3>

				<p>
					This page uses the OpenWeather API. If you want the weather
					feature, get an API key from the
					<a
						href="https://openweathermap.org/"
						class="underline underline-offset-2 hover:text-accent transition-colors"
					>
						OpenWeather website</a
					>. This page only makes a request every 10 minutes, so you
					can generate and use a free key.
				</p>

				<p class="mt-1">
					<Password
						placeholder="weather api key"
						bind:value={$weatherKey}
					/>
				</p>
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

				<p class="mt-1">
					<Text
						placeholder="discord user id"
						bind:value={$discordId}
					/>
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

				<p class="mt-2">
					<Button
						on:click={() => {
							const data = {
								colors: $colors,
								clock: $clock,
								links: $links,
								weatherKey: $weatherKey,
								discordId: $discordId
							};

							navigator.clipboard.writeText(
								btoa(JSON.stringify(data))
							);
						}}>export to clipboard</Button
					>
				</p>

				<form
					on:submit|preventDefault={() => {
						if (!importSettings) return;

						const data = JSON.parse(atob(importSettings));

						if (data.colors) $colors = data.colors;
						if (data.clock) $clock = data.clock;
						if (data.links) $links = data.links;
						if (data.weatherKey) $weatherKey = data.weatherKey;
						if (data.discordId) $discordId = data.discordId;
					}}
					class="flex gap-1 mt-1"
				>
					<Text bind:value={importSettings} placeholder="import..." />
					<Button type="submit">submit</Button>
				</form>
			</div>

			<p>Changes are automatically saved.</p>

			<Button on:click={() => (open = false)}>done</Button>
		</div>
	</div>
{/if}
