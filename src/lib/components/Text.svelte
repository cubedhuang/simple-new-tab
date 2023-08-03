<script lang="ts">
	export let value: string;
	export let placeholder: string;
</script>

<input
	class="w-full px-2 py-1 bg-black/30 focus:text-accent focus:outline-none transition-colors rounded-lg placeholder:text-body placeholder:opacity-50"
	type="text"
	{placeholder}
	bind:value
	on:input
/>
