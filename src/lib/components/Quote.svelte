<script lang="ts">
	import { Stored, tweaks } from '../stores.svelte';

	type Quote = {
		content: string;
		author: { name: string; link?: string };
	};

	// i didn't see a schema for the thing and links from remotes are scary
	function isWebUrl(link: string | undefined): link is string {
		try {
			const { protocol } = new URL(link ?? '');
			return protocol === 'http:' || protocol === 'https:';
		} catch {
			return false;
		}
	}

	function isQuote(value: any): value is Quote {
		return (
			typeof value?.content === 'string' &&
			typeof value?.author?.name === 'string'
		);
	}

	async function loadQuote() {
		return fetch(
			`https://api.quotable.kurokeita.dev/api/quotes/random?tags=Future|Technology|Science|Time|Change`
		)
			.then(res => res.json())
			.then(data => (isQuote(data.quote) ? data.quote : undefined))
			.catch(() => undefined);
	}

	async function getQuote() {
		const nextQuoteStore = new Stored<Quote | null>('next-quote', null);
		const savedQuote = nextQuoteStore.value;

		const nextQuote = loadQuote();
		nextQuote.then(q => {
			if (q) {
				nextQuoteStore.value = q;
			}
		});

		if (isQuote(savedQuote)) {
			return savedQuote;
		}

		return (await loadQuote()) ?? nextQuote;
	}

	const quote = getQuote();
</script>

{#await quote then quote}
	{#if quote}
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
					{#if isWebUrl(quote.author.link)}
						<a
							href={quote.author.link}
							rel="external noopener noreferrer"
							class="hover:text-accent transition"
						>
							{quote.author.name}
						</a>
					{:else}
						{quote.author.name}
					{/if}
				</cite>
			</figcaption>
		</figure>
	{/if}
{/await}
