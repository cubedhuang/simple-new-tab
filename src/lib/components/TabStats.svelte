<script lang="ts">
	import { dayKey, tabHistory } from '../stores.svelte';

	const now = new Date();

	function total(days: number) {
		const firstDay = dayKey(
			new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() - days + 1
			)
		);

		return Object.entries(tabHistory.value)
			.filter(([day]) => day >= firstDay)
			.reduce((sum, [, count]) => sum + count, 0);
	}

	const periods = [
		{ name: 'today', days: 1 },
		{ name: 'past week', days: 7 },
		{ name: 'past month', days: 30 }
	];

	// having multiple identical numbers looks weird so hide them until they're not equal
	const stats = $derived(
		periods
			.map(({ name, days }) => ({ name, count: total(days) }))
			.filter(
				({ count }, i, all) => i === 0 || count !== all[i - 1].count
			)
	);
</script>

<div>
	<h2>Tabs</h2>
	{#each stats as { name, count }}
		<p>{name} {count.toLocaleString()}</p>
	{/each}
</div>
