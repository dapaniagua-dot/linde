import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        linde: {
          blue: '#004E97',
          'blue-dark': '#003875',
          'blue-light': '#E8F0FA',
          orange: '#FF6B00',
          'orange-light': '#FFF3E8',
          gray: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
