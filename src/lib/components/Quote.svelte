<script lang="ts">
	const quote = fetch(
		`https://api.quotable.io/random?tags=future|technology|science|time`
	).then(res => res.json());
</script>

<div>
	{#await quote then quote}
		<blockquote>
			{quote.content}
		</blockquote>
		<cite>
			{quote.author}
		</cite>
	{/await}
</div>
