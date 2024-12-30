import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs))
}

export const clickOutside = (node: HTMLElement) => {
   const handleClick = (event: MouseEvent) => {
      if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
         node.dispatchEvent(
            new CustomEvent('clickOutside')
         )
      }
   }
   document.addEventListener('click', handleClick, true)
   return {
      destroy() {
         document.removeEventListener('click', handleClick, true)
      }
   }
}

export const formatCurrency = function(value: number, currencyCode: string, locale?: string) {
	// See Vendure docs for more info:
	// https://docs.vendure.io/guides/core-concepts/money/#displaying-monetary-values
	const majorUnits = value / 100
	try {
		// If no `locale` is provided, the browser's default locale will be used.
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: currencyCode,
			currencyDisplay: 'symbol'
		}).format(majorUnits)
	} catch (e: any) {
		// A fallback in case the NumberFormat fails for any reason
		return majorUnits.toFixed(2)
	}
}

export const jsonldReviews = function(reviews: { author: string, review: string, starRating: number, datetime: string }[]) {
	let jsonldReviews: any[] = []
	for (let i = 0; i < reviews.length; i++) {
		jsonldReviews.push({
			'@type': 'Review',
			author: {
				'@type': 'Person',
				name: reviews[i].author
			},
			datePublished: reviews[i].datetime,
			reviewBody: reviews[i].review,
			// itemReviewed: {
			// 	'@type': 'Product',
			// 	'name': 'SnoreRx'
			// },
			reviewRating: {
				'@type': 'Rating',
				bestRating: 5,
				worstRating: 1,
				ratingValue: reviews[i].starRating
			}
		})
	}
	return jsonldReviews
}