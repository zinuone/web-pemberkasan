/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Ini yang bikin CSS-nya nyambung ke React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}