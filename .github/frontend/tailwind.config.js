/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef1f8',
          100: '#d0d8ed',
          200: '#a1b1db',
          300: '#7289c8',
          400: '#3a5ba8',
          500: '#1e3a6e',
          600: '#193261',
          700: '#142954',
          800: '#0f2047',
          900: '#0a173a',
        },
        gold: {
          50:  '#fdf8ee',
          100: '#f9edcc',
          200: '#f2d68a',
          300: '#ebbe48',
          400: '#d4a017',
          500: '#b88a12',
          600: '#9c740e',
          700: '#7a5b0a',
        },
        navy:  '#1e3a6e',
        cream: '#f8f6f1',
        sabana: {
          blue:  '#1e3a6e',
          gold:  '#d4a017',
          cream: '#f8f6f1',
          white: '#ffffff',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        body:    ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
};