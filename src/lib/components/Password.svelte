<script lang="ts">
	export let value: string;
	export let placeholder: string;
</script>

<input
	class="w-full px-2 py-1 bg-control focus:text-accent focus:outline-hidden transition-colors rounded-lg placeholder:text-body placeholder:opacity-50"
	type="password"
	{placeholder}
	bind:value
/>
