function globalEffect(fn: () => void) {
	$effect.root(() => {
		$effect(fn);
	});
}

// see `readSetting` in public/theme.js
export class Stored<T> {
	value = $state() as T;

	constructor(key: string, initialValue: T) {
		const newKey = `simple-new-tab:${key}`;

		const saved = localStorage.getItem(newKey) || localStorage.getItem(key);
		if (saved) {
			try {
				initialValue = JSON.parse(saved);
			} catch {}
		}
		this.value = initialValue;

		globalEffect(() => {
			localStorage.setItem(newKey, JSON.stringify(this.value));
		});
	}
}

export const tweaks = new Stored('tweaks', {
	hideQuote: false,
	capitalizedTitle: false,
	bulletPoints: false,
	boldHeadings: false
});

globalEffect(() => {
	document.documentElement.style.setProperty(
		'--heading-font-weight',
		tweaks.value.boldHeadings ? '700' : '400'
	);
});

const initialColors = {
	background: '#19101d',
	unfocused: '#1e1e1e',
	accent: '#ffffff',
	body: '#a5acb6'
};

export const colors = new Stored<Record<string, string>>('colors', {
	...initialColors
});

globalEffect(() => {
	for (const [key, value] of Object.entries(colors.value)) {
		document.documentElement.style.setProperty(`--${key}`, value);
	}
});

export function resetColors() {
	colors.value = { ...initialColors };
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

export const clock = new Stored('clock', {
	hidden: false,
	longMonth: true,
	showDay: true,
	hour12: true,
	showTimezone: false,
	dayFirst: false,
	hideSeconds: false
});

interface Link {
	id: string;
	name: string;
	url: string;
}

interface LinkSection {
	id: string;
	title: string;
	children: Link[];
}

export function generateId() {
	return Math.random().toString(36).substring(2, 10);
}

export const links = new Stored<LinkSection[]>('links', [
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
]);

export const discordId = new Stored('discordId', '');

export const weatherKey = new Stored('weatherKey', '');
export const weatherUnits = new Stored<'imperial' | 'metric'>(
	'weather-units',
	'imperial'
);
