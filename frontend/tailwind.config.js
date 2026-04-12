/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: '#1B4332',
        green: {
          DEFAULT: '#27AE60',
          light: '#2ECC71',
          dark: '#1E8449',
        },
        gold: '#E67E22',
        amber: '#F39C12',
        slate: '#5D6D7E',
        ivory: '#F8F9F4',
        mint: '#A8D5BA',
        foam: '#EBF5EE',
        mist: '#BDC3C7',
      },
      fontFamily: {
        serif: ['Lora', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}