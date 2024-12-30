<script lang="ts">
	import * as gmapsLoader from '@googlemaps/js-api-loader'
	const { Loader } = gmapsLoader
	import { createEventDispatcher, onMount } from 'svelte'
	import { browser } from '$app/environment'
	import InputText from '$lib/components/InputText.svelte'
	import InputCountrySelect from '$lib/components/InputCountrySelect.svelte'

	interface Props {
		apiKey: string
		form: any
		singleInput?: boolean
		viewValue?: string|undefined
		fields?: string[]
		types?: string[]
		options?: {}
	}

	let {
		apiKey,
		form,
		singleInput = false,
		viewValue = $bindable(undefined),
		fields = [ 'geometry', 'formatted_address', 'address_components' ],
		types = [ 'address' ],
		options = {}
	}: Props = $props()

	let searchBox: HTMLInputElement|undefined = $state()
	let autocomplete: google.maps.places.Autocomplete
	let currentPlace: google.maps.places.PlaceResult|null
	let billingSearchBox: HTMLInputElement|undefined = $state()
	let billingAutocomplete: google.maps.places.Autocomplete
	let billingCurrentPlace: google.maps.places.PlaceResult|null
	let showDetail: boolean = $state(true)
	let showBillingDetail: boolean = $state(false)
	let disabled: boolean = $state(true)
	let loader: any
	
	let hideBilling: boolean = $state(true)
	$effect(() => { if (hideBilling === false) showBilling() })

	const { form: formData, errors, constraints } = form
	const dispatch = createEventDispatcher()

	export function clear () {
		viewValue = undefined
		currentPlace = null
		billingCurrentPlace = null
		dispatch('clear')
	}

	function blur () {
		dispatch('blur')
		if (viewValue !== (currentPlace && currentPlace.formatted_address)) {
			clear()
		}
	}

	function dropdownVisible () {
		// @ts-ignore
    	return document.querySelectorAll('.pac-container')[0].offsetParent !== null
  	}

	function autocompleteKeydown (e: any) {
		if (e.keyCode === 13 && dropdownVisible()) {
			e.preventDefault()
		}
	}

	const showBilling = () => {
		if (!billingAutocomplete) {
			disabled = true
			// @ts-ignore
			loader.importLibrary('places').then((places) => {
				billingAutocomplete = new places.Autocomplete(billingSearchBox, Object.assign({ fields, types }, options))
				billingAutocomplete.addListener('place_changed', () => {
					const place = billingAutocomplete.getPlace()
					if (place.geometry) {
						billingCurrentPlace = place
						$formData.billingStreetLine1 = place.address_components?.find((c: any) => c.types.includes('street_number'))?.long_name || ''
						$formData.billingStreetLine1 += ' ' + place.address_components?.find((c: any) => c.types.includes('route'))?.long_name || ''
						$formData.billingStreetLine2 = place.address_components?.find((c: any) => c.types.includes('subpremise'))?.long_name || ''
						$formData.billingCity = place.address_components?.find((c: any) => c.types.includes('locality'))?.long_name || ''
						$formData.billingProvince = place.address_components?.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name || ''
						$formData.billingCountry = place.address_components?.find((c: any) => c.types.includes('country'))?.long_name || ''
						$formData.billingCountryCode = place.address_components?.find((c: any) => c.types.includes('country'))?.short_name.toLowerCase() || ''
						$formData.billingPostalCode = place.address_components?.find((c: any) => c.types.includes('postal_code'))?.long_name || ''
						showBillingDetail = true
						dispatch('placeChanged', { place, type: 'billing', selectedPrediction: billingSearchBox?.value })
					}
				})
				disabled = false
			})
		}
	}

	onMount(() => {
		if (browser) {
			loader = new Loader({
				apiKey,
				version: "weekly",
				libraries: ["places"]
			})
			// @ts-ignore
			loader.importLibrary('places').then((places) => {
				if (singleInput) {
					autocomplete = new places.Autocomplete(searchBox, Object.assign({ fields, types }, options))
					autocomplete.addListener('place_changed', () => {
						const place = autocomplete.getPlace()
						if (place.geometry) {
							currentPlace = place
							viewValue = place.formatted_address
							dispatch('placeChanged', { place, type: 'shipping', selectedPrediction: searchBox?.value })
						}
					})
					disabled = false
					return
				}
				autocomplete = new places.Autocomplete(searchBox, Object.assign({ fields, types }, options))
				autocomplete.addListener('place_changed', () => {
					const place = autocomplete.getPlace()
					if (place.geometry) {
						currentPlace = place
						$formData.streetLine1 = place.address_components?.find((c: any) => c.types.includes('street_number'))?.long_name || ''
						$formData.streetLine1 += ' ' + place.address_components?.find((c: any) => c.types.includes('route'))?.long_name || ''
						$formData.streetLine2 = place.address_components?.find((c: any) => c.types.includes('subpremise'))?.long_name || ''
						$formData.city = place.address_components?.find((c: any) => c.types.includes('locality'))?.long_name || ''
						$formData.province = place.address_components?.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name || ''
						$formData.country = place.address_components?.find((c: any) => c.types.includes('country'))?.long_name || ''
						$formData.countryCode = place.address_components?.find((c: any) => c.types.includes('country'))?.short_name.toLowerCase() || ''
						$formData.postalCode = place.address_components?.find((c: any) => c.types.includes('postal_code'))?.long_name || ''
						showDetail = true
						dispatch('placeChanged', { place, type: 'shipping', selectedPrediction: searchBox?.value })
					}
				})
				disabled = false
			})
		}
	})
</script>

{#if singleInput}
	<input id="google-places-autocomplete" aria-label="location" data-text-input="gpac" placeholder="Location" bind:this={searchBox} type="text" {disabled} bind:value={viewValue} onblur={blur} onkeydown={autocompleteKeydown} />
{:else}
	<!-- Shipping Address -->
	<div class="rounded-lg p-6">
		<h3 class="text-lg font-medium text-gray-900">Shipping Address</h3>
		<div class="pb-6">
			<div class="grid grid-cols-2 gap-x-2">
				<div class="col-span-2 md:col-span-1">
					<InputText {form} field="firstName" label="First name" placeholder="Your first name" dataAttribute="gpac"/>
				</div>
				<div class="col-span-2 md:col-span-1">
					<InputText {form} field="lastName" label="Last name" placeholder="Your last name" dataAttribute="gpac"/>
				</div>
				<div class="col-span-2">				
					<label for="streetLine1" class="label">Address</label>
					<input 
						bind:this={searchBox}
						onblur={blur} 
						onkeydown={autocompleteKeydown}
						bind:value={$formData.streetLine1} 
						id="streetLine1"
						name="streetLine1"
						placeholder="Address" 
						type="text"
						aria-describedby={$errors.streetLine1 ? "streetLine1-error" : undefined}
						aria-invalid={$errors.streetLine1 ? "true" : undefined}
						aria-required={$constraints.streetLine1?.required ? "true" : undefined}
						data-input="gpac" 
						class="input"
					/>
					<span id="streetLine1-error" aria-live="assertive">
						{#if $errors.streetLine1?.length}
							{#each $errors.streetLine1 as err}
								<span class="text-red-600">{err}</span>
							{/each}
						{/if}
					</span>
				</div>
				{#if showDetail}
					<div class="col-span-2 md:col-span-2">
						<InputText {form} field="streetLine2" label="Apt/Suite" placeholder="Apartment or suite" dataAttribute="gpac"/>
					</div>
					<div class="col-span-2 md:col-span-1">
						<InputText {form} field="city" label="City" placeholder="City" dataAttribute="gpac"/>
					</div>
					<div class="col-span-2 md:col-span-1">
						<InputText {form} field="province" label="State" placeholder="State or province" dataAttribute="gpac"/>
					</div>
					<div class="col-span-2 md:col-span-1">
						 <InputCountrySelect {form} field="countryCode" label="Country" dataAttribute="gpac"/>
					</div>
					<div class="col-span-2 md:col-span-1">
						<InputText {form} field="postalCode" label="Zip code" placeholder="Zip code" dataAttribute="gpac"/>
					</div>
					<div class="col-span-2 md:col-span-2">
						<InputText {form} field="phoneNumber" label="Phone number" placeholder="Phone number" dataAttribute="gpac"/>
					</div>
					<div class="col-span-2 md:col-span-2">
						<InputText {form} field="emailAddress" label="Email address" placeholder="Email address" dataAttribute="gpac"/>
					</div>
				{/if}
			</div>
		</div>
		{#if hideBilling === false}
		<!-- Billing Address -->
			<h3 class="mt-6 text-lg font-medium">Billing Address</h3>
			<div class="grid grid-cols-2 gap-x-2 pb-6">
				<div class="col-span-2 md:col-span-1">
					<InputText {form} field="billingFirstName" label="First name" placeholder="First name" dataAttribute="gpac"/>
				</div>
				<div class="col-span-2 md:col-span-1">
					<InputText {form} field="billingLastName" label="Last name" placeholder="Last name" dataAttribute="gpac"/>
				</div>
				<div class="col-span-2">
					<label for="billingStreetLine1" class="label">Address</label>
					<input 
						bind:this={billingSearchBox}
						onblur={blur} 
						onkeydown={autocompleteKeydown}
						bind:value={$formData.billingStreetLine1} 
						id="billingStreetLine1"
						name="billingStreetLine1"
						placeholder="Address" 
						type="text"
						aria-describedby={$errors.billingStreetLine1 ? "billingStreetLine1-error" : undefined}
						aria-invalid={$errors.billingStreetLine1 ? "true" : undefined}
						aria-required={$constraints.billingStreetLine1?.required ? "true" : undefined}
						data-text-input="gpac"
						class="input"
					/>
					<span id="billingStreetLine1-error" aria-live="assertive">
						{#if $errors.billingStreetLine1?.length}
							{#each $errors.billingStreetLine1 as err}
								<span class="text-red-600">{err}</span>
							{/each}
						{/if}
					</span>
				</div>
				{#if showBillingDetail}
					<div class="col-span-2 md:col-span-2">
						<InputText {form} field="billingStreetLine2" label="Apt/Suite" placeholder="Apartment or Suite" dataAttribute="gpac"/>
					</div>
					<div class="col-span-2 md:col-span-1">
						<InputText {form} field="billingCity" label="City" placeholder="City" dataAttribute="gpac"/>
					</div>
					<div class="col-span-2 md:col-span-1">
						<InputText {form} field="billingProvince" label="State" placeholder="State or province" dataAttribute="gpac"/>
					</div>
					<div class="col-span-2 md:col-span-1">
						<InputCountrySelect {form} field="billingCountryCode" label="Country" dataAttribute="gpac"/>
					</div>
					<div class="col-span-2 md:col-span-1">
						<InputText {form} field="billingPostalCode" label="Zip code" placeholder="Zip code" dataAttribute="gpac"/>
					</div>
					<div class="col-span-2 md:col-span-2">
						<InputText {form} field="billingPhoneNumber" label="Phone number" placeholder="Phone number" dataAttribute="gpac"/>
					</div>
				{/if}
			</div>
		{/if}
		<!-- Checkbox -->
		<div class="flex items-center py-4">
			<input type="checkbox" name="hideBilling" id=hideBilling bind:checked={hideBilling} data-checkbox-input="gpac" class="rounded-sm text-gray-700 p-2 mr-2 focus:border-gray-400 focus:bg-gray-200"/>
			<label for="hideBilling" data-label="gpac"> Billing address is the same as shipping</label>
		</div>
	</div>
{/if}