<script lang="ts">
	import { weatherKey, weatherLayout, weatherUnits } from '../stores.svelte';

	interface WeatherData {
		coord: Coord;
		weather: Weather[];
		base: string;
		main: Main;
		visibility: number;
		wind: Wind;
		clouds: Clouds;
		dt: number;
		sys: Sys;
		timezone: number;
		id: number;
		name: string;
		cod: number;
		// different endpoint's data
		next24h?: { low: number; high: number };
	}

	interface Forecast {
		list: { main: { temp: number } }[];
	}

	interface Clouds {
		all: number;
	}

	interface Coord {
		lon: number;
		lat: number;
	}

	interface Main {
		temp: number;
		feels_like: number;
		temp_min: number;
		temp_max: number;
		pressure: number;
		humidity: number;
	}

	interface Sys {
		type: number;
		id: number;
		country: string;
		sunrise: number;
		sunset: number;
	}

	interface Weather {
		id: number;
		main: string;
		description: string;
		icon: string;
	}

	interface Wind {
		speed: number;
		deg: number;
	}

	function getPosition() {
		return new Promise<GeolocationPosition>((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject);
		});
	}

	async function fetchJson<T>(url: string): Promise<T | null> {
		return fetch(url)
			.then(res => (res.ok ? res.json() : null))
			.catch(() => null);
	}

	function getNext24h(current: number, forecast: Forecast | null) {
		const temps = (forecast?.list ?? [])
			.map(entry => entry?.main?.temp)
			.filter(temp => typeof temp === 'number');
		if (!temps.length) return undefined;

		return {
			low: Math.min(current, ...temps),
			high: Math.max(current, ...temps)
		};
	}

	async function fetchWeatherData(key: string): Promise<WeatherData | null> {
		if (!key) {
			return null;
		}

		const cachedWeatherData = localStorage.getItem('weatherData');
		const cachedWeatherTime = localStorage.getItem('weatherDataTime');

		if (
			cachedWeatherData &&
			Date.now() - Number(cachedWeatherTime) < 600_000
		) {
			return JSON.parse(cachedWeatherData);
		}

		const api = 'https://api.openweathermap.org/data/2.5';

		const position = await getPosition();
		const lat = position.coords.latitude;
		const long = position.coords.longitude;
		const query = `units=imperial&appid=${key}&lat=${lat}&lon=${long}`;

		const [weatherData, forecast] = await Promise.all([
			fetchJson<WeatherData>(`${api}/weather?${query}`),
			fetchJson<Forecast>(`${api}/forecast?${query}&cnt=8`)
		]);

		if (weatherData) {
			weatherData.next24h = getNext24h(weatherData.main.temp, forecast);

			localStorage.setItem('weatherData', JSON.stringify(weatherData));
			localStorage.setItem('weatherDataTime', `${Date.now()}`);
		}

		return weatherData;
	}

	const data = $derived(fetchWeatherData(weatherKey.value));

	function formatDegrees(fahrenheit: number) {
		return weatherUnits.value === 'metric'
			? `${Math.round(((fahrenheit - 32) * 5) / 9)}°`
			: `${Math.round(fahrenheit)}°`;
	}

	function formatTemperature(fahrenheit: number) {
		const unit = weatherUnits.value === 'metric' ? 'C' : 'F';
		return `${formatDegrees(fahrenheit)}${unit}`;
	}

	function formatSpeed(mph: number) {
		return weatherUnits.value === 'metric'
			? `${Math.round(mph * 1.609344)} km/h`
			: `${Math.round(mph)} mph`;
	}
</script>

{#await data then data}
	{#if data && weatherLayout.value === 'compact'}
		<div>
			<h2>{data.name || 'Weather'}</h2>
			<p>
				{data.weather[0].description}
			</p>
			<p>
				now {formatTemperature(data.main.temp)}
			</p>
			{#if data.next24h}
				<p>
					next 24h {formatDegrees(
						data.next24h.low
					)}&ndash;{formatTemperature(data.next24h.high)}
				</p>
			{/if}
		</div>
	{:else if data}
		<div class="flow">
			<div>
				<h2>Weather</h2>
				{#if data.name}
					<p>in {data.name}</p>
				{/if}
				<p>{data.weather[0].description}</p>
			</div>
			<div>
				<h2>Temperature</h2>
				<p>temp {formatTemperature(data.main.temp)}</p>
				<p>feels like {formatTemperature(data.main.feels_like)}</p>
				{#if data.next24h}
					<p>24h low {formatTemperature(data.next24h.low)}</p>
					<p>24h high {formatTemperature(data.next24h.high)}</p>
				{/if}
			</div>
			<div>
				<h2>Condition</h2>
				<p>humidity {data.main.humidity}%</p>
				<p>clouds {data.clouds.all}%</p>
				<p>wind {formatSpeed(data.wind.speed)}</p>
			</div>
		</div>
	{/if}
{/await}
