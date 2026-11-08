<script lang="ts">
	import { linkColumns, linkTransitionName, tweaks } from '../stores.svelte';

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
			<div class="min-w-[12em] max-w-[24em] flex flex-col gap-6">
				{#each column.sections as { id, title, children } (id)}
					<ul>
						<li>
							<h2
								class="link-transition"
								style:--link-transition={linkTransitionName(
									'section',
									id
								)}
							>
								{title}
							</h2>
						</li>
						{#each children as { id, name, url } (id)}
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
				{/each}
			</div>
		{/if}
	{/each}
</div>
