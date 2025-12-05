/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode with class strategy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs du template moderne
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#5B93FF', // Bleu principal du template
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        orange: {
          light: '#FFE5D1',
          DEFAULT: '#FF9F43',
          dark: '#FF8A1F',
        },
        coral: {
          light: '#FFDAD6',
          DEFAULT: '#FF7976',
          dark: '#FF5F5B',
        },
        cyan: {
          light: '#D1F5F2',
          DEFAULT: '#4ECDC4',
          dark: '#3BB5AC',
        },
        background: {
          DEFAULT: '#F8F9FA',
          card: '#FFFFFF',
        },
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'card': '12px',
      },
    },
  },
  plugins: [],
}
