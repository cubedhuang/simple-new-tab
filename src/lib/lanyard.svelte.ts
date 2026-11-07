import { discordId, tweaks } from './stores.svelte';
import type { LanyardData, LanyardResponse } from './types';

function fetchLanyard(discordId: string) {
	return fetch(`https://api.lanyard.rest/v1/users/${discordId}`).then(res =>
		res.json()
	) as Promise<LanyardResponse>;
}

export const lanyard = $state<{ data?: LanyardData; error?: string }>({});

$effect.root(() => {
	$effect(() => {
		// hidden means no polling, not just no widget
		const id = tweaks.value.hideDiscord ? '' : discordId.value;

		lanyard.data = undefined;
		lanyard.error = undefined;

		if (!id) return;

		let stale = false;

		async function update() {
			let res: LanyardResponse;

			try {
				res = await fetchLanyard(id);
			} catch {
				if (!stale) lanyard.error = "Couldn't reach Lanyard.";
				return;
			}

			if (stale) return;

			if (res.success) {
				lanyard.data = res.data;
				lanyard.error = undefined;
			} else {
				lanyard.data = undefined;
				lanyard.error =
					res.error.code === 'user_not_monitored'
						? "Lanyard can't find this user. Check your ID and make sure you're in the Lanyard Discord server."
						: res.error.message;
			}
		}

		update();

		const interval = setInterval(update, 5000);

		return () => {
			stale = true;
			clearInterval(interval);
		};
	});
});
