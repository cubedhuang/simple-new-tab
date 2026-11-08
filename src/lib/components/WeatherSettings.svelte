<script lang="ts">
	import {
		tweaks,
		units,
		weatherLayout,
		weatherLocation,
		type WeatherLocation,
		type WeatherPlace
	} from '../stores.svelte';

	import Button from './Button.svelte';
	import Select from './Select.svelte';
	import TextInput from './TextInput.svelte';

	let message = $state('');

	function setLocationMode(mode: WeatherLocation['mode']) {
		message = '';
		const previous = weatherLocation.value.mode;
		weatherLocation.value.mode = mode;
		if (mode !== 'precise') return;

		// switch back if the browser won't share its location
		navigator.geolocation.getCurrentPosition(
			() => {},
			error => {
				weatherLocation.value.mode = previous;
				message =
					error.code === error.PERMISSION_DENIED
						? 'Allow location access to use your precise location.'
						: "Couldn't get your location.";
			},
			{ maximumAge: 600_000 }
		);
	}

	let query = $state(weatherLocation.value.place?.label ?? '');
	let results = $state.raw<WeatherPlace[] | null>(null);

	interface GeocodingResult {
		name: string;
		latitude: number;
		longitude: number;
		admin1?: string;
		country?: string;
	}

	async function search() {
		if (!query) return;

		message = '';
		results = null;

		const params = new URLSearchParams({
			name: query,
			count: '6',
			language: navigator.language.split('-')[0],
			format: 'json'
		});

		try {
			const res = await fetch(
				`https://geocoding-api.open-meteo.com/v1/search?${params}`
			);
			if (!res.ok) throw new Error();

			const data: { results?: GeocodingResult[] } = await res.json();
			results = (data.results ?? []).map(result => ({
				name: result.name,
				// skip repeats like "Tokyo, Tokyo, Japan"
				label: [result.name, result.admin1, result.country]
					.filter((part, i, all) => part && part !== all[i - 1])
					.join(', '),
				lat: result.latitude,
				lon: result.longitude
			}));

			if (results.length === 0)
				message = `Couldn't find a place named "${query}".`;
		} catch {
			message = "Couldn't reach Open-Meteo.";
		}
	}

	function choose(place: WeatherPlace) {
		weatherLocation.value.place = place;
		query = place.label;
		results = null;
	}

	function isChosen(place: WeatherPlace) {
		const chosen = weatherLocation.value.place;
		return chosen?.lat === place.lat && chosen.lon === place.lon;
	}
</script>

<div>
	<h3>weather</h3>

	<p>
		Weather and city search use the
		<a
			href="https://open-meteo.com/"
			class="underline underline-offset-2 hover:text-accent transition-colors"
		>
			Open-Meteo API</a
		>, and
		<a
			href="https://www.bigdatacloud.com/"
			class="underline underline-offset-2 hover:text-accent transition-colors"
		>
			BigDataCloud</a
		> names your location. Approximate location comes from your IP address, and
		precise location comes from your browser.
	</p>

	<p class="mt-1">
		<Button
			pressed={!tweaks.value.hideWeather}
			on:click={() => {
				tweaks.value.hideWeather = !tweaks.value.hideWeather;
			}}
		>
			Show Weather
		</Button>
	</p>

	{#if !tweaks.value.hideWeather}
		<div class="mt-2 flex flex-wrap gap-x-4 gap-y-2">
			<Select
				label="Layout"
				bind:value={weatherLayout.value}
				options={[
					{ value: 'compact', label: 'Compact' },
					{ value: 'detailed', label: 'Detailed' }
				]}
			/>

			<Select
				label="Location"
				bind:value={() => weatherLocation.value.mode, setLocationMode}
				options={[
					{ value: 'approximate', label: 'Approximate' },
					{ value: 'precise', label: 'Precise' },
					{ value: 'manual', label: 'Manual' }
				]}
			/>

			<Select
				label="Temperature"
				bind:value={units.value.temperature}
				options={[
					{ value: 'fahrenheit', label: '°F' },
					{ value: 'celsius', label: '°C' }
				]}
			/>

			{#if weatherLayout.value === 'detailed'}
				<Select
					label="Wind"
					bind:value={units.value.speed}
					options={[
						{ value: 'mph', label: 'mph' },
						{ value: 'kmh', label: 'km/h' },
						{ value: 'ms', label: 'm/s' }
					]}
				/>
			{/if}
		</div>

		{#if weatherLocation.value.mode === 'manual'}
			<form
				class="mt-2 flex gap-1"
				onsubmit={event => {
					event.preventDefault();
					search();
				}}
			>
				<TextInput placeholder="city..." bind:value={query} />
				<Button type="submit">search</Button>
			</form>

			{#if results && results.length > 0}
				<p class="mt-2 flex flex-wrap gap-1">
					{#each results as place}
						<Button
							pressed={isChosen(place)}
							on:click={() => choose(place)}
						>
							{place.label}
						</Button>
					{/each}
				</p>
			{/if}
		{/if}

		{#if message}
			<p class="mt-2" role="status">{message}</p>
		{/if}
	{/if}
</div>
