<script lang="ts">
	import '$src/app.css'
	import { queryStore, setContextClient } from '@urql/svelte'
	import { onMount } from 'svelte'
	import { page } from '$app/state'
	import { browser } from '$app/environment'
	import { GetActiveOrder, GetCustomer } from '$lib/majel'
	import { cartStore, userStore, themeStore } from '$lib/stores'
	import { Toaster } from 'svelte-sonner'
	import Theme from '$lib/components/Theme.svelte'
	import NavBar from '$lib/components/NavBar.svelte'
	import Footer from '$lib/components/Footer.svelte'

	let { data, children } = $props()
	const collections = data.collections
	const client = data.client
	setContextClient(client)
	const cartQuery = queryStore({ 
		client, 
		query: GetActiveOrder, 
		pause: true, 
		requestPolicy: 'network-only', 
		context: { additionalTypenames: ['ActiveOrder'] } 
	})
	const userQuery = queryStore({ 
		client, 
		query: GetCustomer, 
		pause: true, 
		requestPolicy: 'network-only', 
		context: { additionalTypenames: ['ActiveCustomer'] } 
	})
	$effect(() => { if ($cartQuery.data?.activeOrder) cartStore.set($cartQuery.data.activeOrder) })
	$effect(() => { if ($userQuery.data?.activeCustomer) userStore.set($userQuery.data.activeCustomer) })

	// useful for debugging
	// $inspect() will be removed automatically in production build
	$inspect($cartStore)
	$inspect($userStore)

	const nakedPaths = ['/checkout', '/sitemap.xml']
	let naked = $derived(nakedPaths.includes(page.url.pathname))

	onMount(async () => {
		if (browser) {
			cartQuery.resume()
			userQuery.resume()
		}
	})
</script>
{#if naked}
	{@render children?.()}
{:else}
	<Theme />
	<Toaster theme={$themeStore.theme || 'light'} position="top-center" />
	<NavBar {collections} />
	<div class="relative">{@render children?.()}</div>
	<Footer />
{/if}