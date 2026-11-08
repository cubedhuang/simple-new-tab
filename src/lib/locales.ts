const codes = [
	'en-US',
	'en-GB',
	'en-AU',
	'en-CA',
	'en-IN',
	'de-DE',
	'fr-FR',
	'fr-CA',
	'es-ES',
	'es-MX',
	'it-IT',
	'pt-BR',
	'pt-PT',
	'nl-NL',
	'sv-SE',
	'da-DK',
	'nb-NO',
	'fi-FI',
	'pl-PL',
	'cs-CZ',
	'hu-HU',
	'ro-RO',
	'el-GR',
	'ru-RU',
	'uk-UA',
	'tr-TR',
	'he-IL',
	'ar-EG',
	'hi-IN',
	'id-ID',
	'vi-VN',
	'th-TH',
	'ja-JP',
	'ko-KR',
	'zh-CN',
	'zh-TW'
];

export function resolveLocale(tag: string) {
	if (!tag) return undefined;
	try {
		return Intl.getCanonicalLocales(tag)[0];
	} catch {
		return undefined;
	}
}

function localeName(code: string) {
	try {
		return (
			new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? code
		);
	} catch {
		return code;
	}
}

export function localeOptions(current: string) {
	const options = codes.map(code => ({
		value: code,
		label: localeName(code)
	}));
	if (current && !codes.includes(current)) {
		options.unshift({ value: current, label: localeName(current) });
	}
	return [
		{ value: '', label: `Browser (${navigator.language})` },
		...options
	];
}
