import { type Writable, writable } from "svelte/store";
import type { FragmentType } from "$lib/gql";
import { ActiveOrder, Customer } from "$lib/majel";

export const cookiesDisabledStore: Writable<boolean> = writable(false);

export const cartStore: Writable<FragmentType<typeof ActiveOrder> | null> =
  writable();

export const userStore: Writable<FragmentType<typeof Customer> | null> =
  writable();

export const ThemeModes = ["dark", "light"] as const;
export const ThemeModesWithSystem = [...ThemeModes, "system"] as const;

export type ThemeModeOption = (typeof ThemeModes)[number];
export type ThemeModeWithSystemOption = (typeof ThemeModesWithSystem)[number];

export interface ThemeStore {
  /** List of all available theme names */
  themes: ThemeModeWithSystemOption[];
  /** Forced theme name for the current page */
  forcedTheme?: ThemeModeWithSystemOption;
  /** Update the theme */
  /** Active theme name */
  theme?: ThemeModeWithSystemOption;
  /** If `enableSystem` is true and the active theme is "system", this returns whether the system preference resolved to "dark" or "light". Otherwise, identical to `theme` */
  resolvedTheme?: ThemeModeOption;
  /** If enableSystem is true, returns the System theme preference ("dark" or "light"), regardless what the active theme is */
  systemTheme?: ThemeModeOption;
}

export const themeStore = writable<ThemeStore>({
  themes: [],
  forcedTheme: undefined,
  theme: undefined,
  resolvedTheme: undefined,
  systemTheme: undefined,
});

export const setTheme = (theme: ThemeModeWithSystemOption): void => {
  themeStore.update((store) => ({ ...store, theme }));
};
