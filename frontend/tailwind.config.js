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
        // Deep Neutral Foundation
        soc: {
          bg: '#080B10',
          card: '#0D1117',
          panel: '#11161D',
          elevated: '#151B23',
          border: '#202832',
          borderMuted: '#2A3542',
          text: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#64748B',
          // Primary Accents
          blue: '#4F8CFF',
          cyan: '#22D3EE',
          // Severity & Status Accents
          success: '#34D399',
          warning: '#FBBF24',
          high: '#FB923C',
          critical: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'elevated': '0 8px 30px -4px rgba(0, 0, 0, 0.7)',
        'accent-subtle': '0 0 15px -3px rgba(79, 140, 255, 0.15)',
        'critical-subtle': '0 0 15px -3px rgba(244, 63, 94, 0.2)',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
      }
    },
  },
  plugins: [],
}
