export type PresetThemeName = "default" | "minimal" | "astro" | "game" | "cyberpunk" | "undersea" | "ghibli" | "dufan";

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
  undersea:  { name: "undersea",  label: "Undersea",  cssClass: "theme-undersea", available: true },
  ghibli:    { name: "ghibli",    label: "Ghibli",    cssClass: "theme-ghibli",   available: true },
  dufan:     { name: "dufan",     label: "Dufan",     cssClass: "theme-dufan",    available: true  },
};

export function isPresetTheme(name: string): name is PresetThemeName {
  return name in THEME_REGISTRY;
}
