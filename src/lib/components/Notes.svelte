<script lang="ts">
	import { linkTransitionName } from '../stores.svelte';

	let {
		value = $bindable(),
		id
	}: {
		value: string;
		/** section id for transitions and focus */
		id: string;
	} = $props();

	let textarea: HTMLTextAreaElement;

	const fitsContent = CSS.supports('field-sizing', 'content');

	function fit() {
		if (fitsContent || !textarea) return;
		textarea.style.height = 'auto';
		const border = textarea.offsetHeight - textarea.clientHeight;
		textarea.style.height = `${textarea.scrollHeight + border}px`;
	}

	$effect(() => {
		// text changing in another tab can refit it
		void value;
		fit();
	});
</script>

<svelte:window onresize={fit} />

<textarea
	bind:this={textarea}
	bind:value
	data-focus-id={id}
	style:--link-transition={linkTransitionName('notes', id)}
	rows="2"
	placeholder="notes..."
	aria-label="notes"
	class="link-transition block w-full contain-inline-size min-h-[calc(2lh+0.5rem+4px)] px-2 py-1 resize-none overflow-hidden field-sizing-content bg-control border-2 border-current/10 rounded-lg transition-colors placeholder:text-body placeholder:opacity-50
	    focus:outline-none focus:border-accent/50"></textarea>
