const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.html", "./src/**/*.svelte"],
	theme: {
		extend: {
			fontFamily: {
				main: ["'Roboto Mono'", ...defaultTheme.fontFamily.mono]
			},
			colors: {
				theme: "#19101d",
				dark: "#1b1b1b",
				light: "#a5acb6"
			}
		}
	},
	plugins: []
};
