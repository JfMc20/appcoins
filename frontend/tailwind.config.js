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
          light: '#60a5fa',
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        background: {
          light: '#ffffff',
          DEFAULT: '#f3f4f6',
          dark: '#1f2937',
        },
        surface: {
          light: '#f9fafb',
          DEFAULT: '#ffffff',
          dark: '#111827',
        },
        text: {
          light: '#f9fafb',
          DEFAULT: '#1f2937',
          dark: '#f9fafb',
        },
      },
    },
  },
  plugins: [],
} 