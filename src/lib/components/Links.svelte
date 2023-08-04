<script lang="ts">
	import { links, tweaks } from '../stores';
</script>

<div class="flow">
	{#each $links as { title, children }}
		<ul>
			<li>
				<h2>{title}</h2>
			</li>
			{#each children as { name, url }}
				<li
					class={$tweaks.bulletPoints
						? 'ml-6 list-disc'
						: "before:content-['-_']"}
				>
					<a class="hover:text-accent transition-colors" href={url}>
						{name}
					</a>
				</li>
			{/each}
		</ul>
	{/each}
</div>
