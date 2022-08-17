<script lang="ts">
	import { onDestroy } from "svelte";

	import { clock } from "./stores";

	const df = new Intl.DateTimeFormat("en", {
		month: "long",
		day: "numeric",
		year: "numeric",
		weekday: "long"
	});
	$: tf = new Intl.DateTimeFormat("en", {
		hour: "numeric",
		hour12: $clock.hour12,
		minute: "numeric",
		second: "numeric",
		timeZoneName: $clock.showTimezone ? "short" : undefined
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
