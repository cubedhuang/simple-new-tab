<script lang="ts">
	import { formatOklch, parseColor, type Oklch } from '../oklch';

	import TextInput from './TextInput.svelte';

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
	<div
		class="mb-2 grid grid-cols-[max-content_minmax(0,1fr)_max-content] items-center gap-x-3 gap-y-2"
	>
		{#each sliders as { key, name, max, step, digits, track }}
			<label class="contents">
				<span>{name}</span>

				<input
					class="color-slider w-full"
					style:--track="linear-gradient(to right, {track})"
					type="range"
					min="0"
					{max}
					{step}
					value={channels[key]}
					aria-label="{label} {name}"
					oninput={event => setChannel(key, event)}
				/>

				<span class="min-w-[5ch] text-right tabular-nums">
					{channels[key].toFixed(digits)}
				</span>
			</label>
		{/each}
	</div>

	<TextInput
		placeholder="#1c1720 or oklch(0.215 0.018 310)"
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
