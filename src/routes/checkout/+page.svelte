<script lang="ts">
	import { getContextClient } from '@urql/svelte'
	import { setMessage, superForm } from 'sveltekit-superforms'
	import { zod } from 'sveltekit-superforms/adapters'
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import { type FragmentType, useFragment } from '$lib/gql'
	import type { CreateCustomerInput, CreateAddressInput } from '$lib/gql/graphql'
	import { cartStore, userStore } from '$lib/stores'
	import { braintreeCheckoutReq } from '$lib/validators'
	import { 
		ActiveOrder,
		AddOrderCouponCode, 
		AddOrderPayment,
		Address,
		AdjustOrderLine,
		CreateCustomerAddress,
		Customer, 
		GetCustomerAddresses,
		SetOrderCustomer, 
		GetOrderShippingMethods, 
		RemoveOrderCouponCode,
		SetOrderBillingAddress,
		SetOrderShippingAddress, 
		SetOrderShippingMethod, 
		ShippingMethodQuote,
		TransitionOrderToState, 
	} from '$lib/majel'
	import { formatCurrency } from '$lib/utils'
	import Meta from '$lib/components/Meta.svelte'
	import GooglePlacesAutocomplete from '$lib/components/GooglePlacesAutocomplete.svelte'
	import Image from '$lib/components/Image.svelte'
	import { PUBLIC_DEFAULT_CURRENCY, PUBLIC_GOOGLE_PLACES_API_KEY, PUBLIC_SITE_NAME } from '$env/static/public'

	let { data } = $props()
	const authorization: string = data.authorization
	let hostedFieldsInstance: any
	let disabled: boolean = $state(false)
	let paymentEmpty: boolean = true
	let errorMessage: string = ''
	
	let loaded: boolean = $state(false)
	let success: boolean = false

	const client = getContextClient()

	let order = $derived(useFragment(ActiveOrder, $cartStore))
	let lines = $derived(order?.lines || [])
	let customer = $derived(useFragment(Customer, $userStore))
	let shippingOptions: FragmentType<typeof ShippingMethodQuote>[] = $state([])
	let selectedShippingOption: string = $state('')

	let discountFormOpen = false
	const toggleDiscountForm = () => {
		let discountForm = document.getElementById('discount-form') as HTMLElement
		if (discountFormOpen) {
			discountForm.classList.add('hidden')
			discountFormOpen = false
		} else {
			discountForm.classList.remove('hidden')
			discountFormOpen = true
		}
	}

	const adjustOrderLine = async (orderLineId: string, e: Event) => {
		const select = e.target as HTMLSelectElement
		const quantity = parseInt(select.value)
		let result = await client.mutation(AdjustOrderLine, { orderLineId, quantity }).toPromise()
		console.log(result)
	}

	const handlePlaceChanged = async (e: CustomEvent) => {
		console.log(e.detail)
	}

	const setCustomer = async (input: CreateCustomerInput) => {
		let result = await client.mutation(SetOrderCustomer, { input }).toPromise()
		// console.log(result)
	}

	const setShippingAddress = async (input: CreateAddressInput) => {
		let result = await client.mutation(SetOrderShippingAddress, { input }).toPromise()
		// console.log(result)
	}

	const setBillingAddress = async (input: CreateAddressInput) => {
		let result = await client.mutation(SetOrderBillingAddress, { input }).toPromise()
		// console.log(result)
	}

	const getShippingOptions = async () => {
		let result = await client.query(GetOrderShippingMethods, {}).toPromise()
		// console.log(result)
		if (result?.data?.eligibleShippingMethods) shippingOptions = result.data.eligibleShippingMethods
		// check if order already has shipping method set
		if (order?.shippingLines[0]?.shippingMethod?.id) {
			// make sure it's still available
			if (useFragment(ShippingMethodQuote, shippingOptions).map(option => option.id).includes(order.shippingLines[0].shippingMethod.id)) {
				selectedShippingOption = order.shippingLines[0].shippingMethod.id
				return
			}
		}
		await selectCheapestShippingOption()
	}

	const selectCheapestShippingOption = async () => {
		if (shippingOptions) {
			let index = 0
			if (index === useFragment(ShippingMethodQuote, shippingOptions).length) {
				errorMessage = 'There are no shipping options available.'
			} else {
				selectedShippingOption = useFragment(ShippingMethodQuote, shippingOptions)[index].id
				await setShippingOption(selectedShippingOption)
			}
		}
	}

	const setShippingOption = async (id: string) => {
		let result = await client.mutation(SetOrderShippingMethod, { id }).toPromise()
		// console.log(result)
	}

	const setOrderState = async (state: string) => {
		let result = await client.mutation(TransitionOrderToState, { state }).toPromise()
		// console.log(result)
	}

	const form  = superForm(data.form, { 
		SPA: true,
		validators: zod(braintreeCheckoutReq),
		onUpdate: async ({ form, cancel }) => {
			// console.log(form.valid)
			// console.log(form.data)
			// console.log(form.errors)
			if (!form.valid) cancel()
			if (paymentEmpty) {
				errorMessage = "Please enter payment information."
				cancel()
			}
			disabled = true
			try {
				await setCustomer({ emailAddress: form.data.emailAddress, firstName: form.data.firstName, lastName: form.data.lastName })
			} catch (e) { console.log(e) }
			try {
				await setShippingAddress({ 
					streetLine1: form.data.streetLine1, 
					streetLine2: form.data.streetLine2, 
					city: form.data.city, 
					province: form.data.province, 
					countryCode: form.data.countryCode.toUpperCase() || 'US', 
					postalCode: form.data.postalCode, 
					phoneNumber: form.data.phoneNumber 
				})
			} catch (e) { console.log(e) }
			if (form.data.billingStreetLine1 && form.data.billingCity && form.data.billingProvince && form.data.billingCountryCode && form.data.billingPostalCode) {
				try {
					await setBillingAddress({ streetLine1: form.data.billingStreetLine1, streetLine2: form.data.billingStreetLine2, city: form.data.billingCity, province: form.data.billingProvince, countryCode: form.data.billingCountryCode.toUpperCase(), postalCode: form.data.billingPostalCode, phoneNumber: form.data.billingPhoneNumber })
				} catch (e) { console.log(e) }
			}
			try {
				// ensure the method set is what is showing on this page
				// protects against method being changed on another page
				// the final shipping method should be the one on the page submitted
				setShippingOption(selectedShippingOption)
			} catch (e) { console.log(e) }
			try {
				await setOrderState('ArrangingPayment')
			} catch (e) { console.log(e) }
			try {
				const payload = await hostedFieldsInstance!.tokenize()
				console.log(payload)
				let result = await client.mutation(AddOrderPayment, { input: { method: 'braintree', metadata: payload } }).toPromise()
					.then(result => result?.data?.addPaymentToOrder)
				console.log(result)
				switch (result?.__typename) {
					case 'Order':
						// Adding payment succeeded!
						window.location.href = (`/checkout/success/${order?.code}`)
						break;
					case 'OrderStateTransitionError':
					case 'OrderPaymentStateError':
					case 'PaymentDeclinedError':
					case 'PaymentFailedError':
						// Display an error to the customer
						// dropin.clearSelectedPaymentMethod()
					case 'NoActiveOrderError':
						console.log('Active order not found')
				}
			} catch (e) {
				await setOrderState('AddingItems')
				errorMessage = 'Something went wrong when connecting to our payment provider.'
				console.log(e)
			}
			disabled = false			
		}
	})
	const { form: formData, constraints, enhance, errors, message } = form

	onMount(async () => {
		if (browser) {
			await getShippingOptions()
			loaded = true
			if (authorization) {
				let client = await braintree.client.create({ authorization })
				hostedFieldsInstance = await braintree.hostedFields.create({
					client,
					styles: {
						'input': {
							'color': '#555',
							'font-family': 'Manrope, Helvetica, sans-serif',
							'font-size': '18px',
							'height': '48px'
						},
						'input:focus': {
							'color': '#555'
						},
						'input.invalid': {
							'color': '#555'
						}
					},
					fields: {
						number: {
							container: '#card-number',
							placeholder: '•••• •••• •••• ••••'
						},
						expirationDate: {
							container: '#expiration-date',
							placeholder: 'MM/YY'
						},
						cvv: {
							container: '#cvv',
							placeholder: '•••'
						}
					}
				})
			}
		}
	})
</script>
<noscript>
	<p>Please enable javascript to complete checkout.</p>
	<p>We use a third party (<a href="https://braintree.com">Braintree</a>) to process credit card payments for enhanced security.  Making payments on this site using Braintree requires javascript.</p>
</noscript>
<svelte:head>
	<script src="https://js.braintreegateway.com/web/3.103.0/js/client.min.js"></script>
	<script src="https://js.braintreegateway.com/web/3.103.0/js/hosted-fields.min.js"></script>
</svelte:head>
<Meta config={{
	title: "Checkout",
	description: "Checkout page for SnoreRx"
}} />
<div class="bg-[#f1f1f1] h-full w-full min-h-screen">
	{#if loaded && !order?.lines}
		<p>Your cart is empty.</p>
	{:else if loaded && order?.lines && order?.lines.length > 0}
	<div class="mx-auto max-w-screen-2xl md:flex md:justify-between p-4 pt-6">
		<div class="flex">
			<h1 class="sr-only">Checkout</h1>
			<a href="/" class="mx-auto"><img src="/logo.png" class="sm:m-0 h-10 md:h-12 w-auto" alt="{PUBLIC_SITE_NAME}" /></a>
		</div>
		<div class="flex">
			<div class="flex flex-nowrap items-center mx-auto md:ml-auto">
				<div class="bg-white rounded-full p-3 mr-3">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
				</div>
				<span class="text-gray-400 text-sm">SAFE AND SECURE CHECKOUT 128-bit SSL encryption</span>
			</div>
		</div>
	</div>
	<form id="hosted-fields-form" method="POST" use:enhance>
		<div class="p-4 mx-auto max-w-screen-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 sm:gap-x-4">
			<div class="col-span-1 border border-gray-300 bg-[#f9f9f9] rounded-md">
				<GooglePlacesAutocomplete 
					apiKey={PUBLIC_GOOGLE_PLACES_API_KEY} 
					{form} 
					on:placeChanged={async (e) => await handlePlaceChanged(e)} 
				/>
			</div>
			<div class="col-span-1 rounded-md">

				<section id="cart-items" class="bg-white rounded-t-md p-2 border border-gray-300">
					<ul role="list" class="flex-auto">
						{#each lines as line}
						<li class="flex space-x-6 py-6">
							<Image preview={line.featuredAsset?.preview} alt={line.productVariant.name} preset="thumb" class="h-16 w-28 object-fit flex-none rounded-md bg-gray-200 object-center" />
							<div class="flex justify-between w-full space-y-4 my-auto">
								<div class="space-y-1 text-sm font-medium">
									<h3 class="text-gray-900">{line.productVariant.product.name}</h3>
									<select name="quantity" class="text-sm font-medium rounded-lg bg-gray-200 border-gray-300 focus:ring-gray-300 focus:border-none text-black" onchange={async(e) => adjustOrderLine(line.id, e)}>
										<option value="1" selected={1 === line.quantity} class="text-sm text-black">Qty: 1</option>
										<option value="2" selected={2 === line.quantity} class="text-sm text-black">Qty: 2</option>
									</select>
								</div>
								<div class="flex ml-auto space-x-4">
									<p class="text-xl p-2">{formatCurrency(line.linePrice, PUBLIC_DEFAULT_CURRENCY)}</p>
								</div>
							</div>
						</li>
						{/each}
					</ul>
				</section>

				<section id="shipping-method" class="px-4 pt-4 py-6 border-b border-x border-gray-300">
					<!-- <select bind:value={selectedShippingOption} required class="block w-full rounded-md border-gray-300 focus:border-gray-300 text-gray-600 py-3">
						{#each shippingOptions as shippingOption}
						<option value={shippingOption.id}>{shippingOption.name} {formatCurrency(shippingOption.price, PUBLIC_DEFAULT_CURRENCY)}</option>
						{:else}
						No shipping options available
						{/each}
					</select> -->
					<div role="radiogroup">
						<p class="label">Delivery methods</p>
						{#each useFragment(ShippingMethodQuote, shippingOptions) as shippingOption}
						<div class="my-1 ml-1">
							<label class="text-sm text-gray-500">
								<input onchange="{() => setShippingOption(selectedShippingOption)}" type="radio" name="selectedShippingOption" value={shippingOption.id} bind:group={selectedShippingOption} class="h-6 w-6 border-gray-400 text-gray-700 focus:ring-none mr-2" /> {shippingOption.name} {formatCurrency(shippingOption.price, PUBLIC_DEFAULT_CURRENCY)}
							</label>
						</div>
						{:else}
							No shipping options available
						{/each}
					</div>
				</section>

				<section id="discount-code" class="px-3 py-6 bg-white border-b border-x border-gray-300">
					<button type="button" onclick={toggleDiscountForm} class="underline">Have a discount coupon?</button>
					<div id="discount-form" class="hidden py-2">
						<div class="flex space-x-4">
							<input type="text" id="discount-code" name="discount-code" placeholder="Enter code" class="input">
							<button type="submit" class="inline-flex items-center justify-center py-4 px-10 text-lg font-semibold tracking-wide text-white bg-gradient-to-r from-[#c7b598] to-[#dac8a6] hover:text-gray-900 rounded-lg transition duration-200">Redeem</button>
						</div>
					</div>
				</section>

				<section id="order-summary" class="px-3 py-6 bg-white rounded-b-md border-b border-x border-gray-300">
					{#if order}
					<dl class="space-y-6 text-sm font-medium text-gray-500">
						{#if order.discounts.length > 0}
							{#each order.discounts as discount}
								<div class="flex justify-between">
									<dt class="flex">
										Discount:
										<span class="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs tracking-wide text-gray-600">{discount.description}</span>
									</dt>
									<dd class="text-gray-900">{formatCurrency(discount.amountWithTax, PUBLIC_DEFAULT_CURRENCY)}</dd>
								</div>
							{/each}
						{/if}
						<div class="flex justify-between">
							<dt>Subtotal:</dt>
							<dd class="text-gray-900">{formatCurrency(order.subTotal, PUBLIC_DEFAULT_CURRENCY)}</dd>
						</div>
						{#if order.taxSummary.length > 0}
							{#each order.taxSummary as tax}
								{#if tax.taxTotal > 0}
									<div class="flex justify-between">
										<dt>{tax.description}</dt>
										<dd class="text-gray-900">{formatCurrency(tax.taxTotal, PUBLIC_DEFAULT_CURRENCY)}</dd>
									</div>
								{/if}
							{/each}
						{/if}
						{#if order.shippingLines.length > 0}
							{#each order.shippingLines as shippingLine}
								<div class="flex justify-between">
									<dt>{shippingLine.shippingMethod.name}</dt>
									<dd class="text-gray-900">{formatCurrency(shippingLine.priceWithTax, PUBLIC_DEFAULT_CURRENCY)}</dd>
								</div>
							{/each}
						{/if}
					</dl>
					<p class="py-2 my-6 flex items-center justify-between border-t border-gray-200 text-sm font-medium text-gray-900">
						<span class="text-lg">Total</span>
						<span class="text-2xl">{formatCurrency(order.totalWithTax, PUBLIC_DEFAULT_CURRENCY)}</span>
					</p>
					{/if}
				</section>
			</div>

			<div class="col-span-1 hidden md:block lg:hidden"></div>
			<div class="col-span-1">
				<div class="w-full border border-gray-300 rounded-md">
					<div class="flex justify-between bg-white w-full h-14 py-4 px-6 border-b border-gray-300 rounded-t-md">
						<h3 class="text-lg font-medium whitespace-nowrap mr-4">Credit Card</h3>
						<div class="ml-auto">
							<img src="/img/icons/credit-cards.png" class="h-full object-fit" alt="Visa, Master Card, American Express" />
						</div>
					</div>
					<div class="grid grid-cols-2 p-6 pt-0 gap-x-6 gap-y-3 bg-[#f9f9f9] rounded-b-md">
						<div class="col-span-2 mt-3">
							<label for="card-number" class="label">Card Number <span class="text-[#ff0000]">*</span></label> 
							<div class="my-1 p-2 h-14 bg-white border border-gray-300 rounded-md" id="card-number"></div>
						</div>
						<div class="col-span-1">
							<label for="expiration-date" class="label whitespace-nowrap">Expiration Date <span class="text-[#ff0000]">*</span></label> 
							<div class="my-1 p-2 h-12 bg-white border border-gray-300 rounded-md" id="expiration-date"></div>
						</div>
						<div class="col-span-1">
							<label for="cvv" class="label">CVV <span class="text-[#ff0000]">*</span></label> 
							<div class="my-1 p-2 h-12 bg-white border border-gray-300 rounded-md" id="cvv"></div>
						</div>
						<div class="col-span-2" id="checkout-message"></div>
					</div>
				</div>
				<div class="col-span-2 my-6">
					<button type="submit" class="w-full inline-flex items-center justify-center py-4 px-10 text-lg font-semibold tracking-wide text-white bg-gradient-to-r from-[#c7b598] to-[#dac8a6] hover:text-gray-900 rounded-lg transition duration-200" {disabled}>
						Place order
					</button>
				</div>
			</div>
		</div>
	</form>
	{/if}
</div>