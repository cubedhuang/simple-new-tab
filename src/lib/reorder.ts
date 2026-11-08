export function move(
	from: { id: string }[],
	fromIndex: number,
	to: { id: string }[],
	toIndex: number
) {
	const [item] = from.splice(fromIndex, 1);
	to.splice(toIndex, 0, item);
	return item;
}

export function startDrag(event: DragEvent, rowSelector: string) {
	const dt = event.dataTransfer;
	if (!dt) return false;

	// firefox won't start a drag without data
	dt.setData('text/plain', '');
	dt.effectAllowed = 'move';

	const row = (event.currentTarget as HTMLElement).closest(rowSelector);
	if (row) {
		const rect = row.getBoundingClientRect();
		dt.setDragImage(
			row,
			event.clientX - rect.left,
			event.clientY - rect.top
		);
	}
	return true;
}

export function dropIndex(
	event: DragEvent,
	rowSelector: string,
	items: { id: string }[],
	draggedId: string | undefined
) {
	event.preventDefault();
	event.dataTransfer!.dropEffect = 'move';

	const rows = [
		...(event.currentTarget as HTMLElement).querySelectorAll(rowSelector)
	];
	// the first row whose midpoint is below the pointer
	let index = rows.findIndex(row => {
		const { top, height } = row.getBoundingClientRect();
		return event.clientY < top + height / 2;
	});
	if (index === -1) index = rows.length;

	const from = items.findIndex(({ id }) => id === draggedId);
	return from !== -1 && (index === from || index === from + 1) ? null : index;
}
