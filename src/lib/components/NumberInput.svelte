<script lang="ts">
	let {
		value = $bindable(),
		step,
		min,
		max
	}: {
		value: number;
		step?: number;
		min?: number;
		max?: number;
	} = $props();

	function clamp(n: number) {
		if (min !== undefined) n = Math.max(min, n);
		if (max !== undefined) n = Math.min(max, n);
		return n;
	}

	let draft: number | null = $derived(value);

	function onChange() {
		if (draft === null || Number.isNaN(draft)) draft = value;
		else value = draft = clamp(draft);
	}
	function setDraft(v: number | null) {
		draft = v;
		if (v !== null && v === clamp(v)) value = v;
	}
</script>

<input
	class="w-full px-2 py-0.5 bg-control border-2 border-current/10 focus:text-accent transition-colors rounded-lg placeholder:text-body placeholder:opacity-50"
	type="number"
	bind:value={() => draft, setDraft}
	{step}
	{min}
	{max}
	onchange={onChange}
/>
