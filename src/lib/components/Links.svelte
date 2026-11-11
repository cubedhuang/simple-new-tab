<script lang="ts">
	import { tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import {
		generateId,
		linkColumns,
		linkTransitionName,
		tweaks,
		type Section,
		type TodoItem,
		type TodoSection
	} from '../stores.svelte';
	import * as reorder from '../reorder';
	import Checkbox from './Checkbox.svelte';

	// typing in the add row creates the todo right away and keeps typing in it
	let adding: string | null = null;

	function addTodo(event: Event, section: TodoSection) {
		const input = event.currentTarget as HTMLInputElement;
		if ((event as InputEvent).isComposing || !input.value.trim()) return;

		const id = generateId();
		section.children.push({ id, text: input.value, done: false });
		input.value = '';
		editing = adding = id;
	}

	// editing

	let editing = $state<string | null>(null);

	async function finishEditing(
		section: TodoSection,
		item: TodoItem,
		next = false
	) {
		// enter and the blur from unmounting can both finish it
		if (editing !== item.id) return;
		editing = null;
		const returning = next && adding === item.id;
		adding = null;

		// the text wraps like html, so line breaks and runs of spaces don't show anyway
		item.text = item.text.replace(/\s+/g, ' ').trim();
		// clearing the text deletes it
		if (!item.text) {
			section.children = section.children.filter(
				({ id }) => id !== item.id
			);
		}

		if (returning) {
			await tick();
			document
				.querySelector<HTMLElement>(`[data-add-todo="${section.id}"]`)
				?.focus();
		}
	}

	// reordering

	let dragging = $state<string | null>(null);
	/** the gap the dragged todo would land in */
	let drop = $state<{ sectionId: string; index: number } | null>(null);

	function todoSections() {
		return linkColumns.value
			.flatMap(column => column.sections)
			.filter(section => section.kind === 'todo');
	}

	function startTodoDrag(event: DragEvent, id: string) {
		if (!reorder.startDrag(event, 'li')) return;
		// a frame later so the drag image isn't dimmed
		requestAnimationFrame(() => (dragging = id));
	}

	function endTodoDrag() {
		dragging = null;
		drop = null;
	}

	function onTodoDragOver(event: DragEvent, section: Section) {
		if (!dragging || section.kind !== 'todo') return;
		const index = reorder.dropIndex(
			event,
			':scope > [data-todo-row]',
			section.children,
			dragging
		);
		drop = index === null ? null : { sectionId: section.id, index };
	}

	function moveTodo(id: string, target: TodoSection, index: number) {
		const source = todoSections().find(section =>
			section.children.some(item => item.id === id)
		);
		if (!source) return;

		const from = source.children.findIndex(item => item.id === id);
		const shifted = source === target && from < index;
		reorder.move(
			source.children,
			from,
			target.children,
			shifted ? index - 1 : index
		);
	}

	function onTodoDrop(event: DragEvent, section: Section) {
		if (section.kind !== 'todo') return;
		event.preventDefault();
		if (dragging && drop?.sectionId === section.id) {
			moveTodo(dragging, section, drop.index);
		}
		endTodoDrag();
	}

	async function onTodoKey(
		event: KeyboardEvent,
		section: TodoSection,
		index: number
	) {
		const item = section.children[index];

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			editing = item.id;
			return;
		}

		const delta =
			event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
		if (!delta) return;
		event.preventDefault();

		const target = index + delta;
		if (target >= 0 && target < section.children.length) {
			moveTodo(item.id, section, delta > 0 ? target + 1 : target);
		} else {
			// past the end of a section, into the next todo section
			const sections = todoSections();
			const neighbor = sections[sections.indexOf(section) + delta];
			if (!neighbor) return;
			moveTodo(
				item.id,
				neighbor,
				delta < 0 ? neighbor.children.length : 0
			);
		}

		await tick();
		document
			.querySelector<HTMLElement>(`[data-todo-text="${item.id}"]`)
			?.focus();
	}

	// clearing can be undone until the section changes again

	let cleared = $state.raw<{
		sectionId: string;
		removed: { index: number; item: TodoItem }[];
		after: string;
	} | null>(null);

	function canUndoClear(section: TodoSection) {
		return (
			cleared?.sectionId === section.id &&
			JSON.stringify(section.children) === cleared.after
		);
	}

	function clearDone(section: TodoSection) {
		const removed = $state
			.snapshot(section.children)
			.map((item, index) => ({ index, item }))
			.filter(({ item }) => item.done);

		section.children = section.children.filter(item => !item.done);
		cleared = {
			sectionId: section.id,
			removed,
			after: JSON.stringify(section.children)
		};
	}

	function undoClear(section: TodoSection) {
		// ascending, so each index is where it was before clearing
		for (const { index, item } of cleared?.removed ?? []) {
			section.children.splice(index, 0, item);
		}
		cleared = null;
	}

	// todos have checkboxes instead
	const itemClass = $derived(
		tweaks.value.bulletPoints
			? 'ml-6 list-disc'
			: "flex before:content-['-_'] before:whitespace-pre"
	);

	function normalize(url: string) {
		const trimmed = url.trim();
		const hasScheme = /^[a-z][a-z0-9+.-]*:(?!\d)/i.test(trimmed);
		if (!trimmed || hasScheme) return trimmed;
		return `https://${trimmed.replace(/^\/\//, '')}`;
	}
</script>

{#snippet dropLine(position: 'top' | 'bottom')}
	<span
		class="pointer-events-none absolute inset-x-0 h-0.5 rounded-full bg-accent"
		class:-top-px={position === 'top'}
		class:-bottom-px={position === 'bottom'}
	></span>
{/snippet}

<div class="flex flex-wrap gap-x-8 gap-y-6">
	{#each linkColumns.value as column (column.id)}
		{#if column.sections.length > 0}
			<div class="min-w-48 max-w-80 flex flex-col gap-6">
				{#each column.sections as section (section.id)}
					<ul
						ondragover={event => onTodoDragOver(event, section)}
						ondrop={event => onTodoDrop(event, section)}
					>
						<li class="flex items-baseline gap-2">
							<h2
								class="link-transition"
								style:--link-transition={linkTransitionName(
									'section',
									section.id
								)}
							>
								{section.title}
							</h2>

							{#if section.kind === 'todo'}
								{@const undoable = canUndoClear(section)}
								{#if undoable || section.children.some(item => item.done)}
									<button
										class="ml-[1ch] opacity-50 hover:opacity-100 hover:text-accent focus-visible:opacity-100 focus-visible:text-accent transition"
										onclick={() =>
											undoable
												? undoClear(section)
												: clearDone(section)}
									>
										{undoable ? 'undo' : 'clear'}
									</button>
								{/if}
							{/if}
						</li>

						{#if section.kind === 'todo'}
							{#each section.children as item, index (item.id)}
								<li
									class="relative flex items-start gap-2 transition-opacity"
									class:opacity-50={dragging === item.id}
									animate:flip={{ duration: 300 }}
									data-todo-row
								>
									{#if drop?.sectionId === section.id}
										{#if drop.index === index}
											{@render dropLine('top')}
										{:else if drop.index === index + 1 && index === section.children.length - 1}
											{@render dropLine('bottom')}
										{/if}
									{/if}

									<Checkbox
										class="mt-[calc((1lh-1.25rem)/2)]"
										aria-label="done"
										transitionName={linkTransitionName(
											'checkbox',
											item.id
										)}
										bind:checked={item.done}
									/>

									<!-- text stays underneath while editing so the row keeps its size -->
									<div
										class="link-transition grid flex-1 min-w-0"
										style:--link-transition={linkTransitionName(
											'todo',
											item.id
										)}
									>
										<div
											class="col-start-1 row-start-1 wrap-break-word cursor-pointer hover:text-accent transition"
											class:line-through={item.done}
											class:opacity-50={item.done}
											class:invisible={editing ===
												item.id}
											class:whitespace-pre-wrap={editing ===
												item.id}
											role="button"
											tabindex="0"
											draggable="true"
											data-todo-text={item.id}
											aria-label="edit {item.text ||
												'empty todo'}"
											onclick={() => (editing = item.id)}
											onkeydown={event =>
												onTodoKey(
													event,
													section,
													index
												)}
											ondragstart={event =>
												startTodoDrag(event, item.id)}
											ondragend={endTodoDrag}
										>
											{#if item.text}
												{item.text}
											{:else}
												<span class="opacity-50"
													>todo</span
												>
											{/if}
										</div>

										{#if editing === item.id}
											<textarea
												class="col-start-1 row-start-1 size-full resize-none overflow-hidden whitespace-pre-wrap wrap-break-word bg-transparent text-accent focus:outline-none placeholder:text-accent placeholder:opacity-50"
												rows="1"
												placeholder="todo"
												aria-label="todo"
												spellcheck="false"
												bind:value={item.text}
												{@attach textarea => {
													textarea.focus();
													const end =
														textarea.value.length;
													textarea.setSelectionRange(
														end,
														end
													);
												}}
												onblur={() =>
													finishEditing(
														section,
														item
													)}
												onkeydown={event => {
													if (
														event.key === 'Enter' ||
														event.key === 'Escape'
													) {
														event.preventDefault();
														finishEditing(
															section,
															item,
															event.key ===
																'Enter'
														);
													}
												}}></textarea>
										{/if}
									</div>
								</li>
							{/each}

							<li
								class="group relative flex items-baseline gap-2"
							>
								{#if drop?.sectionId === section.id && section.children.length === 0}
									{@render dropLine('top')}
								{/if}

								<span
									class="block size-5 shrink-0 text-center opacity-50 transition group-focus-within:opacity-100 group-focus-within:text-accent"
								>
									+
								</span>

								<input
									class="min-w-0 w-full flex-1 bg-transparent placeholder:text-body placeholder:opacity-50 focus:outline-none focus:text-accent focus:placeholder:text-accent"
									type="text"
									placeholder="add..."
									spellcheck="false"
									aria-label="add to {section.title ||
										'todo list'}"
									data-add-todo={section.id}
									oninput={event => addTodo(event, section)}
									oncompositionend={event =>
										addTodo(event, section)}
								/>
							</li>
						{:else}
							{#each section.children as { id, name, url } (id)}
								<li class={itemClass}>
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
						{/if}
					</ul>
				{/each}
			</div>
		{/if}
	{/each}
</div>
