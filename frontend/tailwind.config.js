/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        brand: {
          50: '#f2f7f4',
          100: '#e6efe9',
          200: '#c0d9c8',
          300: '#9ac3a7',
          400: '#4d9765',
          500: '#2d6b45',
          600: '#1a4d2e',
          700: '#164028',
          800: '#123322',
          900: '#0d261b',
        },
      },
      fontFamily: {
        'brand': ['Impact', 'Arial Black', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
