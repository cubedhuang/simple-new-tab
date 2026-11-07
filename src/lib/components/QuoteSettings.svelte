<script lang="ts">
	import { filterQuotes, loadQuotes, type Quote } from '../quotes';
	import { defaultQuoteTags, quoteTags } from '../stores.svelte';

	import Button from './Button.svelte';

	let quotes = $state.raw<Quote[]>([]);
	let editing = $state(false);

	loadQuotes().then(loaded => {
		quotes = loaded;
	});

	const tags = $derived([...new Set(quotes.flatMap(q => q.tags))].sort());
	const selectedCount = $derived(
		tags.filter(tag => quoteTags.value.includes(tag)).length
	);
	const count = $derived(filterQuotes(quotes, quoteTags.value).length);

	function toggle(tag: string) {
		quoteTags.value = quoteTags.value.includes(tag)
			? quoteTags.value.filter(selected => selected !== tag)
			: [...quoteTags.value, tag];
	}
</script>

<div>
	<h3>quotes</h3>

	<p class="mt-1 flex flex-wrap items-baseline gap-1">
		<Button on:click={() => (editing = !editing)}>
			{editing ? 'hide tags' : 'edit tags'}
		</Button>

		{#if editing}
			<Button
				on:click={() => {
					quoteTags.value = [...defaultQuoteTags];
				}}
			>
				default tags
			</Button>

			<Button
				on:click={() => {
					quoteTags.value = [];
				}}
			>
				clear tags
			</Button>
		{/if}

		{#if quotes.length > 0}
			<span class="ml-1" role="status">
				{#if selectedCount === 0}
					any tag,
				{:else}
					{selectedCount}
					{selectedCount === 1 ? 'tag' : 'tags'},
				{/if}
				{count}
				{count === 1 ? 'quote' : 'quotes'}
			</span>
		{/if}
	</p>

	{#if editing}
		<div class="mt-2 flex flex-wrap gap-1 text-xs">
			{#each tags as tag}
				{@const selected = quoteTags.value.includes(tag)}
				<Button pressed={selected} on:click={() => toggle(tag)}>
					{tag}
				</Button>
			{/each}
		</div>
	{/if}
</div>
