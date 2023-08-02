<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	import { clock, discordId, generateId, links, weatherKey } from '../stores';

	import ArrowDown from './icons/ArrowDown.svelte';
	import ArrowUp from './icons/ArrowUp.svelte';
	import Button from './Button.svelte';
	import DeleteIcon from './icons/DeleteIcon.svelte';
	import Password from './Password.svelte';
	import Text from './Text.svelte';

	export let open = true;

	let resetSettingsConfirmation = false;

	$: if (!open) {
		resetSettingsConfirmation = false;
	}

	let importSettings = '';
</script>

{#if open}
	<div
		class="fixed inset-0 z-10 grid place-items-center px-8 py-8 max-h-screen overflow-auto before:fixed before:inset-0 before:-z-10 before:bg-black before:bg-opacity-50"
		on:click|self={() => (open = false)}
		on:keydown={() => {}}
		aria-hidden="true"
		transition:fade={{ duration: 150 }}
	>
		<div
			class="w-full max-w-screen-lg p-8 rounded-lg bg-background flow"
			role="dialog"
		>
			<h2>settings</h2>

			<div>
				<h3>clock</h3>

				<p class="mt-1">
					<Button
						on:click={() => {
							$clock.longMonth = !$clock.longMonth;
						}}
					>
						Month {$clock.longMonth ? 'Name' : 'Number'}
					</Button>

					<Button
						on:click={() => {
							$clock.showDay = !$clock.showDay;
						}}
					>
						Day of Week {$clock.showDay ? 'Shown' : 'Hidden'}
					</Button>

					<Button
						on:click={() => {
							$clock.dayFirst = !$clock.dayFirst;
						}}
					>
						{$clock.dayFirst ? 'Day' : 'Month'} First
					</Button>
				</p>

				<p class="mt-1">
					<Button
						on:click={() => {
							$clock.hour12 = !$clock.hour12;
						}}
					>
						{$clock.hour12 ? 12 : 24} Hour Format
					</Button>

					<Button
						on:click={() => {
							$clock.showTimezone = !$clock.showTimezone;
						}}
					>
						Timezone {$clock.showTimezone ? 'Shown' : 'Hidden'}
					</Button>
				</p>
			</div>

			<div>
				<h3>links</h3>

				{#each $links as { id, title, children }, sectionIndex (id)}
					<div
						animate:flip={{ duration: 300 }}
						class="mt-2 flex flex-col gap-1"
					>
						<div class="flex items-center">
							<h4 class="flex-1">
								<Text placeholder="title" bind:value={title} />
							</h4>

							<div class="flex gap-1">
								<button
									class="hover:text-white transition"
									title="move up"
									on:click={() => {
										if (sectionIndex <= 0) return;
										[
											$links[sectionIndex],
											$links[sectionIndex - 1]
										] = [
											$links[sectionIndex - 1],
											$links[sectionIndex]
										];
									}}
								>
									<ArrowUp />
								</button>
								<button
									class="hover:text-white transition"
									title="move up"
									on:click={() => {
										if (sectionIndex >= $links.length - 1)
											return;
										[
											$links[sectionIndex],
											$links[sectionIndex + 1]
										] = [
											$links[sectionIndex + 1],
											$links[sectionIndex]
										];
									}}
								>
									<ArrowDown />
								</button>
								<button
									class="hover:text-red-400 transition"
									title="delete"
									on:click={() => {
										$links.splice(sectionIndex, 1);
										$links = $links;
									}}
								>
									<DeleteIcon />
								</button>
							</div>
						</div>

						<ul class="pl-4 flex flex-col gap-1">
							{#each children as link, linkIndex (link.id)}
								<li
									class="flex items-center gap-1"
									animate:flip={{ duration: 300 }}
								>
									<div class="flex-1">
										<Text
											placeholder="name"
											bind:value={link.name}
										/>
									</div>

									<div class="flex-[3]">
										<Text
											placeholder="url"
											bind:value={link.url}
										/>
									</div>

									<div class="flex gap-1">
										<button
											class="hover:text-white transition"
											title="move up"
											on:click={() => {
												if (linkIndex <= 0) return;
												[
													children[linkIndex],
													children[linkIndex - 1]
												] = [
													children[linkIndex - 1],
													children[linkIndex]
												];
											}}
										>
											<ArrowUp />
										</button>
										<button
											class="hover:text-white transition"
											title="move up"
											on:click={() => {
												if (
													linkIndex >=
													children.length - 1
												) {
													return;
												}

												[
													children[linkIndex],
													children[linkIndex + 1]
												] = [
													children[linkIndex + 1],
													children[linkIndex]
												];
											}}
										>
											<ArrowDown />
										</button>
										<button
											class="hover:text-red-400 transition"
											title="delete"
											on:click={() => {
												children.splice(linkIndex, 1);
												children = children;
											}}
										>
											<DeleteIcon />
										</button>
									</div>
								</li>
							{/each}
						</ul>

						<p class="ml-4">
							<Button
								on:click={() => {
									children = [
										...children,
										{
											id: generateId(),
											name: '',
											url: ''
										}
									];
								}}
							>
								+ link
							</Button>
						</p>
					</div>
				{/each}

				<p class="mt-2">
					<Button
						on:click={() => {
							$links = [
								...$links,
								{
									id: generateId(),
									title: '',
									children: []
								}
							];
						}}
					>
						+ section
					</Button>
				</p>
			</div>

			<div>
				<h3>weather</h3>

				<p>
					This page uses the OpenWeather API. If you want the weather
					feature, get an API key from the
					<a
						href="https://openweathermap.org/"
						class="underline underline-offset-2 hover:text-white transition-colors"
					>
						OpenWeather website</a
					>. This page only makes a request every 10 minutes, so you
					can generate and use a free key.
				</p>

				<p class="mt-1">
					<Password
						placeholder="weather api key"
						bind:value={$weatherKey}
					/>
				</p>
			</div>

			<div>
				<h3>discord</h3>

				<p>
					For your Discord presence to show up, you need to be in the
					Lanyard Discord server. Learn more at the
					<a
						href="https://github.com/phineas/Lanyard"
						class="underline underline-offset-2 hover:text-white transition-colors"
					>
						Github page</a
					>.
				</p>

				<p class="mt-1">
					<Text
						placeholder="discord user id"
						bind:value={$discordId}
					/>
				</p>
			</div>

			<div>
				<h3>danger</h3>

				<p class="mt-2">
					<Button
						on:click={() => {
							resetSettingsConfirmation = true;
						}}
					>
						reset all settings
					</Button>
				</p>
			</div>

			{#if resetSettingsConfirmation}
				<div>
					<p>Are you sure you want to reset all settings?</p>

					<p class="mt-2">
						<Button
							on:click={() => {
								localStorage.clear();
								location.reload();
							}}
						>
							yes
						</Button>

						<Button
							on:click={() => {
								resetSettingsConfirmation = false;
							}}
						>
							no
						</Button>
					</p>
				</div>
			{/if}

			<div>
				<h3>save and load data</h3>

				<p class="mt-2">
					<Button
						on:click={() => {
							const data = {
								clock: $clock,
								links: $links,
								weatherKey: $weatherKey,
								discordId: $discordId
							};
							navigator.clipboard.writeText(
								btoa(JSON.stringify(data))
							);
						}}>export to clipboard</Button
					>
				</p>

				<form
					on:submit|preventDefault={() => {
						if (!importSettings) return;

						const data = JSON.parse(atob(importSettings));

						$clock = data.clock;
						$links = data.links;
						$weatherKey = data.weatherKey;
						$discordId = data.discordId;
					}}
					class="flex gap-1 mt-1"
				>
					<Text bind:value={importSettings} placeholder="import..." />
					<Button type="submit">submit</Button>
				</form>
			</div>

			<p>Changes are automatically saved.</p>

			<Button on:click={() => (open = false)}>done</Button>
		</div>
	</div>
{/if}
