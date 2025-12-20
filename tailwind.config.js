/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0D0D0D',       // Main background (very dark)
          sidebar: '#0A0A0A',  // Sidebar background
          surface: '#181818',  // Card background
          surfaceLight: '#252525', // Slightly lighter surface
          border: '#2A2A2A',   // Border color
          card: '#1A1A1A',
          hover: '#252525',
          text: '#FFFFFF',
          textSecondary: '#9CA3AF',
          muted: '#4B5563',
        },
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF5F00', // Primary Accent (Screenshot Orange)
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
          orange: '#FF5F00',
          orangeLight: '#FF7F32',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'in': 'animate-in 0.3s ease-out',
      },
      keyframes: {
        'in': {
            '0%': { opacity: 0, transform: 'scale(0.95)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}