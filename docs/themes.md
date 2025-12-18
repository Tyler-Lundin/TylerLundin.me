Site Theme Configuration

- Root theme config: `src/config/theme/index.ts`
- Billboard theme definitions: `src/config/themes/billboard.ts`

Change the site-wide billboard theme by editing:

```
// src/config/theme/index.ts
export const themeConfig = {
  billboard: { themeKey: 'neon_arcade' },
}
```

Available keys:
`'neon_arcade' | 'noir_poster' | 'industrial_hazard' | 'holo_glass' | 'crt_terminal' | 'desert_highway'`

The Contact page reads from this config and applies the selected billboard theme.

