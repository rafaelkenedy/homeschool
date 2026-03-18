/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          yellow: '#FFD93D',
          blue: '#4D96FF',
          green: '#6BCB77',
          pink: '#FF6B6B'
        }
      }
    },
  },
  plugins: [],
}
