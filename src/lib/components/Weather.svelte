<script lang="ts">
	import { weatherKey, weatherUnits } from '../stores';

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

		const weatherAPI = `https://api.openweathermap.org/data/2.5/weather?units=imperial&appid=${key}`;

		const position = await getPosition();
		const lat = position.coords.latitude;
		const long = position.coords.longitude;

		const weatherData = await fetch(`${weatherAPI}&lat=${lat}&lon=${long}`)
			.then(res => (res.ok ? res.json() : null))
			.catch(() => null);

		if (weatherData) {
			localStorage.setItem('weatherData', JSON.stringify(weatherData));
			localStorage.setItem('weatherDataTime', `${Date.now()}`);
		}

		return weatherData;
	}

	$: data = fetchWeatherData($weatherKey);

	$: formatTemperature = (fahrenheit: number) =>
		$weatherUnits === 'metric'
			? `${(((fahrenheit - 32) * 5) / 9).toFixed(2)}°C`
			: `${fahrenheit.toFixed(2)}°F`;
	$: formatSpeed = (mph: number) =>
		$weatherUnits === 'metric'
			? `${(mph * 1.609344).toFixed(2)} km/h`
			: `${mph.toFixed(2)} mph`;
</script>

{#await data then data}
	{#if data}
		<div class="flow">
			<div>
				<h2>Weather</h2>
				<p>in {data.name}</p>
				<p>{data.weather[0].description}</p>
			</div>
			<div>
				<h2>Temperature</h2>
				<p>temp {formatTemperature(data.main.temp)}</p>
				<p>min {formatTemperature(data.main.temp_min)}</p>
				<p>max {formatTemperature(data.main.temp_max)}</p>
				<p>feels like {formatTemperature(data.main.feels_like)}</p>
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
