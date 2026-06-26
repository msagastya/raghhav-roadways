/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgba(0,255,136,0.05)',
          100: 'rgba(0,255,136,0.1)',
          200: 'rgba(0,255,136,0.2)',
          300: 'rgba(0,255,136,0.4)',
          400: 'rgba(0,255,136,0.6)',
          500: '#00ff88',
          600: 'rgba(0,200,110,1)',
          700: 'rgba(0,160,90,1)',
          800: 'rgba(0,120,60,1)',
          900: 'rgba(0,80,40,1)',
        },
        brand: {
          50: 'rgba(0,212,255,0.05)',
          100: 'rgba(0,212,255,0.1)',
          200: 'rgba(0,212,255,0.2)',
          300: 'rgba(0,212,255,0.4)',
          400: 'rgba(0,212,255,0.6)',
          500: '#00d4ff',
          600: 'rgba(0,180,220,1)',
          700: 'rgba(0,140,180,1)',
          800: 'rgba(0,100,130,1)',
          900: 'rgba(0,60,80,1)',
        },
        slate: {
          850: '#111827',
          900: '#030812',
          950: '#02050A',
        }
      },
      fontFamily: {
        'brand': ['Orbitron', 'sans-serif'],
        'sans': ['Space Grotesk', 'sans-serif'],
        'orbitron': ['Orbitron', 'sans-serif'],
      },
      animation: {
        'float': 'float 15s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'neon-pulse': 'neon-pulse 2s infinite',
        'border-breathe': 'border-breathe 4s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'glow-green': '0 0 15px rgba(0, 255, 136, 0.5)',
        'glow-cyan': '0 0 15px rgba(0, 212, 255, 0.5)',
        '3d': '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
