<script lang="ts">
	import { links } from "./stores";
</script>

<div class="flow">
	{#each $links as { title, links }}
		<ul>
			<li>
				<h2>{title}</h2>
			</li>
			{#each links as { name, url }}
				<li class="before:content-['-_']">
					<a class="hover:text-white transition-colors" href={url}>
						{name}
					</a>
				</li>
			{/each}
		</ul>
	{/each}
</div>
