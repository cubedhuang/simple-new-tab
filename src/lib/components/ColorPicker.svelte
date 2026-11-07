<script lang="ts">
	import { formatOklch, parseColor, type Oklch } from '../oklch';

	import Text from './Text.svelte';

	const MAX_CHROMA = 0.37;
	const HUE_STOPS = Array.from({ length: 13 }, (_, i) => i * 30);

	let { value = $bindable(), label }: { value: string; label: string } =
		$props();

	let channels = $state<Oklch>({ l: 0.5, c: 0, h: 0 });
	let text = $state('');
	let invalid = $state(false);

	// the last value this picker saved, to tell its own updates apart from
	// outside ones like presets and imports
	let written: string | undefined;

	$effect.pre(() => {
		if (value === written) return;

		written = value;
		text = value;
		invalid = false;

		const parsed = parseColor(value);
		if (parsed) load(parsed);
	});

	function load(parsed: Oklch) {
		// grays have no hue, so keep the slider where it was instead of jumping
		channels = { ...parsed, h: parsed.c === 0 ? channels.h : parsed.h };
	}

	function save() {
		written = formatOklch(channels);
		value = written;
	}

	function setChannel(key: keyof Oklch, event: Event) {
		channels[key] = (event.currentTarget as HTMLInputElement).valueAsNumber;
		invalid = false;
		save();
		text = value;
	}

	function setText() {
		const parsed = parseColor(text);

		invalid = !parsed;
		if (!parsed) return;

		load(parsed);
		save();
	}

	const sliders = $derived<
		{
			key: keyof Oklch;
			name: string;
			max: number;
			step: number;
			digits: number;
			track: string;
		}[]
	>([
		{
			key: 'l',
			name: 'lightness',
			max: 1,
			step: 0.001,
			digits: 3,
			track: `oklch(0 ${channels.c} ${channels.h}), oklch(1 ${channels.c} ${channels.h})`
		},
		{
			key: 'c',
			name: 'chroma',
			max: MAX_CHROMA,
			step: 0.001,
			digits: 3,
			track: `oklch(${channels.l} 0 ${channels.h}), oklch(${channels.l} ${MAX_CHROMA} ${channels.h})`
		},
		{
			key: 'h',
			name: 'hue',
			max: 360,
			step: 0.1,
			digits: 1,
			track: HUE_STOPS.map(
				hue => `oklch(${channels.l} ${channels.c} ${hue})`
			).join(', ')
		}
	]);
</script>

<div class="mt-2 max-w-lg p-3 bg-control rounded-lg">
	{#each sliders as { key, name, max, step, digits, track }}
		<label class="mb-2 flex items-center gap-3">
			<span class="w-20 shrink-0">{name}</span>

			<input
				class="color-slider min-w-0 flex-1"
				style:--track="linear-gradient(to right, {track})"
				type="range"
				min="0"
				{max}
				{step}
				value={channels[key]}
				aria-label="{label} {name}"
				oninput={event => setChannel(key, event)}
			/>

			<span class="w-12 shrink-0 text-right tabular-nums">
				{channels[key].toFixed(digits)}
			</span>
		</label>
	{/each}

	<Text
		placeholder="#19101d or oklch(0.19 0.03 315)"
		bind:value={text}
		on:input={setText}
	/>

	{#if invalid}
		<p class="mt-1" role="status">Enter a hex or oklch() color!</p>
	{/if}
</div>

<style lang="postcss">
	@reference "../../app.css";

	.color-slider {
		height: 0.75rem;
		appearance: none;
		background: var(--track);
		border-radius: 9999px;
		cursor: pointer;
	}

	.color-slider:focus-visible {
		@apply outline-2 outline-offset-2 outline-accent;
	}

	.color-slider::-webkit-slider-thumb {
		width: 1rem;
		height: 1rem;
		appearance: none;
		background: white;
		border: 2px solid black;
		border-radius: 9999px;
	}

	.color-slider::-moz-range-thumb {
		width: 1rem;
		height: 1rem;
		box-sizing: border-box;
		background: white;
		border: 2px solid black;
		border-radius: 9999px;
	}
</style>
