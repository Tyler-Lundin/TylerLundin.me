import { billboardThemes } from '@/config/themes/billboard'
import type { BillboardThemeKey } from '@/config/themes/billboard'

// Root theme config for the site. Extend this with additional
// themeable areas (e.g., nav, cards) as needed.
export type ThemeConfig = {
  billboard: {
    themeKey: BillboardThemeKey
  }
}

export const themeConfig: ThemeConfig = {
  billboard: {
    // Change this to switch the billboard theme globally
    themeKey: 'industrial_hazard',
  },
}

export { billboardThemes }

