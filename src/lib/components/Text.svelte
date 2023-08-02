<script lang="ts">
	export let value: string;
	export let placeholder: string;
</script>

<input
	class="w-full px-2 py-1 bg-black/30 focus:text-white focus:outline-none transition-colors rounded placeholder:text-light/50"
	type="text"
	{placeholder}
	bind:value
/>
