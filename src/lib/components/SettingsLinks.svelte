<script lang="ts">
	import { flip } from 'svelte/animate';
	import { links, generateId } from '../stores.svelte';
	import Button from './Button.svelte';
	import Text from './Text.svelte';
	import ArrowDown from './icons/ArrowDown.svelte';
	import ArrowUp from './icons/ArrowUp.svelte';
	import DeleteIcon from './icons/DeleteIcon.svelte';
</script>

<div>
	<h3>links</h3>

	{#each links.value as section, sectionIndex (section.id)}
		<div animate:flip={{ duration: 300 }} class="mt-2 flex flex-col gap-1">
			<div class="flex items-center">
				<h4 class="flex-1">
					<Text placeholder="title" bind:value={section.title} />
				</h4>

				<div class="flex gap-1">
					<button
						class="hover:text-accent transition"
						title="move up"
						on:click={() => {
							if (sectionIndex <= 0) return;
							[
								links.value[sectionIndex],
								links.value[sectionIndex - 1]
							] = [
								links.value[sectionIndex - 1],
								links.value[sectionIndex]
							];
						}}
					>
						<ArrowUp />
					</button>
					<button
						class="hover:text-accent transition"
						title="move down"
						on:click={() => {
							if (sectionIndex >= links.value.length - 1) return;
							[
								links.value[sectionIndex],
								links.value[sectionIndex + 1]
							] = [
								links.value[sectionIndex + 1],
								links.value[sectionIndex]
							];
						}}
					>
						<ArrowDown />
					</button>
					<button
						class="hover:text-red-400 transition"
						title="delete"
						on:click={() => {
							links.value.splice(sectionIndex, 1);
						}}
					>
						<DeleteIcon />
					</button>
				</div>
			</div>

			<ul class="pl-4 flex flex-col gap-1">
				{#each section.children as link, linkIndex (link.id)}
					<li
						class="flex items-center gap-1"
						animate:flip={{ duration: 300 }}
					>
						<div class="flex-1">
							<Text placeholder="name" bind:value={link.name} />
						</div>

						<div class="flex-3">
							<Text placeholder="url" bind:value={link.url} />
						</div>

						<div class="flex gap-1">
							<button
								class="hover:text-accent transition"
								title="move up"
								on:click={() => {
									if (linkIndex <= 0) return;
									[
										section.children[linkIndex],
										section.children[linkIndex - 1]
									] = [
										section.children[linkIndex - 1],
										section.children[linkIndex]
									];
								}}
							>
								<ArrowUp />
							</button>
							<button
								class="hover:text-accent transition"
								title="move down"
								on:click={() => {
									if (
										linkIndex >=
										section.children.length - 1
									) {
										return;
									}

									[
										section.children[linkIndex],
										section.children[linkIndex + 1]
									] = [
										section.children[linkIndex + 1],
										section.children[linkIndex]
									];
								}}
							>
								<ArrowDown />
							</button>
							<button
								class="hover:text-red-400 transition"
								title="delete"
								on:click={() => {
									section.children.splice(linkIndex, 1);
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
						section.children.push({
							id: generateId(),
							name: '',
							url: ''
						});
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
				links.value.push({
					id: generateId(),
					title: '',
					children: []
				});
			}}
		>
			+ section
		</Button>
	</p>
</div>
