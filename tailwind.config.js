/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        strava: {
          orange: '#FC4C02',
          dark: '#1E1E24',
          gray: '#2C2D35',
        },
      },
    },
  },
  plugins: [],
};
