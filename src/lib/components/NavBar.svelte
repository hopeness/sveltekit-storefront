<script lang="ts">
	import { type FragmentType, useFragment } from '$lib/gql'
	import { Collection } from '$lib/majel'
	import Cart from '$lib/components/Cart.svelte'
	import Account from '$lib/components/Account.svelte'
	import SearchBox from '$lib/components/SearchBox.svelte'
	import SideBar from '$lib/components/SideBar.svelte'
	import ThemeSwitcher from './ThemeSwitcher.svelte'
	let { collections = [] } = $props()
	// export let collections: FragmentType<typeof Collection>[] = []
</script>
<nav class="2xl:mx-auto max-w-screen-2xl px-2 md:px-4 top-0 z-50">
	<div class="flex flex-grow items-center justify-between mt-3">
		<div class="flex flex-none items-center">
			<a class="inline-block text-3xl font-bold" href="/">
				<img class="block h-11 w-auto md:hidden" src="/logo.png" alt="Company Name">
				<img class="hidden h-14 w-auto md:block" src="/logo.png" alt="Company Name">
			</a>
			<div class="hidden lg:block mr-auto lg:ml-6">
				{#each useFragment(Collection, collections) as collection}
					<a href="/collection/{collection.slug}" class="py-3 px-3 mr-2 font-medium group transition-all duration-200 ease-in-out">
						<span class="py-2 bg-left-bottom bg-gradient-to-r from-lime-600 to-lime-600 bg-[length:0%_1px] bg-no-repeat group-hover:bg-[length:100%_1px] transition-all duration-500 ease-out">
							{collection.name}
						</span>
					</a>
				{:else}
					Error: No collections found
				{/each}
			</div>
		</div>
		<div class="flex flex-grow align-middle items-center justify-between ml-4">
			<SearchBox />
		</div>
		<div class="flex flex-none align-middle items-center justify-end md:ml-2 lg:ml-4">
			<div class="lg:hidden p-2">
				<SideBar {collections} />
			</div>
			<div class="p-2">  
				<ThemeSwitcher />			
			</div>
			<div class="hidden md:block p-2">
				<Account />
			</div>
			<div class="pl-2">
				<Cart />
			</div>
		</div>
	</div>
</nav>