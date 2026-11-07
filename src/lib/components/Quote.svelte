<script lang="ts">
	import { filterQuotes, loadQuotes, type Quote } from '../quotes';
	import { quoteTags, Stored, tweaks } from '../stores.svelte';

	async function loadQuote(tags: string[]) {
		const matching = filterQuotes(await loadQuotes(), tags);

		return matching[Math.floor(Math.random() * matching.length)];
	}

	const cachedQuote = new Stored<Quote | null>('cached-quote', null);
	const quote = cachedQuote.value ?? loadQuote(quoteTags.value);

	$effect(() => {
		loadQuote($state.snapshot(quoteTags.value)).then(next => {
			cachedQuote.value = next;
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
