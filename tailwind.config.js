/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // Zinc-950
        surface: '#18181b', // Zinc-900
        primary: '#0ea5e9', // Sky-500
        primaryDark: '#38bdf8', // Sky-400
        zinc: {
          50: '#fafafa',
          900: '#18181b',
          950: '#09090b',
        },
        electric: {
          cyan: '#7DF9FF',
          violet: '#8B5CF6',
          amber: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
};
