/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'cogwave-blue': '#08284e',
        'vivid-cyan': '#00aedc',
        // Secondary Colors
        'clarity-white': '#f6f6f5',
        'balance-gray': '#e6e7e8',
      },
      fontFamily: {
        'verdana': ['Verdana Pro', 'Verdana', 'sans-serif'],
        'ubuntu': ['Ubuntu', 'sans-serif'],
      },
    },
  },
  plugins: [],
}