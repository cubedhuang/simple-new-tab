<script lang="ts">
	import { flip } from 'svelte/animate';
	import { columns, links, generateId } from '../stores.svelte';
	import Button from './Button.svelte';
	import Select from './Select.svelte';
	import TextInput from './TextInput.svelte';
	import ArrowDown from './icons/ArrowDown.svelte';
	import ArrowUp from './icons/ArrowUp.svelte';
	import DeleteIcon from './icons/DeleteIcon.svelte';

	const deleted = $state<{ name: string; restore: () => void }[]>([]);
	const lastDeleted = $derived(deleted.at(-1));

	function deleteSection(index: number) {
		const [section] = links.value.splice(index, 1);

		deleted.push({
			name: section.title || 'untitled section',
			restore() {
				links.value.splice(index, 0, section);
			}
		});
	}

	function deleteLink(sectionIndex: number, index: number) {
		const { id: sectionId, children } = links.value[sectionIndex];
		const [link] = children.splice(index, 1);

		deleted.push({
			name: link.name || 'unnamed link',
			restore() {
				const section = links.value.find(({ id }) => id === sectionId);
				if (!section) return;

				section.children.splice(index, 0, link);
			}
		});
	}

	function undoDelete() {
		deleted.pop()?.restore();
	}
</script>

<div>
	<h3>links</h3>

	<p class="mt-1">
		<Select
			label="Columns"
			bind:value={columns.value}
			options={[1, 2, 3, 4].map(n => ({ value: n, label: `${n}` }))}
		/>
	</p>

	{#each links.value as section, sectionIndex (section.id)}
		<div animate:flip={{ duration: 300 }} class="mt-2 flex flex-col gap-1">
			<div class="flex items-center">
				<h4 class="flex-1">
					<TextInput placeholder="title" bind:value={section.title} />
				</h4>

				<div class="flex gap-1">
					<button
						class="hover:text-accent transition"
						title="move up"
						onclick={() => {
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
						onclick={() => {
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
						onclick={() => deleteSection(sectionIndex)}
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
							<TextInput
								placeholder="name"
								bind:value={link.name}
							/>
						</div>

						<div class="flex-3">
							<TextInput
								placeholder="url"
								bind:value={link.url}
							/>
						</div>

						<div class="flex gap-1">
							<button
								class="hover:text-accent transition"
								title="move up"
								onclick={() => {
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
								onclick={() => {
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
								onclick={() =>
									deleteLink(sectionIndex, linkIndex)}
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

	{#if lastDeleted}
		<div
			class="sticky -bottom-8 -mb-2 py-2 flex items-center gap-2 bg-background"
			role="status"
		>
			<p class="min-w-0 truncate">Deleted {lastDeleted.name}.</p>

			<Button class="shrink-0" on:click={undoDelete}>undo</Button>
		</div>
	{/if}
</div>
