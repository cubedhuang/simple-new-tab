<script lang="ts">
	import { links, tweaks } from '../stores.svelte';

	function normalize(url: string) {
		const trimmed = url.trim();
		const hasScheme = /^[a-z][a-z0-9+.-]*:(?!\d)/i.test(trimmed);
		if (!trimmed || hasScheme) return trimmed;
		return `https://${trimmed.replace(/^\/\//, '')}`;
	}
</script>

<div class="flow">
	{#each links.value as { title, children }}
		<ul>
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
