<script lang="ts">
	import Sun from 'lucide-svelte/icons/sun'
	import Moon from 'lucide-svelte/icons/moon'
	import { themeStore, setTheme } from '$lib/stores'
	$: theme = $themeStore.theme
	$: resolvedTheme = $themeStore.resolvedTheme
</script>
{#if (theme === 'dark') || (theme === 'system' && resolvedTheme === 'dark')}
	<button on:click={() => setTheme('light')} class="align-middle items-center grow-on-hover">
		<Sun class="w-9 h-9" />
	</button>
{:else}
	<button on:click={() => setTheme('dark')} class="align-middle items-center grow-on-hover">
		<Moon class="w-9 h-9" />
	</button>
{/if}