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
  titleClassName,
  titleStyle,
}: BillboardProps) {
  const t = billboardThemes[themeKey]

  return (
    <header className={['relative max-w-5xl h-80 grid items-center mx-auto', t.panel].join(' ')}>
      {/* Reactive particles background, clipped by panel, tinted by overlay */}

      <div className="relative z-20 p-3 sm:p-7">
        <div className="grid px-1 sm:px-2 md:px-4 lg:px-8">
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
              <p className={['mt-3 text-[12px] sm:text-lg max-w-prose', t.desc].join(' ')}>
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

        </div>
      </div>
    </header>
  )
}
