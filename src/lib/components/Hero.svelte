<script lang="ts">
	import { goto } from '$app/navigation'
</script>
<div class="2xl:mx-auto max-w-screen-2xl px-2 md:px-4 bg-transparent">
	<div class="relative grid grid-cols-1 m-0 w-full">
		<div class="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent via-transparent to-white h-24 w-full"></div>
		<header class="md:absolute px-2">
			<h1 class="text-3xl md:text-5xl lg:text-7xl max-w-[600px] leading-11 mt-6 mb-3 md:my-6">
				The Best Solution for Snoring.
			</h1>
			<p class="max-w-[400px] text-lg mx-1 mt-6">
				SnoreRx is the most advanced and customizable snoring mouthguard, ever. Try SnoreRx for 30 Nights Risk Free, Satisfaction Guaranteed.
			</p>
			<button type="button" onclick={async () => await goto('/anti-snoring-mouthpiece/')} class="inline-block my-4 py-4 px-10 text-lg font-semibold tracking-wide text-white bg-gradient-to-r from-[#95805e] to-[#ceb88f] hover:text-gray-900 rounded-lg transition duration-200">
				Learn More →
			</button>
		</header>
		<picture class="m-0 w-full md:h-84 lg:h-96 object-cover overflow-hidden">
			<source type="image/webp" media="(min-width: 908px)" srcset="/img/sleeping-couple/couple-together-hero.webp 1x">
			<source type="image/webp" media="(max-width: 907px)" srcset="/img/sleeping-couple/couple-together-mobile.webp 1x">
			<source type="image/jpeg" media="(min-width: 908px)" srcset="/img/sleeping-couple/couple-together-hero.jpg 1x">
			<source type="image/jpeg" media="(max-width: 907px)" srcset="/img/sleeping-couple/couple-together-mobile.jpg 1x">
			<img src="/img/sleeping-couple/couple-together-hero.jpg" alt="Sleeping Couple" />
		</picture>
	</div>
</div>