/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Neutral, near-white surfaces with a soft, restrained ink accent.
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#fafafa',
          muted: '#f4f4f5',
        },
        border: {
          DEFAULT: '#e7e7ea',
          strong: '#d7d7dc',
        },
        ink: {
          DEFAULT: '#18181b',
          muted: '#6b6b72',
          faint: '#9c9ca3',
        },
        accent: {
          DEFAULT: '#2f5cf6', // single restrained accent — used sparingly
          subtle: '#eef2ff',
          hover: '#2549cc',
        },
        dark: {
          bg: '#111113',
          surface: '#18181b',
          border: '#28282d',
        },
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        pop: '0 8px 24px -4px rgb(0 0 0 / 0.10)',
      },
      borderRadius: {
        lg: '0.625rem',
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.97)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        fadeIn: 'fadeIn 200ms ease-out',
        scaleIn: 'scaleIn 200ms ease-out',
      },
    },
  },
  plugins: [],
};
