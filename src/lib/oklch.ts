export type Oklch = {
	l: number;
	c: number;
	h: number;
};

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const OKLCH =
	/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)(%?)\s+(-?[\d.]+)(?:deg)?\s*\)$/i;

function round(value: number, digits: number) {
	return Number(value.toFixed(digits));
}

function toLinear(channel: number) {
	return channel <= 0.04045
		? channel / 12.92
		: ((channel + 0.055) / 1.055) ** 2.4;
}

// https://bottosson.github.io/posts/oklab/
function hexToOklch(hex: string): Oklch {
	const digits =
		hex.length === 4 ? hex.slice(1).replace(/./g, '$&$&') : hex.slice(1);
	const [r, g, b] = [0, 2, 4].map(i =>
		toLinear(parseInt(digits.slice(i, i + 2), 16) / 255)
	);

	const l1 = Math.cbrt(
		0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
	);
	const m1 = Math.cbrt(
		0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
	);
	const s1 = Math.cbrt(
		0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
	);

	const l = 0.2104542553 * l1 + 0.793617785 * m1 - 0.0040720468 * s1;
	const a = 1.9779984951 * l1 - 2.428592205 * m1 + 0.4505937099 * s1;
	const bAxis = 0.0259040371 * l1 + 0.7827717662 * m1 - 0.808675766 * s1;

	const c = Math.hypot(a, bAxis);
	if (c < 0.0005) return { l, c: 0, h: 0 };

	return { l, c, h: ((Math.atan2(bAxis, a) * 180) / Math.PI + 360) % 360 };
}

export function parseColor(color: string): Oklch | null {
	const trimmed = color.trim();

	if (HEX.test(trimmed)) return hexToOklch(trimmed);

	const match = OKLCH.exec(trimmed);
	if (!match) return null;

	const [, l, lPercent, c, cPercent, h] = match;
	const values = [Number(l), Number(c), Number(h)];
	if (values.some(Number.isNaN)) return null;

	return {
		l: Math.min(values[0] / (lPercent ? 100 : 1), 1),
		// 100% chroma is 0.4 in css
		c: cPercent ? (values[1] / 100) * 0.4 : values[1],
		h: ((values[2] % 360) + 360) % 360
	};
}

export function formatOklch({ l, c, h }: Oklch) {
	const chroma = round(c, 3);
	const hue = chroma === 0 ? 0 : round(h % 360, 1);

	return `oklch(${round(l, 3)} ${chroma} ${hue})`;
}

export function isSameColor(a: string, b: string) {
	const [first, second] = [parseColor(a), parseColor(b)];

	return first && second
		? formatOklch(first) === formatOklch(second)
		: a === b;
}
