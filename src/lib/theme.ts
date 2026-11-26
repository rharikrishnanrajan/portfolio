import type { SiteThemeJson, ThemeMode, ThemePalette } from '../types/content'
import { safeRgbString } from './color'

export const THEME_STORAGE_KEY = 'portfolio:theme'

export const DEFAULT_DARK_PALETTE: ThemePalette = {
  bg: '6 9 18',
  surface: '14 19 33',
  border: '30 38 58',
  text: '255 255 255',
  muted: '148 163 184',
  accent: '79 126 255',
  accent2: '199 210 254',
}

export const DEFAULT_LIGHT_PALETTE: ThemePalette = {
  bg: '248 250 252',
  surface: '255 255 255',
  border: '226 232 240',
  text: '15 23 42',
  muted: '71 85 105',
  accent: '37 99 235',
  accent2: '79 70 229',
}

const PALETTE_KEYS: readonly (keyof ThemePalette)[] = [
  'bg',
  'surface',
  'border',
  'text',
  'muted',
  'accent',
  'accent2',
]

export const DEFAULT_HEADING_FONT = 'Inter Variable'
export const DEFAULT_MONO_FONT = 'JetBrains Mono Variable'

interface FontSpec {
  cssFamily: string
  loader?: () => Promise<unknown>
}

const HEADING_ALIASES: Record<string, string> = {
  Inter: 'Inter Variable',
}

const MONO_ALIASES: Record<string, string> = {
  'JetBrains Mono': 'JetBrains Mono Variable',
}

const HEADING_FONT_MAP: Record<string, FontSpec> = {
  'Inter Variable': {
    cssFamily: '"Inter Variable", system-ui, -apple-system, sans-serif',
    loader: () => import('@fontsource-variable/inter'),
  },
  Georgia: {
    cssFamily: 'Georgia, Cambria, "Times New Roman", serif',
  },
  Merriweather: {
    cssFamily: '"Merriweather Variable", Georgia, serif',
    loader: () => import('@fontsource-variable/merriweather'),
  },
  'Playfair Display': {
    cssFamily: '"Playfair Display Variable", Georgia, serif',
    loader: () => import('@fontsource-variable/playfair-display'),
  },
  Raleway: {
    cssFamily: '"Raleway Variable", system-ui, sans-serif',
    loader: () => import('@fontsource-variable/raleway'),
  },
  Nunito: {
    cssFamily: '"Nunito Variable", system-ui, sans-serif',
    loader: () => import('@fontsource-variable/nunito'),
  },
}

const MONO_FONT_MAP: Record<string, FontSpec> = {
  'JetBrains Mono Variable': {
    cssFamily: '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace',
    loader: () => import('@fontsource-variable/jetbrains-mono'),
  },
  'Fira Code': {
    cssFamily: '"Fira Code Variable", ui-monospace, SFMono-Regular, Menlo, monospace',
    loader: () => import('@fontsource-variable/fira-code'),
  },
  'Source Code Pro': {
    cssFamily: '"Source Code Pro Variable", ui-monospace, SFMono-Regular, Menlo, monospace',
    loader: () => import('@fontsource-variable/source-code-pro'),
  },
  'IBM Plex Mono': {
    cssFamily: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    loader: () =>
      Promise.all([
        import('@fontsource/ibm-plex-mono/latin-400.css'),
        import('@fontsource/ibm-plex-mono/latin-500.css'),
        import('@fontsource/ibm-plex-mono/latin-600.css'),
        import('@fontsource/ibm-plex-mono/latin-700.css'),
      ]),
  },
  'Courier New': {
    cssFamily: '"Courier New", Courier, monospace',
  },
}

const loadedFonts = new Set<string>()

export function resolveHeadingFontName(name: unknown): string {
  if (typeof name !== 'string') return DEFAULT_HEADING_FONT
  const canonical = HEADING_ALIASES[name] ?? name
  return Object.hasOwn(HEADING_FONT_MAP, canonical) ? canonical : DEFAULT_HEADING_FONT
}

export function resolveMonoFontName(name: unknown): string {
  if (typeof name !== 'string') return DEFAULT_MONO_FONT
  const canonical = MONO_ALIASES[name] ?? name
  return Object.hasOwn(MONO_FONT_MAP, canonical) ? canonical : DEFAULT_MONO_FONT
}

export function getHeadingFontCss(name: unknown): string {
  const canonical = resolveHeadingFontName(name)
  return HEADING_FONT_MAP[canonical].cssFamily
}

export function getMonoFontCss(name: unknown): string {
  const canonical = resolveMonoFontName(name)
  return MONO_FONT_MAP[canonical].cssFamily
}

export async function loadThemeFont(kind: 'heading' | 'mono', name: unknown): Promise<void> {
  const canonical = kind === 'heading' ? resolveHeadingFontName(name) : resolveMonoFontName(name)
  const spec = kind === 'heading' ? HEADING_FONT_MAP[canonical] : MONO_FONT_MAP[canonical]
  const cacheKey = `${kind}:${canonical}`
  if (!spec.loader || loadedFonts.has(cacheKey)) return
  loadedFonts.add(cacheKey)
  try {
    await spec.loader()
  } catch {
    loadedFonts.delete(cacheKey)
  }
}

export function validatePalette(
  raw: Partial<ThemePalette> | undefined,
  defaults: ThemePalette,
): ThemePalette {
  const out = { ...defaults }
  if (!raw || typeof raw !== 'object') return out
  for (const key of PALETTE_KEYS) {
    out[key] = safeRgbString(raw[key], defaults[key])
  }
  return out
}

export function readStoredThemeMode(): ThemeMode | null {
  try {
    const val = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (val === 'light' || val === 'dark') return val
    return null
  } catch {
    return null
  }
}

export function writeStoredThemeMode(mode: ThemeMode): void {
  try {
    if (mode !== 'light' && mode !== 'dark') return
    window.localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    // Ignore storage quota or private browsing failures
  }
}

export function resolveThemeMode(theme?: SiteThemeJson): ThemeMode {
  const stored = readStoredThemeMode()
  if (stored) return stored
  return theme?.default_mode === 'light' ? 'light' : 'dark'
}

/**
 * Validates and applies palette tokens, color-scheme, and font families directly via
 * document.documentElement.style.setProperty (never building CSS strings from DB data).
 */
export function applyTheme(theme: SiteThemeJson | undefined, modeOverride?: ThemeMode): ThemeMode {
  const mode: ThemeMode =
    modeOverride === 'light' || modeOverride === 'dark'
      ? modeOverride
      : resolveThemeMode(theme)

  const defaults = mode === 'light' ? DEFAULT_LIGHT_PALETTE : DEFAULT_DARK_PALETTE
  const rawPalette = mode === 'light' ? theme?.light : theme?.dark
  const palette = validatePalette(rawPalette, defaults)

  const root = document.documentElement
  root.setAttribute('data-theme', mode)
  root.style.setProperty('color-scheme', mode)

  for (const key of PALETTE_KEYS) {
    root.style.setProperty(`--${key}`, palette[key])
  }

  const headingName = resolveHeadingFontName(theme?.fonts?.heading)
  const monoName = resolveMonoFontName(theme?.fonts?.mono)
  root.style.setProperty('--theme-font-heading', HEADING_FONT_MAP[headingName].cssFamily)
  root.style.setProperty('--theme-font-mono', MONO_FONT_MAP[monoName].cssFamily)

  void loadThemeFont('heading', headingName)
  void loadThemeFont('mono', monoName)

  return mode
}
