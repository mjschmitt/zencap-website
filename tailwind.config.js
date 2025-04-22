// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with the 'class' strategy
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#d9e2ec',
          200: '#bccddc',
          300: '#8ba8c2',
          400: '#6187ad',
          500: '#3e6792',
          600: '#2c5075',
          700: '#1a3a5f',
          800: '#102a47',
          900: '#091d32',
        },
        teal: {
          50: '#E6F5F0',
          100: '#C6EAE0',
          200: '#A5D1C0',
          300: '#7FB9A2',
          400: '#4C9F84',
          500: '#046B4E',
          600: '#045A42',
          700: '#034B37',
          800: '#023C2C',
          900: '#012E21',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}