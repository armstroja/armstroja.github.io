/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink: '#0a0a0a',
        paper: '#f5f2ed',
        cream: '#ede9e2',
        ash: '#8a8680',
        charcoal: '#2a2825',
      },
    },
  },
  plugins: [],
}
