<script lang="ts" generics="T">
	let {
		label,
		value = $bindable(),
		options
	}: {
		label: string;
		value: T;
		options: { value: T; label: string }[];
	} = $props();
</script>

<label class="inline-flex items-center gap-2">
	<span>{label}</span>

	<span class="group relative inline-flex">
		<select
			class="appearance-none pl-2 pr-7 py-0.5 bg-control border-2 border-current/10 hover:text-accent focus:text-accent transition-colors rounded-lg cursor-pointer"
			bind:value
		>
			{#each options as option}
				<option class="bg-background text-body" value={option.value}>
					{option.label}
				</option>
			{/each}
		</select>

		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
			class="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 transition-colors group-hover:text-accent group-focus-within:text-accent"
			aria-hidden="true"
		>
			<path
				fill-rule="evenodd"
				d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
				clip-rule="evenodd"
			/>
		</svg>
	</span>
</label>
