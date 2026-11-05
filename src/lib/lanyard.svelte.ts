import { discordId } from './stores.svelte';
import type { LanyardData, LanyardResponse } from './types';

function fetchLanyard(discordId: string) {
	return fetch(`https://api.lanyard.rest/v1/users/${discordId}`).then(res =>
		res.json()
	) as Promise<LanyardResponse>;
}

export const lanyard = $state<{ data?: LanyardData }>({});

$effect.root(() => {
	$effect(() => {
		const id = discordId.value;

		if (!id) return;

		async function update() {
			const res = await fetchLanyard(id);

			if (res.success) {
				lanyard.data = res.data;
			} else {
				console.error("Couldn't fetch Lanyard data:", res.error);
			}
		}

		update();

		const interval = setInterval(update, 5000);

		return () => clearInterval(interval);
	});
});
