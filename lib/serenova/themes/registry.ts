export type PresetThemeName = "default" | "minimal" | "astro" | "game" | "cyberpunk";

export interface ThemeConfig {
  name: PresetThemeName;
  label: string;
  cssClass: string;
  available: boolean;
}

export const THEME_REGISTRY: Record<PresetThemeName, ThemeConfig> = {
  default:   { name: "default",   label: "Default",   cssClass: "",               available: true  },
  minimal:   { name: "minimal",   label: "Minimal",   cssClass: "theme-minimal",  available: true  },
  astro:     { name: "astro",     label: "Astro",     cssClass: "theme-astro",    available: true },
  game:      { name: "game",      label: "Game",      cssClass: "theme-game",     available: true },
  cyberpunk: { name: "cyberpunk", label: "Cyberpunk", cssClass: "theme-cyberpunk",available: true },
};

export function isPresetTheme(name: string): name is PresetThemeName {
  return name in THEME_REGISTRY;
}
