/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#08090f',
        darkBg2: '#0f1120',
        darkBg3: '#161929',
        brandPurple: {
          light: '#a78bfa',
          DEFAULT: '#7c3aed',
          dark: '#6d28d9',
        },
        brandIndigo: '#4f46e5',
        brandBlue: '#2563eb',
        brandGreen: '#059669',
        brandYellow: '#d97706',
        brandRed: '#dc2626',
        brandOrange: '#ea580c',
        textMain: '#f1f5f9',
        textSecondary: '#94a3b8',
        textMuted: '#475569',
      },
      borderRadius: {
        'radius': '12px',
        'radius-sm': '8px',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7c3aed, #4f46e5)',
        'gradient-surface': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
      },
    },
  },
  plugins: [],
}
