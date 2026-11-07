<script lang="ts">
	export let value: string;
	export let placeholder: string;
</script>

<input
	class="w-full px-2 py-0.5 bg-control border-2 border-current/10 focus:text-accent focus:outline-hidden transition-colors rounded-lg placeholder:text-body placeholder:opacity-50"
	type="text"
	{placeholder}
	bind:value
	on:input
/>
