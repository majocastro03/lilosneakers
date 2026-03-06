/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  safelist: [
    'bg-primary-500',
    'bg-primary-600',
    'bg-primary-700',
    'bg-primary-100',
    'text-primary-800',
    'text-white',
    'bg-yellow-100', 'text-yellow-800',
    'bg-purple-100', 'text-purple-800',
    'bg-green-100', 'text-green-800',
    'bg-red-100', 'text-red-800',
    'bg-gray-100', 'text-gray-800',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f2f8f4',
          100: '#ecf6dc',
          200: '#c2e0cd',
          300: '#94c7a8',
          400: '#63aa80',
          500: '#478e66',
          600: '#3a7554',
          700: '#2d5c42',
          800: '#244a36',
          900: '#1f3d2d',
          950: '#0f2219',
        },
        sage: {
          DEFAULT: '#8a9482',
          light: '#ecf6dc',
        },
      },
    },
  },
  plugins: [],
}
