<script lang="ts">
	import {
		units,
		weatherLayout,
		weatherLocation,
		type WeatherLocation
	} from '../stores.svelte';

	// temperatures in fahrenheit and speeds in mph
	interface WeatherData {
		name: string;
		description: string;
		temp: number;
		feelsLike: number;
		humidity: number;
		clouds: number;
		wind: number;
		today?: { low: number; high: number };
	}

	interface Forecast {
		current: {
			temperature_2m: number;
			apparent_temperature: number;
			relative_humidity_2m: number;
			cloud_cover: number;
			wind_speed_10m: number;
			weather_code: number;
		};
		daily?: {
			temperature_2m_min: (number | null)[];
			temperature_2m_max: (number | null)[];
		};
	}

	interface Place {
		lat: number;
		lon: number;
		name: string;
	}

	const cacheKey = 'simple-new-tab:weather-cache';
	const placeKey = 'simple-new-tab:weather-place';

	// https://open-meteo.com/en/docs#weather_variable_documentation
	const descriptions: Record<number, string> = {
		0: 'clear sky',
		1: 'mainly clear',
		2: 'partly cloudy',
		3: 'overcast',
		45: 'fog',
		48: 'rime fog',
		51: 'light drizzle',
		53: 'drizzle',
		55: 'heavy drizzle',
		56: 'light freezing drizzle',
		57: 'freezing drizzle',
		61: 'light rain',
		63: 'rain',
		65: 'heavy rain',
		66: 'light freezing rain',
		67: 'freezing rain',
		71: 'light snow',
		73: 'snow',
		75: 'heavy snow',
		77: 'snow grains',
		80: 'light rain showers',
		81: 'rain showers',
		82: 'violent rain showers',
		85: 'light snow showers',
		86: 'snow showers',
		95: 'thunderstorm',
		96: 'thunderstorm with hail',
		97: 'heavy thunderstorm',
		99: 'thunderstorm with heavy hail'
	};

	function readJson<T>(key: string): T | null {
		try {
			return JSON.parse(localStorage.getItem(key) ?? 'null');
		} catch {
			return null;
		}
	}

	function getPosition() {
		return new Promise<GeolocationPosition>((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(
				resolve,
				error => {
					reject(
						new Error(
							error.code === error.PERMISSION_DENIED
								? 'Allow location access to see the weather.'
								: "Couldn't get your location."
						)
					);
				},
				{ maximumAge: 600_000 }
			);
		});
	}

	async function fetchForecast(lat: number, lon: number): Promise<Forecast> {
		const params = new URLSearchParams({
			latitude: `${lat}`,
			longitude: `${lon}`,
			current:
				'temperature_2m,apparent_temperature,relative_humidity_2m,cloud_cover,wind_speed_10m,weather_code',
			daily: 'temperature_2m_min,temperature_2m_max',
			forecast_days: '1',
			timezone: 'auto',
			temperature_unit: 'fahrenheit',
			wind_speed_unit: 'mph'
		});

		const res = await fetch(
			`https://api.open-meteo.com/v1/forecast?${params}`
		).catch(() => {
			throw new Error("Couldn't reach Open-Meteo.");
		});

		if (res.status === 429) {
			throw new Error('Too many weather requests. Try again later.');
		}
		if (!res.ok) {
			throw new Error(`Open-Meteo returned an error (${res.status}).`);
		}

		return res.json();
	}

	function reverseGeocode(params: Record<string, string>) {
		const query = new URLSearchParams({
			...params,
			localityLanguage: navigator.language.split('-')[0]
		});
		return fetch(`https://api-bdc.io/data/reverse-geocode-client?${query}`);
	}

	// BigDataCloud uses IP address when no coordinates provided
	async function fetchApproximatePlace(): Promise<Place> {
		const res = await reverseGeocode({}).catch(() => {
			throw new Error("Couldn't reach BigDataCloud.");
		});
		if (!res.ok) {
			throw new Error("Couldn't find your approximate location.");
		}

		const data = await res.json();
		return {
			lat: data.latitude,
			lon: data.longitude,
			name: data.city || data.locality || ''
		};
	}

	// the city name is optional, so failures here are ignored
	async function fetchPlaceName(lat: number, lon: number) {
		// about 1km, so moving around a city doesn't make new requests
		const roundedLat = Math.round(lat * 100) / 100;
		const roundedLon = Math.round(lon * 100) / 100;

		const cached = readJson<Place>(placeKey);
		if (cached?.lat === roundedLat && cached.lon === roundedLon) {
			return cached.name;
		}

		try {
			const res = await reverseGeocode({
				latitude: `${lat}`,
				longitude: `${lon}`
			});
			if (!res.ok) return '';

			const data = await res.json();
			const name: string = data.city || data.locality || '';

			const place: Place = { lat: roundedLat, lon: roundedLon, name };
			localStorage.setItem(placeKey, JSON.stringify(place));
			return name;
		} catch {
			return '';
		}
	}

	function getToday(current: number, forecast: Forecast) {
		const low = forecast.daily?.temperature_2m_min[0];
		const high = forecast.daily?.temperature_2m_max[0];
		if (typeof low !== 'number' || typeof high !== 'number')
			return undefined;

		return {
			low: Math.min(current, low),
			high: Math.max(current, high)
		};
	}

	async function fetchPlace(location: WeatherLocation) {
		if (location.mode === 'manual') {
			if (!location.place) throw new Error('Choose a city in settings.');
			const { lat, lon, name } = location.place;
			return { lat, lon, name: Promise.resolve(name) };
		}

		if (location.mode === 'approximate') {
			const place = await fetchApproximatePlace();
			return { ...place, name: Promise.resolve(place.name) };
		}

		const position = await getPosition();
		const { latitude: lat, longitude: lon } = position.coords;
		return { lat, lon, name: fetchPlaceName(lat, lon) };
	}

	async function fetchWeatherData(
		location: WeatherLocation
	): Promise<WeatherData> {
		// a manual place's weather is only reusable for that same place
		const key = JSON.stringify(
			location.mode === 'manual'
				? [location.mode, location.place?.lat, location.place?.lon]
				: [location.mode]
		);

		const cached = readJson<{
			time: number;
			key: string;
			data: WeatherData;
		}>(cacheKey);
		if (
			cached &&
			cached.key === key &&
			Date.now() - cached.time < 600_000
		) {
			return cached.data;
		}

		const place = await fetchPlace(location);
		const [forecast, name] = await Promise.all([
			fetchForecast(place.lat, place.lon),
			place.name
		]);
		const { current } = forecast;

		const data: WeatherData = {
			name,
			description: descriptions[current.weather_code] ?? 'unknown',
			temp: current.temperature_2m,
			feelsLike: current.apparent_temperature,
			humidity: current.relative_humidity_2m,
			clouds: current.cloud_cover,
			wind: current.wind_speed_10m,
			today: getToday(current.temperature_2m, forecast)
		};

		localStorage.setItem(
			cacheKey,
			JSON.stringify({ time: Date.now(), key, data })
		);

		return data;
	}

	const data = $derived(
		fetchWeatherData($state.snapshot(weatherLocation.value))
	);

	function formatDegrees(fahrenheit: number) {
		return units.value.temperature === 'celsius'
			? `${Math.round(((fahrenheit - 32) * 5) / 9)}°`
			: `${Math.round(fahrenheit)}°`;
	}

	function formatTemperature(fahrenheit: number) {
		const unit = units.value.temperature === 'celsius' ? 'C' : 'F';
		return `${formatDegrees(fahrenheit)}${unit}`;
	}

	function formatSpeed(mph: number) {
		switch (units.value.speed) {
			case 'kmh':
				return `${Math.round(mph * 1.609344)} km/h`;
			case 'ms':
				return `${Math.round(mph * 0.44704)} m/s`;
			default:
				return `${Math.round(mph)} mph`;
		}
	}
</script>

{#await data then data}
	{#if weatherLayout.value === 'compact'}
		<div>
			<h2>{data.name || 'Weather'}</h2>
			<p>
				{data.description}
			</p>
			<p>
				now {formatTemperature(data.temp)}
			</p>
			{#if data.today}
				<p>
					today {formatDegrees(
						data.today.low
					)}&ndash;{formatTemperature(data.today.high)}
				</p>
			{/if}
		</div>
	{:else}
		<div class="flow">
			<div>
				<h2>Weather</h2>
				{#if data.name}
					<p>in {data.name}</p>
				{/if}
				<p>{data.description}</p>
			</div>
			<div>
				<h2>Temperature</h2>
				<p>now {formatTemperature(data.temp)}</p>
				<p>feels like {formatTemperature(data.feelsLike)}</p>
				{#if data.today}
					<p>low {formatTemperature(data.today.low)}</p>
					<p>high {formatTemperature(data.today.high)}</p>
				{/if}
			</div>
			<div>
				<h2>Condition</h2>
				<p>humidity {data.humidity}%</p>
				<p>clouds {data.clouds}%</p>
				<p>wind {formatSpeed(data.wind)}</p>
			</div>
		</div>
	{/if}
{:catch error}
	<div>
		<h2>Weather</h2>
		<p>{error.message}</p>
	</div>
{/await}
