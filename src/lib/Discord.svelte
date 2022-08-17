<script lang="ts">
	import { useLanyard } from "sk-lanyard";

	import { discordId } from "./stores";

	$: lanyard = useLanyard({
		method: "rest",
		id: $discordId
	});
</script>

{#if $lanyard}
	<div class="flow">
		<div>
			<h2>Discord</h2>
			<p>
				{$lanyard.discord_user.username}#{$lanyard.discord_user
					.discriminator}
			</p>
		</div>
		{#each $lanyard.activities as activity}
			<div>
				<h2>{activity.name}</h2>
				{#if activity.state}
					<p>{activity.state}</p>
				{/if}
				{#if activity.details}
					<p>{activity.details}</p>
				{/if}
			</div>
		{/each}
	</div>
{/if}
