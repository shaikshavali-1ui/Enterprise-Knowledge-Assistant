/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        }
      },
      boxShadow: {
        'glow-indigo': '0 0 20px -2px rgba(99, 102, 241, 0.35), 0 8px 20px -4px rgba(0, 0, 0, 0.5)',
        'glow-purple': '0 0 20px -2px rgba(168, 85, 247, 0.35), 0 8px 20px -4px rgba(0, 0, 0, 0.5)',
        'glow-emerald': '0 0 20px -2px rgba(16, 185, 129, 0.35), 0 8px 20px -4px rgba(0, 0, 0, 0.5)',
        'glow-amber': '0 0 20px -2px rgba(245, 158, 11, 0.35), 0 8px 20px -4px rgba(0, 0, 0, 0.5)',
        'glow-rose': '0 0 20px -2px rgba(244, 63, 94, 0.35), 0 8px 20px -4px rgba(0, 0, 0, 0.5)',
        'rich-card': '0 10px 25px -6px rgba(0, 0, 0, 0.6), 0 0 15px -2px rgba(99, 102, 241, 0.12)',
        'rich-hover': '0 15px 35px -10px rgba(0, 0, 0, 0.7), 0 0 20px -2px rgba(99, 102, 241, 0.25)',
      }
    },
  },
  plugins: [],
}
