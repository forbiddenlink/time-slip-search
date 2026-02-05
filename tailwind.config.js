/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'stagger-1', 'stagger-2', 'stagger-3', 'stagger-4',
    'stagger-5', 'stagger-6', 'stagger-7', 'stagger-8',
  ],
  theme: {
    extend: {
      colors: {
        // Retro-Analog palette - Enhanced v2.0
        'crt': {
          black: '#0a0908',
          dark: '#1a1815',
          medium: '#2d2a26',
          light: '#3d3a35',
          lighter: '#4d4a45',
        },
        'phosphor': {
          teal: '#40e0d0',
          'teal-bright': '#5ffff0',
          'teal-dim': '#2ac5b6',
          green: '#39ff14',
          'green-bright': '#4dff28',
          amber: '#ffbf00',
          'amber-bright': '#ffd633',
          'amber-dim': '#d9a000',
        },
        'vhs': {
          red: '#ff3131',
          'red-bright': '#ff5555',
          blue: '#4169e1',
          cream: '#faf5eb',
          tan: '#d4a574',
        },
        'vinyl': {
          black: '#1a1a1a',
          groove: '#2a2a2a',
          label: '#c73e3a',
          'label-bright': '#e74c46',
        },
        'aged': {
          paper: '#f4e4bc',
          cream: '#e8e0d5',
          sepia: '#d4a574',
        },
      },
      fontFamily: {
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'mono': ['VT323', 'Courier New', 'monospace'],
        'body': ['Source Serif 4', 'Georgia', 'serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      animation: {
        'flicker': 'flicker 0.15s infinite',
        'scanline': 'scanline 8s linear infinite',
        'tracking': 'tracking 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'vinyl-spin': 'vinyl-spin 4s linear infinite',
        'static': 'static 0.5s steps(10) infinite',
        'tape-roll': 'tape-roll 2s linear infinite',
        'phosphor-breathe': 'phosphor-breathe 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.97' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        tracking: {
          '0%, 100%': { transform: 'translateX(0) skewX(0deg)' },
          '25%': { transform: 'translateX(-2px) skewX(-0.5deg)' },
          '75%': { transform: 'translateX(2px) skewX(0.5deg)' },
        },
        'glow-pulse': {
          '0%, 100%': {
            textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
            filter: 'brightness(1)',
          },
          '50%': {
            textShadow: '0 0 5px currentColor, 0 0 10px currentColor',
            filter: 'brightness(0.9)',
          },
        },
        'phosphor-breathe': {
          '0%, 100%': {
            filter: 'brightness(1)',
            opacity: '1',
          },
          '50%': {
            filter: 'brightness(1.15)',
            opacity: '0.95',
          },
        },
        'vinyl-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        static: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        'tape-roll': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'crt': '0 0 60px rgba(64, 224, 208, 0.15), inset 0 0 120px rgba(0, 0, 0, 0.5)',
        'crt-deep': '0 0 80px rgba(64, 224, 208, 0.2), inset 0 0 140px rgba(0, 0, 0, 0.7)',
        'glow-teal': '0 0 20px rgba(64, 224, 208, 0.5), 0 0 40px rgba(64, 224, 208, 0.3)',
        'glow-teal-strong': '0 0 30px rgba(64, 224, 208, 0.6), 0 0 60px rgba(64, 224, 208, 0.4)',
        'glow-amber': '0 0 20px rgba(255, 191, 0, 0.5), 0 0 40px rgba(255, 191, 0, 0.3)',
        'glow-green': '0 0 20px rgba(57, 255, 20, 0.5), 0 0 40px rgba(57, 255, 20, 0.3)',
        'inner-screen': 'inset 0 0 100px rgba(0, 0, 0, 0.8)',
        'vhs-case': '4px 4px 0 rgba(0, 0, 0, 0.3), 8px 8px 16px rgba(0, 0, 0, 0.4)',
        'depth-1': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'depth-2': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'depth-3': '0 8px 24px rgba(0, 0, 0, 0.5)',
        'depth-4': '0 12px 32px rgba(0, 0, 0, 0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'in-out': 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
    },
  },
  plugins: [],
}
