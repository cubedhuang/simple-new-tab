<script lang="ts">
	import { linkColumns, linkTransitionName, tweaks } from '../stores.svelte';
	import Notes from './Notes.svelte';

	const maxColumnWidth = '20em';

	function normalize(url: string) {
		const trimmed = url.trim();
		const hasScheme = /^[a-z][a-z0-9+.-]*:(?!\d)/i.test(trimmed);
		if (!trimmed || hasScheme) return trimmed;
		return `https://${trimmed.replace(/^\/\//, '')}`;
	}
</script>

<div class="flex flex-wrap gap-x-8 gap-y-6">
	{#each linkColumns.value as column (column.id)}
		{#if column.sections.length > 0}
			<div
				class="min-w-48 flex flex-col gap-6"
				style:max-width={maxColumnWidth}
			>
				{#each column.sections as section (section.id)}
					{#snippet title()}
						<h2
							class="link-transition"
							style:--link-transition={linkTransitionName(
								'section',
								section.id
							)}
						>
							{section.title}
						</h2>
					{/snippet}

					{#if section.kind === 'notes'}
						<div style:min-width={maxColumnWidth}>
							{@render title()}
							<Notes bind:value={section.text} id={section.id} />
						</div>
					{:else}
						<ul>
							<li>
								{@render title()}
							</li>
							{#each section.children as { id, name, url } (id)}
								<li
									class={tweaks.value.bulletPoints
										? 'ml-6 list-disc'
										: "flex before:content-['-_'] before:whitespace-pre"}
								>
									<a
										class="link-transition inline-block hover:text-accent transition-colors"
										href={normalize(url)}
										style:--link-transition={linkTransitionName(
											'link',
											id
										)}
									>
										{name}
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				{/each}
			</div>
		{/if}
	{/each}
</div>
