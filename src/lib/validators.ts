import { z } from 'zod'

export const braintreeCheckoutReq = z.object({
	emailAddress: z.string().email().refine((val) => val.length > 0, { message: 'Email is required' }),
	firstName: z.string().min(1, { message: 'Field is required' }),
	lastName: z.string().min(1, { message: 'Field is required' }),
	streetLine1: z.string().min(1, { message: 'Field is required' }),
	streetLine2: z.string().optional(),
	city: z.string().min(1, { message: 'Field is required' }),
	province: z.string().min(1, { message: 'Field is required' }),
	country: z.string().min(1, { message: 'Field is required' }),
	countryCode: z.string().min(1, { message: 'Field is required' }),
	postalCode: z.string().min(1, { message: 'Field is required' }),
	phoneNumber: z.string().min(1, { message: 'Field is required' }),
	billingFirstName: z.string().optional(),
	billingLastName: z.string().optional(),
	billingStreetLine1: z.string().optional(),
	billingStreetLine2: z.string().optional(),
	billingCity: z.string().optional(),
	billingProvince: z.string().optional(),
	billingCountry: z.string().optional(),
	billingCountryCode: z.string().optional(),
	billingPostalCode: z.string().optional(),
	billingPhoneNumber: z.string().optional(),
	extra: z.string().optional()
})