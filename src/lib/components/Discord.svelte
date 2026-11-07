<script lang="ts">
	import { lanyard } from '../lanyard.svelte';
</script>

{#if lanyard.data}
	<div class="flow">
		<div>
			<h2>Discord</h2>

			<p>
				{lanyard.data.discord_user.username}
			</p>
			<p>
				{lanyard.data.discord_status}
			</p>
		</div>

		{#each lanyard.data.activities as activity}
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
{:else if lanyard.error}
	<div>
		<h2>Discord</h2>
		<p>{lanyard.error}</p>
	</div>
{/if}
