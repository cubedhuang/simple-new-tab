<script lang="ts">
	import { Stored, tweaks } from '../stores.svelte';

	type Quote = {
		content: string;
		author: string;
		link: string;
		tags: string[];
	};

	const TAGS = [
		'Future',
		'Technology',
		'Science',
		'Time',
		'Change',
		'Philosophy',
		'History',
		'Knowledge',
		'Imagination',
		'Creativity',
		'Mathematics',
		'Genius',
		'Nature',
		'Truth',
		'Education',
		'Literature',
		'Opportunity',
		'Humorous',
		'Life'
	];

	async function loadQuote() {
		const quotes: Quote[] = await fetch('/quotes.json').then(res =>
			res.json()
		);
		const matching = quotes.filter(({ tags }) =>
			tags.some(tag => TAGS.includes(tag))
		);

		return matching[Math.floor(Math.random() * matching.length)];
	}

	const cachedQuote = new Stored<Quote | null>('cached-quote', null);
	const quote = cachedQuote.value ?? loadQuote();

	loadQuote().then(next => {
		cachedQuote.value = next;
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
