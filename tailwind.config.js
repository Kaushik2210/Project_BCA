/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-beige': '#F5E6D3', // Approximate from image
        'brand-red': '#C8644C',   // Approximate from image
        'brand-dark': '#3E2F26',  // Dark text/bg
        'brand-light-brown': '#E8D4C1', // Button/lighter beige
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'], // Guessing the font, will add import
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
