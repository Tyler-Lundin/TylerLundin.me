import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(15deg)' },
        }
      },
      animation: {
        'wave': 'wave 1.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

export default config 