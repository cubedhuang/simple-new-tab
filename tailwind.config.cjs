const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.html', './src/**/*.svelte'],
	theme: {
		extend: {
			fontFamily: {
				main: ["'Roboto Mono'", ...defaultTheme.fontFamily.mono]
			},
			colors: {
				background: 'var(--background)',
				unfocused: 'var(--unfocused)',
				accent: 'var(--accent)',
				body: 'var(--body)'
			}
		}
	},
	plugins: []
};
