<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		checked = $bindable(false),
		class: className = '',
		transitionName,
		...rest
	}: Omit<HTMLInputAttributes, 'type' | 'checked'> & {
		checked?: boolean;
		transitionName?: string;
	} = $props();
</script>

<span
	class="relative inline-grid size-5 shrink-0 place-items-center {className}"
	class:link-transition={transitionName}
	style:--link-transition={transitionName}
>
	<input
		type="checkbox"
		bind:checked
		class="peer size-full appearance-none cursor-pointer rounded-md border-2 transition-colors bg-control border-current/30 hover:border-accent/50 checked:bg-accent/10 checked:border-accent/50"
		{...rest}
	/>
	<svg
		class="pointer-events-none absolute size-4 text-accent opacity-0 transition-opacity peer-checked:opacity-100"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 16 16"
		fill="currentColor"
	>
		<path
			fill-rule="evenodd"
			d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
			clip-rule="evenodd"
		/>
	</svg>
</span>
