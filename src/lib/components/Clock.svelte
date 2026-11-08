<script lang="ts">
	import { onDestroy } from 'svelte';

	import { resolveLocale } from '../locales';
	import { clock } from '../stores.svelte';

	const locale = $derived(resolveLocale(clock.value.locale));

	const df = $derived(
		new Intl.DateTimeFormat(locale, {
			month: clock.value.longMonth ? 'long' : '2-digit',
			day: clock.value.longMonth ? 'numeric' : '2-digit',
			year: 'numeric',
			weekday: clock.value.showDay ? 'long' : undefined
		})
	);
	const tf = $derived(
		new Intl.DateTimeFormat(locale, {
			hour: 'numeric',
			hour12: clock.value.hour12,
			minute: 'numeric',
			second: clock.value.hideSeconds ? undefined : 'numeric',
			timeZoneName: clock.value.showTimezone ? 'short' : undefined
		})
	);

	let now = $state(Date.now());

	const id = setInterval(() => {
		now = Date.now();
	}, 1000);

	onDestroy(() => {
		clearInterval(id);
	});
</script>

<div>
	<h2>Now</h2>
	<p>{df.format(now)}</p>
	<p>{tf.format(now)}</p>
</div>
