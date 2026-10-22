/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0e1713',
          card: '#15221c',
          border: '#243b30',
          forest: '#1E4D2B',
          accent: '#10b981',
          gold: '#f59e0b',
          clay: '#C85A32',
          cream: '#F7F4EB',
          subtle: '#8ca395'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
