/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4B5563',
          DEFAULT: '#374151',
          dark: '#1F2937',
        },
        background: {
          light: '#F9FAFB',
          DEFAULT: '#F3F4F6',
          dark: '#111827',
        },
        surface: {
          light: '#FFFFFF',
          DEFAULT: '#F9FAFB',
          dark: '#1F2937',
        },
        text: {
          light: '#FFFFFF',
          DEFAULT: '#111827',
          dark: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
} 