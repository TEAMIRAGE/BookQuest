/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./css/*.{html,js,css}",
    "./views/*.ejs",
  ],
  theme: {
    extend: {
      colors: {
        'customColorBlue': '#48cae4',
        'customColorBlack': '#03001C',
      },
      fontFamily: {
        'sans': ['Poppins', 'sans-serif'],
      },
      screens: {
        'xsm': '360px',
        // => @media (min-width: 640px) { ... }

        'sm': '640px',
        // => @media (min-width: 640px) { ... }

        'md': '768px',
        // => @media (min-width: 768px) { ... }

        'lg': '1024px',
        // => @media (min-width: 1024px) { ... }

        'xl': '1280px',
        // => @media (min-width: 1280px) { ... }

        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }
      }
    }
  },
  plugins: [],
}