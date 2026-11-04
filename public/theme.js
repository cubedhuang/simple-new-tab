// extension pages block inline scripts but we want this to run in the head before everything else to
// reduce FOUC as much as possible

const rootStyle = document.documentElement.style;

// see `writableStored` in src/lib/stores.ts
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

readSetting('colors', colors => {
	for (const [key, value] of Object.entries(colors)) {
		rootStyle.setProperty(`--${key}`, value);
	}
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
