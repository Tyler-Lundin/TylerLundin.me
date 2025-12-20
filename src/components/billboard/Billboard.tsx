import { billboardThemes } from '@/config/theme'
import type { BillboardThemeKey } from '@/config/themes/billboard'
import type { CSSProperties, ReactNode } from 'react'

export type BillboardProps = {
  label: ReactNode
  headline: ReactNode
  description?: ReactNode
  themeKey?: BillboardThemeKey
  actions?: ReactNode
  meta?: ReactNode
  right?: ReactNode
  titleClassName?: string
  titleStyle?: CSSProperties
}

export default function Billboard({
  label,
  headline,
  description,
  themeKey = 'neon_arcade',
  actions,
  meta,
  right,
  titleClassName,
  titleStyle,
}: BillboardProps) {
  const t = billboardThemes[themeKey]

  return (
    <header className={['relative', t.panel].join(' ')}>
      <div className={t.overlay} />

      <div className="relative p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="min-w-0">
            <div className={t.label}>{label}</div>

            <h1
              style={titleStyle}
              className={[
                'mt-3 font-black tracking-tight leading-[1.02]',
                'text-3xl sm:text-5xl',
                t.title,
                titleClassName || '',
              ].join(' ')}
            >
              {headline}
            </h1>

            {description && (
              <p className={['mt-3 text-base sm:text-lg max-w-prose', t.desc].join(' ')}>
                {description}
              </p>
            )}

            {(actions || meta) && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                {actions}
                {meta}
              </div>
            )}
          </div>

          {right && (
            <div className="shrink-0 flex justify-start sm:justify-end gap-2">
              {right}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

