<script lang="ts">
	import { tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import {
		generateId,
		linkColumns,
		linkTransitionName,
		MAX_LINK_COLUMNS,
		type Link,
		type LinkColumn,
		type LinkSection
	} from '../stores.svelte';
	import Button from './Button.svelte';
	import DeleteIcon from './icons/DeleteIcon.svelte';
	import DragHandle from './icons/DragHandle.svelte';

	let { ondone }: { ondone: () => void } = $props();

	let container: HTMLElement;

	function findColumn(id: string) {
		return linkColumns.value.find(column => column.id === id);
	}

	function findSection(id: string) {
		return linkColumns.value
			.flatMap(column => column.sections)
			.find(section => section.id === id);
	}

	function move(
		from: { id: string }[],
		fromIndex: number,
		to: { id: string }[],
		toIndex: number
	) {
		const [item] = from.splice(fromIndex, 1);
		to.splice(toIndex, 0, item);
		return item;
	}

	async function focusById(id: string, selector = '[data-focus-id]') {
		await tick();
		container
			.querySelector<HTMLElement>(`${selector}[data-focus-id="${id}"]`)
			?.focus();
	}

	// columns are created by dropping onto the new column space and disappear once emptied

	const canAddColumn = $derived(linkColumns.value.length < MAX_LINK_COLUMNS);

	function addColumn(index = linkColumns.value.length) {
		const column: LinkColumn = { id: generateId(), sections: [] };
		linkColumns.value.splice(index, 0, column);
		// this is the proxy instead of just the object
		return linkColumns.value[index];
	}

	function pruneEmptyColumns() {
		const columns = linkColumns.value;
		const remaining = columns.filter(column => column.sections.length > 0);
		if (remaining.length < columns.length) {
			linkColumns.value = remaining.length > 0 ? remaining : [columns[0]];
		}
	}

	pruneEmptyColumns();

	function addSection(column: LinkColumn) {
		const id = generateId();
		column.sections.push({ id, title: '', children: [] });
		focusById(id, 'input');
		// this is the proxy instead of just the object
		return column.sections[column.sections.length - 1];
	}

	function addLink(section: LinkSection) {
		const id = generateId();
		section.children.push({ id, name: '', url: '' });
		focusById(id, 'input');
	}

	const deleted = $state<{ name: string; restore: () => void }[]>([]);
	const lastDeleted = $derived(deleted.at(-1));

	const isEmptyLink = (link: Link) => !link.name.trim() && !link.url.trim();

	function deleteSection(column: LinkColumn, index: number) {
		const [section] = column.sections.splice(index, 1);
		const columnId = column.id;
		const columnIndex = linkColumns.value.indexOf(column);
		pruneEmptyColumns();

		if (!section.title.trim() && section.children.every(isEmptyLink)) {
			return;
		}
		deleted.push({
			name: section.title || 'untitled section',
			restore() {
				// the column was removed if this emptied it
				const target =
					findColumn(columnId) ??
					addColumn(Math.min(columnIndex, linkColumns.value.length));
				target.sections.splice(index, 0, section);
			}
		});
	}

	function deleteLink(section: LinkSection, index: number) {
		const [link] = section.children.splice(index, 1);
		const sectionId = section.id;

		if (isEmptyLink(link)) return;
		deleted.push({
			name: link.name || 'unnamed link',
			restore() {
				findSection(sectionId)?.children.splice(index, 0, link);
			}
		});
	}

	function undoDelete() {
		deleted.pop()?.restore();
	}

	// drag and drop

	type Drag = { kind: 'link' | 'section'; id: string };

	/** indices are gaps between items counted before it's removed */
	type Drop =
		| { kind: 'link'; sectionId: string; index: number }
		| { kind: 'section'; columnId: string; index: number }
		| { kind: 'new-column' };

	let drag = $state<Drag | null>(null);
	let drop = $state<Drop | null>(null);

	// set a frame after the drag starts to capture the undimmed item as the image
	let lifted = $state(false);

	function startDrag(event: DragEvent, next: Drag) {
		const dt = event.dataTransfer;
		if (!dt) return;

		// firefox won't start a drag without data
		dt.setData('text/plain', '');
		dt.effectAllowed = 'move';

		const target = event.currentTarget as HTMLElement;
		const row = target.closest<HTMLElement>(
			next.kind === 'section' ? '[data-section]' : '[data-link-row]'
		);
		if (row) {
			const rect = row.getBoundingClientRect();
			dt.setDragImage(
				row,
				event.clientX - rect.left,
				event.clientY - rect.top
			);
		}

		drag = next;
		requestAnimationFrame(() => {
			if (drag) lifted = true;
		});
	}

	function endDrag() {
		drag = null;
		drop = null;
		lifted = false;
	}

	/**
	 * finds the gap under the pointer among the `selector` elements, which
	 * render `items` and returns null when no change would happen
	 */
	function dropIndex(
		event: DragEvent,
		selector: string,
		items: { id: string }[]
	) {
		event.preventDefault();
		event.dataTransfer!.dropEffect = 'move';

		const elements = [
			...(event.currentTarget as HTMLElement).querySelectorAll(selector)
		];
		// the first element whose midpoint is below the pointer
		let index = elements.findIndex(element => {
			const { top, height } = element.getBoundingClientRect();
			return event.clientY < top + height / 2;
		});
		if (index === -1) index = elements.length;

		const from = items.findIndex(({ id }) => id === drag?.id);
		return from !== -1 && (index === from || index === from + 1)
			? null
			: index;
	}

	function onSectionDragOver(event: DragEvent, section: LinkSection) {
		if (drag?.kind !== 'link') return;
		const index = dropIndex(event, '[data-link-row]', section.children);
		drop =
			index === null
				? null
				: { kind: 'link', sectionId: section.id, index };
	}

	function onColumnDragOver(event: DragEvent, column: LinkColumn) {
		if (drag?.kind !== 'section') return;
		const index = dropIndex(
			event,
			':scope > [data-section]',
			column.sections
		);
		drop =
			index === null
				? null
				: { kind: 'section', columnId: column.id, index };
	}

	function onNewColumnDragOver(event: DragEvent) {
		if (!drag) return;
		event.preventDefault();
		event.dataTransfer!.dropEffect = 'move';
		drop = { kind: 'new-column' };
	}

	function onContainerDragLeave(event: DragEvent) {
		if (!container.contains(event.relatedTarget as Node | null)) {
			drop = null;
		}
	}

	/** the list holding the dragged item, and its index in that list */
	function findDragged({ kind, id }: Drag) {
		for (const column of linkColumns.value) {
			const lists: { id: string }[][] =
				kind === 'section'
					? [column.sections]
					: column.sections.map(section => section.children);

			for (const list of lists) {
				const index = list.findIndex(item => item.id === id);
				if (index !== -1) return { list, index };
			}
		}
	}

	function onDrop(event: DragEvent) {
		if (!drag) return;
		event.preventDefault();

		const source = findDragged(drag);

		if (source && drop) {
			if (drop.kind === 'new-column') {
				const column = addColumn();
				const target =
					drag.kind === 'link'
						? addSection(column).children
						: column.sections;
				move(source.list, source.index, target, 0);
			} else {
				const target =
					drop.kind === 'link'
						? findSection(drop.sectionId)?.children
						: findColumn(drop.columnId)?.sections;

				if (target) {
					const shifted =
						target === source.list && source.index < drop.index;
					move(
						source.list,
						source.index,
						target,
						shifted ? drop.index - 1 : drop.index
					);
				}
			}
		}

		pruneEmptyColumns();
		endDrag();
	}

	// keyboard reordering

	function arrowDelta(event: KeyboardEvent, axis: 'vertical' | 'horizontal') {
		const [back, forward] =
			axis === 'vertical'
				? ['ArrowUp', 'ArrowDown']
				: ['ArrowLeft', 'ArrowRight'];
		return event.key === back ? -1 : event.key === forward ? 1 : 0;
	}

	function onSectionHandleKey(
		event: KeyboardEvent,
		columnIndex: number,
		sectionIndex: number
	) {
		const vertical = arrowDelta(event, 'vertical');
		const horizontal = arrowDelta(event, 'horizontal');
		if (!vertical && !horizontal) return;
		event.preventDefault();

		const column = linkColumns.value[columnIndex];

		if (vertical) {
			const target = sectionIndex + vertical;
			if (target < 0 || target >= column.sections.length) return;

			const section = move(
				column.sections,
				sectionIndex,
				column.sections,
				target
			);
			focusById(section.id, '[data-handle]');
			return;
		}

		let neighbor = linkColumns.value[columnIndex + horizontal];
		if (!neighbor) {
			if (
				horizontal < 0 ||
				!canAddColumn ||
				column.sections.length === 1
			) {
				return;
			}
			neighbor = addColumn();
		}

		const section = move(
			column.sections,
			sectionIndex,
			neighbor.sections,
			Math.min(sectionIndex, neighbor.sections.length)
		);
		pruneEmptyColumns();
		focusById(section.id, '[data-handle]');
	}

	function onLinkHandleKey(
		event: KeyboardEvent,
		section: LinkSection,
		linkIndex: number
	) {
		const delta = arrowDelta(event, 'vertical');
		if (!delta) return;
		event.preventDefault();

		const target = linkIndex + delta;

		if (target >= 0 && target < section.children.length) {
			const link = move(
				section.children,
				linkIndex,
				section.children,
				target
			);
			focusById(link.id, '[data-handle]');
			return;
		}

		const sections = linkColumns.value.flatMap(column => column.sections);
		const neighbor = sections[sections.indexOf(section) + delta];
		if (!neighbor) return;

		const link = move(
			section.children,
			linkIndex,
			neighbor.children,
			delta < 0 ? neighbor.children.length : 0
		);
		focusById(link.id, '[data-handle]');
	}
</script>

{#snippet handle(
	item: Drag,
	label: string,
	onkeydown: (event: KeyboardEvent) => void
)}
	<div
		class="handle"
		role="button"
		tabindex="0"
		draggable="true"
		data-handle
		data-focus-id={item.id}
		title="drag to move, or use the arrow keys"
		aria-label="move {label}"
		ondragstart={event => startDrag(event, item)}
		ondragend={endDrag}
		{onkeydown}
	>
		<DragHandle />
	</div>
{/snippet}

{#snippet dropLine(position: 'top' | 'bottom', offset: string)}
	<span
		class="pointer-events-none absolute inset-x-0 h-0.5 rounded-full bg-accent"
		style:top={position === 'top' ? offset : null}
		style:bottom={position === 'bottom' ? offset : null}
	></span>
{/snippet}

<div
	bind:this={container}
	ondragleave={onContainerDragLeave}
	ondrop={onDrop}
	role="region"
	aria-label="link editor"
>
	<p>
		<Button pressed on:click={ondone}>done</Button>
	</p>

	<div
		class="mt-4 grid gap-4"
		style:grid-template-columns="repeat(auto-fill, minmax(24em, 1fr))"
	>
		{#each linkColumns.value as column, columnIndex (column.id)}
			<div
				class="min-h-24 p-3 flex flex-col gap-6 rounded-lg border-2 border-dashed border-current/15"
				role="list"
				aria-label="column {columnIndex + 1}"
				ondragover={event => onColumnDragOver(event, column)}
			>
				{#each column.sections as section, sectionIndex (section.id)}
					<div
						animate:flip={{ duration: 300 }}
						data-section
						role="listitem"
						class="relative flex flex-col gap-1 transition-opacity"
						class:opacity-50={lifted && drag?.id === section.id}
						ondragover={event => onSectionDragOver(event, section)}
					>
						{#if drop?.kind === 'section' && drop.columnId === column.id}
							{#if drop.index === sectionIndex}
								{@render dropLine('top', '-13px')}
							{:else if drop.index === column.sections.length && sectionIndex === column.sections.length - 1}
								{@render dropLine('bottom', '-13px')}
							{/if}
						{/if}

						<div class="flex items-center gap-1">
							{@render handle(
								{ kind: 'section', id: section.id },
								section.title || 'untitled section',
								event =>
									onSectionHandleKey(
										event,
										columnIndex,
										sectionIndex
									)
							)}

							<input
								class="input flex-1 text-accent"
								style:view-transition-name={linkTransitionName(
									'section',
									section.id
								)}
								style:view-transition-class="link-text"
								type="text"
								placeholder="section title"
								aria-label="section title"
								data-focus-id={section.id}
								bind:value={section.title}
							/>

							<button
								class="delete"
								title="delete section"
								onclick={() =>
									deleteSection(column, sectionIndex)}
							>
								<DeleteIcon />
							</button>
						</div>

						<ul class="flex flex-col gap-1">
							{#each section.children as link, linkIndex (link.id)}
								<li
									class="relative flex items-center gap-1 transition-opacity"
									class:opacity-50={lifted &&
										drag?.id === link.id}
									data-link-row
									animate:flip={{ duration: 300 }}
								>
									{#if drop?.kind === 'link' && drop.sectionId === section.id}
										{#if drop.index === linkIndex}
											{@render dropLine('top', '-3px')}
										{:else if drop.index === section.children.length && linkIndex === section.children.length - 1}
											{@render dropLine('bottom', '-3px')}
										{/if}
									{/if}

									{@render handle(
										{ kind: 'link', id: link.id },
										link.name || 'unnamed link',
										event =>
											onLinkHandleKey(
												event,
												section,
												linkIndex
											)
									)}

									<input
										class="input flex-2"
										style:view-transition-name={linkTransitionName(
											'link',
											link.id
										)}
										style:view-transition-class="link-text"
										type="text"
										placeholder="name"
										aria-label="link name"
										data-focus-id={link.id}
										bind:value={link.name}
									/>

									<input
										class="input flex-3 text-ellipsis"
										type="text"
										placeholder="url"
										aria-label="link url"
										bind:value={link.url}
									/>

									<button
										class="delete"
										title="delete link"
										onclick={() =>
											deleteLink(section, linkIndex)}
									>
										<DeleteIcon />
									</button>
								</li>
							{:else}
								{#if drop?.kind === 'link' && drop.sectionId === section.id}
									<li
										class="h-0.5 rounded-full bg-accent"
										aria-hidden="true"
									></li>
								{/if}
							{/each}
						</ul>

						<p class="ml-7">
							<Button on:click={() => addLink(section)}
								>+ link</Button
							>
						</p>
					</div>
				{:else}
					{#if drop?.kind === 'section' && drop.columnId === column.id}
						<div
							class="h-0.5 rounded-full bg-accent"
							aria-hidden="true"
						></div>
					{/if}
				{/each}

				<p class="mt-auto flex flex-wrap gap-1">
					<Button on:click={() => addSection(column)}
						>+ section</Button
					>
				</p>
			</div>
		{/each}

		{#if canAddColumn}
			<button
				class={[
					'min-h-24 grid place-items-center rounded-lg border-2 border-dashed text-2xl transition',
					drop?.kind === 'new-column'
						? 'border-accent text-accent'
						: 'border-current/15 opacity-50 hover:opacity-100 hover:text-accent focus-visible:opacity-100 focus-visible:text-accent'
				]}
				title="new column"
				aria-label="new column"
				onclick={() => addSection(addColumn())}
				ondragover={onNewColumnDragOver}
				ondragleave={() => (drop = null)}
			>
				<span class="pointer-events-none" aria-hidden="true">+</span>
			</button>
		{/if}
	</div>

	{#if lastDeleted}
		<div
			class="fixed bottom-6 left-1/2 z-10 -translate-x-1/2 max-w-[calc(100vw-2rem)] flex items-center gap-2 px-4 py-2 rounded-xl bg-background border-2 border-current/10 shadow-lg"
			role="status"
		>
			<p class="min-w-0 truncate">Deleted {lastDeleted.name}.</p>

			<Button class="shrink-0" on:click={undoDelete}>undo</Button>
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "../../app.css";

	.input {
		@apply min-w-0 px-2 py-0.5 bg-control border-2 border-current/10 rounded-lg transition-colors;
	}

	.input:focus {
		@apply text-accent;
	}

	.input::placeholder {
		@apply text-body opacity-50;
	}

	.handle,
	.delete {
		@apply size-6 grid place-items-center opacity-50 transition;
	}

	.handle {
		@apply cursor-grab;
	}

	.handle:active {
		@apply cursor-grabbing;
	}

	.handle:hover,
	.handle:focus-visible {
		@apply opacity-100 text-accent;
	}

	.delete:hover,
	.delete:focus-visible {
		@apply opacity-100 text-red-400;
	}
</style>
