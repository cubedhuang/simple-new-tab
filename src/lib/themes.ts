export interface Theme {
	name: string;
	colors: Record<'background' | 'unfocused' | 'accent' | 'body', string>;
}

// converted from each theme's published hex palette
export const themes: Theme[] = [
	{
		name: 'Default',
		colors: {
			background: 'oklch(0.191 0.029 315.1)',
			unfocused: 'oklch(0.235 0 0)',
			accent: 'oklch(1 0 0)',
			body: 'oklch(0.742 0.016 257.2)'
		}
	},
	{
		name: 'GitHub Dark',
		colors: {
			background: 'oklch(0.176 0.014 258.4)',
			unfocused: 'oklch(0.104 0.019 248.3)',
			accent: 'oklch(0.715 0.152 253.3)',
			body: 'oklch(0.943 0.011 243.7)'
		}
	},
	{
		name: 'Dark Modern',
		colors: {
			background: 'oklch(0.239 0 0)',
			unfocused: 'oklch(0.209 0 0)',
			accent: 'oklch(0.718 0.149 248.2)',
			body: 'oklch(0.845 0 0)'
		}
	},
	{
		name: 'Ayu Dark',
		colors: {
			background: 'oklch(0.191 0.017 264)',
			unfocused: 'oklch(0.173 0.015 266.7)',
			accent: 'oklch(0.797 0.13 82.2)',
			body: 'oklch(0.798 0.01 93.6)'
		}
	},
	{
		name: 'Catppuccin Latte',
		colors: {
			background: 'oklch(0.958 0.006 264.5)',
			unfocused: 'oklch(0.933 0.009 264.5)',
			accent: 'oklch(0.555 0.25 297)',
			body: 'oklch(0.435 0.043 279.3)'
		}
	},
	{
		name: 'Catppuccin Frappé',
		colors: {
			background: 'oklch(0.329 0.032 274.8)',
			unfocused: 'oklch(0.297 0.029 276.2)',
			accent: 'oklch(0.765 0.111 311.7)',
			body: 'oklch(0.862 0.053 273.3)'
		}
	},
	{
		name: 'Catppuccin Macchiato',
		colors: {
			background: 'oklch(0.279 0.035 276.9)',
			unfocused: 'oklch(0.249 0.03 278.4)',
			accent: 'oklch(0.772 0.126 303.9)',
			body: 'oklch(0.871 0.048 273.7)'
		}
	},
	{
		name: 'Catppuccin Mocha',
		colors: {
			background: 'oklch(0.243 0.03 283.9)',
			unfocused: 'oklch(0.216 0.025 284.1)',
			accent: 'oklch(0.787 0.119 304.8)',
			body: 'oklch(0.879 0.043 272.3)'
		}
	},
	{
		name: 'Dracula',
		colors: {
			background: 'oklch(0.288 0.022 277.5)',
			unfocused: 'oklch(0.255 0.019 280.5)',
			accent: 'oklch(0.742 0.149 301.9)',
			body: 'oklch(0.977 0.008 106.5)'
		}
	},
	{
		name: 'Nord',
		colors: {
			background: 'oklch(0.324 0.023 264.2)',
			unfocused: 'oklch(0.379 0.029 266.5)',
			accent: 'oklch(0.775 0.062 217.5)',
			body: 'oklch(0.899 0.016 262.7)'
		}
	},
	{
		name: 'Tokyo Night',
		colors: {
			background: 'oklch(0.226 0.021 280.5)',
			unfocused: 'oklch(0.204 0.016 284.9)',
			accent: 'oklch(0.719 0.132 264.2)',
			body: 'oklch(0.767 0.054 275.5)'
		}
	},
	{
		// a tribute to the windows 3.1 color scheme
		name: 'Hot Dog Stand',
		colors: {
			background: 'oklch(0.628 0.258 29.2)',
			unfocused: 'oklch(0 0 0)',
			accent: 'oklch(0.968 0.211 109.8)',
			body: 'oklch(1 0 0)'
		}
	}
];
