/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-black': '#000000',
        'brand-dark': '#09090b',
        'brand-dark-lighter': '#18181b',
        'brand-green': '#00ff88',
        'brand-green-dim': '#10b981',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 255, 136, 0.5), 0 0 20px rgba(0, 255, 136, 0.3)',
        'neon-strong': '0 0 15px rgba(0, 255, 136, 0.7), 0 0 30px rgba(0, 255, 136, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)' },
          '50%': { opacity: .8, boxShadow: '0 0 20px rgba(0, 255, 136, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
}

