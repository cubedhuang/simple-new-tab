<script lang="ts">
	import { notes } from '../stores.svelte';

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
		void notes.value;
		fit();
	});
</script>

<svelte:window onresize={fit} />

<div class="max-w-prose">
	<h2 class="link-transition" style:--link-transition="notes-heading">
		notes
	</h2>

	<textarea
		bind:this={textarea}
		bind:value={notes.value}
		style:--link-transition="notes-text"
		rows="2"
		placeholder="notes..."
		aria-label="notes"
		class="link-transition block w-full contain-inline-size min-h-[calc(2lh+0.5rem+4px)] px-2 py-1 resize-none overflow-hidden field-sizing-content bg-control border-2 border-current/10 rounded-lg transition-colors placeholder:text-body placeholder:opacity-50
		    focus:outline-none focus:border-accent/50"></textarea>
</div>
