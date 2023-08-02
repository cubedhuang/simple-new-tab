<script lang="ts">
	import { flip } from 'svelte/animate';
	import { links, generateId } from '../stores';
	import Button from './Button.svelte';
	import Text from './Text.svelte';
	import ArrowDown from './icons/ArrowDown.svelte';
	import ArrowUp from './icons/ArrowUp.svelte';
	import DeleteIcon from './icons/DeleteIcon.svelte';
</script>

<div>
	<h3>links</h3>

	{#each $links as { id, title, children }, sectionIndex (id)}
		<div animate:flip={{ duration: 300 }} class="mt-2 flex flex-col gap-1">
			<div class="flex items-center">
				<h4 class="flex-1">
					<Text placeholder="title" bind:value={title} />
				</h4>

				<div class="flex gap-1">
					<button
						class="hover:text-accent transition"
						title="move up"
						on:click={() => {
							if (sectionIndex <= 0) return;
							[$links[sectionIndex], $links[sectionIndex - 1]] = [
								$links[sectionIndex - 1],
								$links[sectionIndex]
							];
						}}
					>
						<ArrowUp />
					</button>
					<button
						class="hover:text-accent transition"
						title="move up"
						on:click={() => {
							if (sectionIndex >= $links.length - 1) return;
							[$links[sectionIndex], $links[sectionIndex + 1]] = [
								$links[sectionIndex + 1],
								$links[sectionIndex]
							];
						}}
					>
						<ArrowDown />
					</button>
					<button
						class="hover:text-red-400 transition"
						title="delete"
						on:click={() => {
							$links.splice(sectionIndex, 1);
							$links = $links;
						}}
					>
						<DeleteIcon />
					</button>
				</div>
			</div>

			<ul class="pl-4 flex flex-col gap-1">
				{#each children as link, linkIndex (link.id)}
					<li
						class="flex items-center gap-1"
						animate:flip={{ duration: 300 }}
					>
						<div class="flex-1">
							<Text placeholder="name" bind:value={link.name} />
						</div>

						<div class="flex-[3]">
							<Text placeholder="url" bind:value={link.url} />
						</div>

						<div class="flex gap-1">
							<button
								class="hover:text-accent transition"
								title="move up"
								on:click={() => {
									if (linkIndex <= 0) return;
									[
										children[linkIndex],
										children[linkIndex - 1]
									] = [
										children[linkIndex - 1],
										children[linkIndex]
									];
								}}
							>
								<ArrowUp />
							</button>
							<button
								class="hover:text-accent transition"
								title="move up"
								on:click={() => {
									if (linkIndex >= children.length - 1) {
										return;
									}

									[
										children[linkIndex],
										children[linkIndex + 1]
									] = [
										children[linkIndex + 1],
										children[linkIndex]
									];
								}}
							>
								<ArrowDown />
							</button>
							<button
								class="hover:text-red-400 transition"
								title="delete"
								on:click={() => {
									children.splice(linkIndex, 1);
									children = children;
								}}
							>
								<DeleteIcon />
							</button>
						</div>
					</li>
				{/each}
			</ul>

			<p class="ml-4">
				<Button
					on:click={() => {
						children.push({
							id: generateId(),
							name: '',
							url: ''
						});
						children = children;
					}}
				>
					+ link
				</Button>
			</p>
		</div>
	{/each}

	<p class="mt-2">
		<Button
			on:click={() => {
				$links.push({
					id: generateId(),
					title: '',
					children: []
				});
				$links = $links;
			}}
		>
			+ section
		</Button>
	</p>
</div>
