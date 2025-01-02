<script lang="ts">
	//
	// Most of this is from svelte-themes (https://github.com/beynar/svelte-themes) by @beynar
	//
	import { browser } from '$app/environment'
	import { themeStore, setTheme, ThemeModesWithSystem, ThemeModes, type ThemeModeOption, type ThemeModeWithSystemOption } from '$lib/stores'
	import ThemeScript from '$lib/components/ThemeScript.svelte'

	/** Forced theme name for the current page */
	export let forcedTheme: ThemeModeWithSystemOption | undefined = undefined;
	/** Disable all CSS transitions when switching themes */
	export let disableTransitionOnChange = false;
	/** Whether to switch between dark and light themes based on prefers-color-scheme */
	export let enableSystem: boolean = true;
	/** Whether to indicate to browsers which color scheme is used (dark or light) for built-in UI like inputs and buttons */
	export let enableColorScheme: boolean = true;
	/** Key used to store theme setting in localStorage */
	export let storageKey: string = 'theme';
	/** List of all available theme names */
	export let themes = enableSystem ? ThemeModesWithSystem : ThemeModes;
	/** Default theme name (for v0.0.12 and lower the default was light). If `enableSystem` is false, the default theme is light */
	export let defaultTheme: ThemeModeWithSystemOption = enableSystem ? 'system' : 'light';
	/** HTML attribute modified based on the active theme. Accepts `class` and `data-*` (meaning any data attribute, `data-mode`, `data-color`, etc.) */
	export let attribute: string | 'class' = 'class';
	/** Mapping of theme name to HTML attribute value. Object where key is the theme name and value is the attribute value */
	export let value: { [themeName: string]: string }|undefined = undefined

	const colorSchemes = ThemeModesWithSystem
	const MEDIA = '(prefers-color-scheme: dark)'

	const getTheme = (key: string, fallback?: ThemeModeWithSystemOption): ThemeModeWithSystemOption | undefined => {
		if (typeof window === 'undefined') return undefined
		let theme: ThemeModeWithSystemOption | undefined;
		try {
			const storedTheme = localStorage.getItem(key) || undefined
			theme = ThemeModesWithSystem.find((theme) => theme === storedTheme)
		} catch (e) {}
		return theme || fallback
	}

	const disableAnimation = () => {
		const css = document.createElement('style')
		css.appendChild(
			document.createTextNode(
				`*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
			)
		)
		document.head.appendChild(css)
		return () => {
			// Force restyle
			(() => window.getComputedStyle(document.body))()
			// Wait for next tick before removing
			setTimeout(() => {
				document.head.removeChild(css)
			}, 1)
		}
	}

	const getSystemTheme = (e?: MediaQueryList): ThemeModeOption => {
		if (!e) e = window.matchMedia(MEDIA)
		const isDark = e.matches
		const systemTheme = isDark ? 'dark' : 'light'
		return systemTheme
	}

	const initialTheme = getTheme(storageKey, defaultTheme)

	themeStore.set({
		theme: initialTheme,
		forcedTheme,
		resolvedTheme: initialTheme === 'system' ? ThemeModes.find((theme) => theme === getTheme(storageKey)) : initialTheme,
		themes: [...themes],
		systemTheme: (enableSystem ? getTheme(storageKey) : undefined) as 'light' | 'dark' | undefined
	})

	$: theme = $themeStore.theme
	$: resolvedTheme = $themeStore.resolvedTheme

	const attrs = !value ? themes : Object.values(value)

	const handleMediaQuery = (e?: any) => {
		const systemTheme = getSystemTheme(e)
		$themeStore.resolvedTheme = systemTheme
		if (theme === 'system' && !forcedTheme) changeTheme(systemTheme, false)
	}

	const changeTheme = (theme: string, updateStorage = true, updateDOM = true) => {
		let name = value?.[theme] || theme
		const enable = disableTransitionOnChange && updateDOM ? disableAnimation() : null
		if (updateStorage) {
			try { localStorage.setItem(storageKey, theme) } catch (e) {}
		}
		if (theme === 'system' && enableSystem) {
			const resolved = getSystemTheme()
			name = value?.[resolved] || resolved
		}
		if (updateDOM && browser) {
			const d = document.documentElement
			if (attribute === 'class') {
				d.classList.remove(...(attrs as string[]))
				d.classList.add(name)
			} else {
				d.setAttribute(attribute, name)
			}
			enable?.()
		}
	}

	const mediaHandler = (...args: any) => handleMediaQuery(...args)

	const storageHandler = (e: StorageEvent) => {
		if (e.key !== storageKey) return
		// If default theme set, use it if localstorage === null (happens on local storage manual deletion)
		const newTheme = ThemeModesWithSystem.find((theme) => theme === e.newValue);
		setTheme(newTheme || defaultTheme)
	}

	const onWindow = (window: Window) => {
		// Always listen to System preference
		const media = window.matchMedia(MEDIA)
		// Intentionally use deprecated listener methods to support iOS & old browsers
		media.addListener(mediaHandler)
		mediaHandler(media)
		// localStorage event handling
		window.addEventListener('storage', storageHandler)
		return {
			destroy() {
				window.removeEventListener('storage', storageHandler)
				media.removeListener(mediaHandler)
			}
		};
	};

	// color-scheme handling
	$: if (enableColorScheme && browser) {
		// color-scheme tells browser how to render built-in elements like forms, scrollbars, etc.
		let colorScheme
		if (forcedTheme && colorSchemes.includes(forcedTheme)) colorScheme = forcedTheme
		else if (theme && colorSchemes.includes(theme)) colorScheme = theme
		else if (theme === 'system') colorScheme = resolvedTheme || null
		else colorScheme = null
		// if color-scheme is null, this will remove the property
		document.documentElement.style.setProperty('color-scheme', colorScheme)
	}

	$: {
		if (forcedTheme) changeTheme(forcedTheme, true, false)
		else if (theme) changeTheme(theme)
	}
</script>

<ThemeScript {forcedTheme} {storageKey} {attribute} {enableSystem} {defaultTheme} {value} {attrs} />

<svelte:window use:onWindow />