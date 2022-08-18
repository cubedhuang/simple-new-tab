<script lang="ts">
	import { fade } from "svelte/transition";
	import { cubicOut } from "svelte/easing";

	import Button from "./Button.svelte";

	import { clock } from "./stores";

	export let open = true;
</script>

{#if open}
	<div
		class="fixed inset-0 z-10 grid place-items-center before:fixed before:inset-0 before:-z-10 before:bg-black before:bg-opacity-50"
		on:click={() => (open = false)}
		transition:fade={{ duration: 150, easing: cubicOut }}
	>
		<div
			class="w-full max-w-md m-4 p-4 rounded-lg bg-theme flow"
			on:click|stopPropagation
		>
			<h2>settings</h2>

			<div>
				<h3>clock</h3>

				<Button
					on:click={() =>
						clock.update(clock => ({
							...clock,
							hour12: !clock.hour12
						}))}
				>
					{$clock.hour12 ? 12 : 24} Hour Format
				</Button>

				<Button
					on:click={() =>
						clock.update(clock => ({
							...clock,
							showTimezone: !clock.showTimezone
						}))}
				>
					Timezone {$clock.showTimezone ? "Shown" : "Hidden"}
				</Button>
			</div>

			<Button on:click={() => (open = false)}>close</Button>
		</div>
	</div>
{/if}
