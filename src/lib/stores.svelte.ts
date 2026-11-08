import { tick } from 'svelte';
import { parseColor } from './oklch';
import { themes, type Theme } from './themes';

function globalEffect(fn: () => void) {
	$effect.root(() => {
		$effect(fn);
	});
}

// see `readSetting` in public/theme.js
export class Stored<T> {
	value = $state() as T;

	constructor(key: string, initialValue: T, storage: Storage = localStorage) {
		const newKey = `simple-new-tab:${key}`;
		const fallback = JSON.stringify(initialValue);

		const saved = storage.getItem(newKey) || storage.getItem(key);
		if (saved) {
			try {
				initialValue = JSON.parse(saved);
			} catch {}
		}
		this.value = initialValue;

		globalEffect(() => {
			storage.setItem(newKey, JSON.stringify(this.value));
		});

		addEventListener('storage', event => {
			if (event.storageArea !== storage) return;
			if (event.key !== null && event.key !== newKey) return;

			try {
				this.value = JSON.parse(event.newValue ?? fallback);
			} catch {}
		});
	}

	/** read and delete */
	static takeLegacy(key: string) {
		const newKey = `simple-new-tab:${key}`;
		const saved = localStorage.getItem(newKey) || localStorage.getItem(key);
		localStorage.removeItem(newKey);
		localStorage.removeItem(key);
		try {
			return saved && JSON.parse(saved);
		} catch {
			return null;
		}
	}
}

/** "YYYY-MM-DD" */
export function dayKey(date: Date) {
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day = `${date.getDate()}`.padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
}

export const tabHistory = new Stored<Record<string, number>>('tab-history', {});

// we do this in this file so that it's a single execution and doesn't depend on whether the stats are shown
const today = dayKey(new Date());
const [navigation] = performance.getEntriesByType(
	'navigation'
) as PerformanceNavigationTiming[];

// this excludes reloads and going back to this page
export const isNewTab = navigation?.type === 'navigate';

if (tabHistory.value[today] === undefined) {
	tabHistory.value[today] = 1;
} else if (isNewTab) {
	tabHistory.value[today]++;
}

export const tweaks = new Stored('tweaks', {
	hideQuote: false,
	hideTabCount: false,
	capitalizedTitle: false,
	bulletPoints: false,
	boldHeadings: false,
	hideWeather: false,
	hideDiscord: false
});

globalEffect(() => {
	document.documentElement.style.setProperty(
		'--heading-font-weight',
		tweaks.value.boldHeadings ? '700' : '400'
	);
});

export const colors = new Stored<Record<string, string>>('colors', {
	...themes[0].colors
});

globalEffect(() => {
	const root = document.documentElement;
	root.classList.add('no-transitions');

	for (const [key, value] of Object.entries(colors.value)) {
		root.style.setProperty(`--${key}`, value);
	}

	// force a reflow c:
	void document.body.offsetWidth;
	root.classList.remove('no-transitions');

	setFavicon(colors.value);

	// light background have less darkening than dark backgrounds
	const background = parseColor(colors.value.background ?? '');
	document.documentElement.style.setProperty(
		'--control',
		background && background.l > 0.7
			? 'rgb(0 0 0 / 0.08)'
			: 'rgb(0 0 0 / 0.3)'
	);
});

export function linkTransitionName(
	kind: 'section' | 'link' | 'notes',
	id: string
) {
	return `${kind}-${CSS.escape(id)}`;
}

export function withViewTransition(update: () => void, rootClass?: string) {
	if (
		!document.startViewTransition ||
		matchMedia('(prefers-reduced-motion: reduce)').matches
	) {
		update();
		return;
	}

	const root = document.documentElement;
	if (rootClass) root.classList.add(rootClass);

	const transition = document.startViewTransition(async () => {
		update();
		await tick();
	});

	if (rootClass) {
		const remove = () => root.classList.remove(rootClass);
		transition.finished.then(remove, remove);
	}
}

export function applyTheme(theme: Theme) {
	withViewTransition(() => {
		colors.value = { ...theme.colors };
	});
}

export const presetFonts = [
	'Fira Code',
	'Inconsolata',
	'Inter',
	'JetBrains Mono',
	'OpenDyslexic',
	'OpenDyslexicMono',
	'Lexend Deca',
	'Roboto',
	'Roboto Mono',
	'Ubuntu',
	'Ubuntu Mono'
];

export const font = new Stored('font', 'Roboto Mono');
export const fontSize = new Stored('font-size', 100);

globalEffect(() => {
	document.documentElement.style.setProperty('--font', font.value);
});

globalEffect(() => {
	document.documentElement.style.setProperty(
		'--font-size',
		`${fontSize.value}%`
	);
});

export interface ClockSettings {
	hidden: boolean;
	longMonth: boolean;
	showDay: boolean;
	hour12: boolean;
	showTimezone: boolean;
	hideSeconds: boolean;
	/** empty means browser's language */
	locale: string;
}

/** older versions' `dayFirst` picked between en-GB and en-US */
export function migrateClock(saved: any): ClockSettings {
	const { dayFirst, ...rest } = saved;
	if (typeof rest.locale === 'string') return rest;
	return { ...rest, locale: dayFirst ? 'en-GB' : 'en-US' };
}

export const clock = new Stored<ClockSettings>('clock', {
	hidden: false,
	longMonth: true,
	showDay: true,
	hour12: true,
	showTimezone: false,
	hideSeconds: false,
	locale: ''
});
clock.value = migrateClock(clock.value);

export interface Link {
	id: string;
	name: string;
	url: string;
}

export interface LinkSection {
	/** absent so sections saved before notes existed are still link sections */
	kind?: undefined;
	id: string;
	title: string;
	children: Link[];
}

/** scratchpad */
export interface NotesSection {
	kind: 'notes';
	id: string;
	title: string;
	text: string;
}

export type Section = LinkSection | NotesSection;

export function isLinkSection(section: Section): section is LinkSection {
	return section.kind !== 'notes';
}

export interface LinkColumn {
	id: string;
	sections: Section[];
}

export const MAX_LINK_COLUMNS = 4;

export function generateId() {
	return Math.random().toString(36).substring(2, 10);
}

export function splitIntoColumns(
	sections: LinkSection[],
	count: number
): LinkColumn[] {
	count = Math.min(Math.max(Math.round(count) || 1, 1), MAX_LINK_COLUMNS);

	const columns: LinkColumn[] = Array.from({ length: count }, () => ({
		id: generateId(),
		sections: []
	}));

	const weights = sections.map(section => 1 + section.children.length);
	const total = weights.reduce((sum, weight) => sum + weight, 0);

	let before = 0;
	sections.forEach((section, i) => {
		const middle = before + weights[i] / 2;
		const column = Math.min(
			count - 1,
			Math.floor((middle / total) * count)
		);
		columns[column].sections.push(section);
		before += weights[i];
	});

	return columns;
}

const defaultSections: LinkSection[] = [
	{
		id: generateId(),
		title: 'simple',
		children: [
			{
				id: generateId(),
				name: 'google',
				url: 'https://google.com'
			},
			{
				id: generateId(),
				name: 'docs',
				url: 'https://docs.google.com'
			},
			{
				id: generateId(),
				name: 'gmail',
				url: 'https://gmail.com'
			},
			{
				id: generateId(),
				name: 'github',
				url: 'https://github.com'
			}
		]
	},
	{
		id: generateId(),
		title: 'links',
		children: [
			{
				id: generateId(),
				name: 'youtube',
				url: 'https://youtube.com'
			},
			{
				id: generateId(),
				name: 'twitter',
				url: 'https://twitter.com'
			}
		]
	}
];

// older versions just had a list of links and column count
const legacyLinks = Stored.takeLegacy('links');
const legacyColumns = Stored.takeLegacy('columns');

export const linkColumns = new Stored<LinkColumn[]>(
	'link-columns',
	splitIntoColumns(
		Array.isArray(legacyLinks) ? legacyLinks : defaultSections,
		typeof legacyColumns === 'number' ? legacyColumns : 1
	)
);

export const defaultQuoteTags = [
	'Future',
	'Technology',
	'Science',
	'Change',
	'Philosophy',
	'History',
	'Truth',
	'Education',
	'Humorous',
	'Life'
];

export const quoteTags = new Stored<string[]>('quote-tags', [
	...defaultQuoteTags
]);

export const discordId = new Stored('discordId', '');

export interface WeatherPlace {
	name: string;
	/** includes the region and country, to tell apart places with the same name */
	label: string;
	lat: number;
	lon: number;
}

export interface WeatherLocation {
	mode: 'approximate' | 'precise' | 'manual';
	place: WeatherPlace | null;
}

// anyone who set a key in the past has already allowed location access
export const weatherLocation = new Stored<WeatherLocation>('weather-location', {
	mode: Stored.takeLegacy('weatherKey') ? 'precise' : 'approximate',
	place: null
});

// clean up old localStorage entries
for (const key of ['weatherData', 'weatherDataTime', 'weatherDataKey']) {
	localStorage.removeItem(key);
}

export const weatherLayout = new Stored<'compact' | 'detailed'>(
	'weather-layout',
	'compact'
);

export interface Units {
	temperature: 'fahrenheit' | 'celsius';
	speed: 'mph' | 'kmh' | 'ms';
}

// older versions had a single imperial/metric setting
const legacyUnits = Stored.takeLegacy('weather-units');

export const units = new Stored<Units>('units', {
	temperature: legacyUnits === 'metric' ? 'celsius' : 'fahrenheit',
	speed: legacyUnits === 'metric' ? 'kmh' : 'mph'
});
