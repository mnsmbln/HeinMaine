/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.js', './src/**/*.jsx'],
  theme: {
    extend: {
      colors: {
        cream:              '#FDF6EC',
        'cream-dark':       '#F0E6D3',
        'cream-darker':     '#E8D5BE',
        terracotta:         '#C5705D',
        'terracotta-light': '#D4907D',
        'terracotta-dark':  '#A85C4A',
        rose:               '#D4A5A5',
        'rose-light':       '#EDD5D5',
        brown:              '#8B6355',
        'brown-light':      '#B8917F',
        'brown-dark':       '#5C3D2E',
        green:              '#8FAF8B',
        'green-light':      '#C4D9C2',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        sans:  ['Lato', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
        'fade-out':   'fade-out 0.3s ease-in forwards',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(197, 112, 93, 0)' },
          '50%':       { boxShadow: '0 0 0 10px rgba(197, 112, 93, 0.12)' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      boxShadow: {
        'warm':    '0 4px 20px rgba(139, 99, 85, 0.12)',
        'warm-lg': '0 8px 32px rgba(139, 99, 85, 0.18)',
      },
    },
  },
  plugins: [],
}
