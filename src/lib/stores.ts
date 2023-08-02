import { writable } from 'svelte/store';

function writableStored<T>(key: string, initialValue: T) {
	const newKey = `simple-new-tab:${key}`;

	const value = localStorage.getItem(newKey) || localStorage.getItem(key);
	const store = writable<T>(value ? JSON.parse(value) : initialValue);

	store.subscribe(value => {
		localStorage.setItem(newKey, JSON.stringify(value));
	});

	return store;
}

interface Colors {
	background: string;
	unfocused: string;
}

export const colors = writableStored<Colors>('colors', {
	background: '#19101d',
	unfocused: '#1e1e1e'
});

interface ClockSettings {
	longMonth: boolean;
	showDay: boolean;
	hour12: boolean;
	showTimezone: boolean;
	dayFirst: boolean;
}

export const clock = writableStored<ClockSettings>('clock', {
	longMonth: true,
	showDay: true,
	hour12: true,
	showTimezone: false,
	dayFirst: false
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

export const links = writableStored<LinkSection[]>('links', [
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

export const discordId = writableStored('discordId', '');

export const weatherKey = writableStored('weatherKey', '');
