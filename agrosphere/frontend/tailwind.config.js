/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00ff88',
        secondary: '#ffd700',
        accent: '#00b4d8',
        dark: '#0a0f0a',
        'card-bg': 'rgba(255,255,255,0.04)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 30px rgba(0,255,136,0.3)',
        'glow-gold': '0 0 30px rgba(255,215,0,0.3)',
        'glow-cyan': '0 0 30px rgba(0,180,216,0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
