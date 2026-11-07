// extension pages block inline scripts but we want this to run in the head before everything else to
// reduce FOUC as much as possible

const rootStyle = document.documentElement.style;

// see `Stored` in src/lib/stores.svelte.ts
function readSetting(key, apply) {
	const newKey = `simple-new-tab:${key}`;

	try {
		const raw = localStorage.getItem(newKey) || localStorage.getItem(key);

		if (raw) apply(JSON.parse(raw));
	} catch {
		localStorage.removeItem(newKey);
		localStorage.removeItem(key);
	}
}

// also called from src/lib/stores.svelte.ts when the colors change
// svg created with Figma
function setFavicon({ background = '#19101d', accent = '#ffffff' }) {
	const svg = `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 12C0 5.37258 5.37258 0 12 0H84C90.6274 0 96 5.37258 96 12V84C96 90.6274 90.6274 96 84 96H12C5.37258 96 0 90.6274 0 84V12Z" fill="${background}"/>
<path d="M30.5906 74.9063C30.0281 74.9063 29.55 74.7375 29.1562 74.4C28.8187 74.0063 28.65 73.5281 28.65 72.9656V32.9719C28.65 32.4094 28.8187 31.9594 29.1562 31.6219C29.55 31.2281 30.0281 31.0312 30.5906 31.0312H34.5562C35.1187 31.0312 35.5687 31.2281 35.9062 31.6219C36.3 31.9594 36.4969 32.4094 36.4969 32.9719V36.6844C37.9594 34.7719 39.7875 33.225 41.9812 32.0438C44.2312 30.8063 47.1 30.1875 50.5875 30.1875C54.2437 30.1875 57.3375 31.0031 59.8687 32.6344C62.4562 34.2094 64.3969 36.4313 65.6906 39.3C66.9844 42.1125 67.6312 45.4031 67.6312 49.1719V72.9656C67.6312 73.5281 67.4625 74.0063 67.125 74.4C66.7875 74.7375 66.3375 74.9063 65.775 74.9063H61.5562C60.9937 74.9063 60.5156 74.7375 60.1219 74.4C59.7844 74.0063 59.6156 73.5281 59.6156 72.9656V49.5938C59.6156 45.6563 58.6594 42.5906 56.7469 40.3969C54.8344 38.1469 52.0219 37.0219 48.3094 37.0219C44.8219 37.0219 42.0094 38.1469 39.8719 40.3969C37.7906 42.5906 36.75 45.6563 36.75 49.5938V72.9656C36.75 73.5281 36.5531 74.0063 36.1594 74.4C35.8219 74.7375 35.3719 74.9063 34.8094 74.9063H30.5906Z" fill="${accent}"/>
</svg>`;

	document.getElementById('favicon').href =
		`data:image/svg+xml,${encodeURIComponent(svg)}`;
}

setFavicon({});

readSetting('colors', colors => {
	for (const [key, value] of Object.entries(colors)) {
		rootStyle.setProperty(`--${key}`, value);
	}

	setFavicon(colors);
});

readSetting('font', font => {
	rootStyle.setProperty('--font', font);
});

readSetting('font-size', fontSize => {
	rootStyle.setProperty('--font-size', `${fontSize}%`);
});

readSetting('tweaks', tweaks => {
	rootStyle.setProperty(
		'--heading-font-weight',
		tweaks.boldHeadings ? '700' : '400'
	);

	if (tweaks.capitalizedTitle) {
		document.title = 'New Tab';
	}
});
