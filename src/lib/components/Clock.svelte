<script lang="ts">
	import { onDestroy } from 'svelte';

	import { clock } from '../stores';

	$: locale = $clock.dayFirst ? 'en-GB' : 'en-US';

	$: df = new Intl.DateTimeFormat(locale, {
		month: $clock.longMonth ? 'long' : '2-digit',
		day: $clock.longMonth ? 'numeric' : '2-digit',
		year: 'numeric',
		weekday: $clock.showDay ? 'long' : undefined
	});
	$: tf = new Intl.DateTimeFormat(locale, {
		hour: 'numeric',
		hour12: $clock.hour12,
		minute: 'numeric',
		second: 'numeric',
		timeZoneName: $clock.showTimezone ? 'short' : undefined
	});

	let now = Date.now();

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
