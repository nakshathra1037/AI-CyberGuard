/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#07090e',
          900: '#0c111d',
          850: '#111827',
          800: '#1a2234',
          700: '#26334d',
          600: '#3b4d71',
          accent: '#06b6d4',
          glow: '#38bdf8',
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          purple: '#8b5cf6',
        }
      }
    },
  },
  plugins: [],
}
