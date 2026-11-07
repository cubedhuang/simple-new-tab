<script lang="ts">
	import { filterQuotes, loadQuotes, type Quote } from '../quotes';
	import { isNewTab, quoteTags, Stored, tweaks } from '../stores.svelte';

	async function loadQuote(tags: string[]) {
		const matching = filterQuotes(await loadQuotes(), tags);

		return matching[Math.floor(Math.random() * matching.length)];
	}

	const nextQuote = new Stored<Quote | null>('next-quote', null);
	const shownQuote = new Stored<Quote | null>(
		'shown-quote',
		null,
		sessionStorage
	);

	if (isNewTab || !shownQuote.value) {
		shownQuote.value = nextQuote.value;
	}

	const quote =
		shownQuote.value ??
		loadQuote(quoteTags.value).then(loaded => {
			shownQuote.value = loaded;
			return loaded;
		});

	$effect(() => {
		loadQuote($state.snapshot(quoteTags.value)).then(next => {
			nextQuote.value = next;
		});
	});
</script>

{#await quote then quote}
	<figure>
		<blockquote class="max-w-prose">
			{quote.content}
		</blockquote>
		<figcaption>
			{#if tweaks.value.bulletPoints}
				&mdash;
			{:else}
				-
			{/if}
			<cite>
				<a
					href={quote.link}
					rel="external noopener noreferrer"
					class="hover:text-accent transition"
				>
					{quote.author}
				</a>
			</cite>
		</figcaption>
	</figure>
{/await}
