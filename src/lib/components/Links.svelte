<script lang="ts">
	import { columns, links, tweaks } from '../stores.svelte';

	function normalize(url: string) {
		const trimmed = url.trim();
		const hasScheme = /^[a-z][a-z0-9+.-]*:(?!\d)/i.test(trimmed);
		if (!trimmed || hasScheme) return trimmed;
		return `https://${trimmed.replace(/^\/\//, '')}`;
	}
</script>

<div
	class="w-fit gap-x-8"
	style:columns="{columns.value} 12em"
	style:max-width={columns.value > 1
		? `calc(${columns.value} * 24em + ${columns.value - 1} * 2rem)`
		: null}
>
	{#each links.value as { title, children }}
		<ul class="mb-6 last:mb-0 break-inside-avoid">
			<li>
				<h2>{title}</h2>
			</li>
			{#each children as { name, url }}
				<li
					class={tweaks.value.bulletPoints
						? 'ml-6 list-disc'
						: "before:content-['-_']"}
				>
					<a
						class="hover:text-accent transition-colors"
						href={normalize(url)}
					>
						{name}
					</a>
				</li>
			{/each}
		</ul>
	{/each}
</div>
