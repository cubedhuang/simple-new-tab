import { derived, type Writable } from 'svelte/store';

import { discordId } from './stores';
import type { LanyardData, LanyardResponse } from './types';

function fetchLanyard(discordId: string) {
	return fetch(`https://api.lanyard.rest/v1/users/${discordId}`).then(res =>
		res.json()
	) as Promise<LanyardResponse>;
}

export const lanyard = derived<Writable<string>, LanyardData>(
	discordId,
	($discordId, set) => {
		if (!$discordId) return;

		async function updateStore() {
			const res = await fetchLanyard($discordId);

			if (res.success) {
				set(res.data);
			} else {
				console.error("Couldn't fetch Lanyard data:", res.error);
			}
		}

		updateStore();

		const id = setInterval(updateStore, 5000);

		return () => clearInterval(id);
	}
);
