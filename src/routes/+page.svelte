<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { 
		PUBLIC_SITE_NAME, 
		PUBLIC_SITE_URL,
		PUBLIC_SITE_LOGO, 
		PUBLIC_SITE_IMAGE
	} from '$env/static/public'
	import Meta from '$lib/components/Meta.svelte'
	import SchemaOrg from '$lib/components/SchemaOrg.svelte'
	import Image from '$lib/components/Image.svelte'

	const collections = page.data.collections
</script>
<Meta />
<SchemaOrg schema={{
	'@type': "Organization",
	name: PUBLIC_SITE_NAME,
	url: PUBLIC_SITE_URL,
	logo: PUBLIC_SITE_LOGO,
	image: PUBLIC_SITE_IMAGE,
	sameAs: [
		// Add your social media links here
	],
	contactPoint: {
		"@type": "ContactPoint",
		"telephone": "+1-949-555-1234",
		"contactType": "customer service"
	}
}} />
<!-- <Hero /> -->
<div class="2xl:mx-auto max-w-screen-2xl p-2 md:p-4 bg-transparent">
	<div class="relative grid grid-cols-1 m-0 w-full">
		<div class="dark:hidden absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent via-transparent to-white h-24 w-full rounded-md"></div>
		<div class="absolute inset-0 dark:bg-black/30 rounded-md"></div>
		<header class="absolute px-6">
			<h1 class="text-gray-900 text-3xl md:text-5xl lg:text-7xl max-w-[600px] leading-11 mt-6 mb-3 md:my-6">
				The Best Stuff.
			</h1>
			<p class="hidden md:block text-gray-900 max-w-[400px] text-lg mx-1 mt-6">
				We sell the best stuff anywhere.  Everyone loves it.  The best cameras.  The best plants.  The best sofas.  We don't actually ship anything.  This is an example site.  Satisfaction guaranteed.
			</p>
			<button type="button" onclick={async () => await goto(`/collection/${collections[1].slug}`)} class="inline-block my-4 py-4 px-10 text-lg font-semibold whitespace-nowrap tracking-wide text-white bg-gradient-to-r from-lime-800 to-lime-700 hover:text-gray-900 rounded-lg transition duration-200">
				Shop Now →
			</button>
		</header>
		<!-- <picture class="m-0 w-full md:h-84 lg:h-96 object-cover overflow-hidden">
			<img src={collections[0].featuredAsset.preview} alt={collections[0].name} />
		</picture> -->
		<Image preview={collections[1].featuredAsset?.preview} preset="large" alt={collections[1].name} class="m-0 min-h-48 w-auto overflow-hidden rounded-md"/>
	</div>
</div>