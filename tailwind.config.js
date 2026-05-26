/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.js', './src/**/*.jsx'],
  theme: {
    extend: {
      colors: {
        cream:              '#151E12',  // near-black forest — page background
        'cream-dark':       '#1E2A1A',  // dark forest — cards, forms
        'cream-darker':     '#2A3824',  // deep forest — borders
        terracotta:         '#6DAF56',  // glowing leaf green — buttons, active tab
        'terracotta-light': '#85C96D',  // bright leaf — hover
        'terracotta-dark':  '#518040',  // deep leaf — darker hover
        rose:               '#4E7244',  // muted forest — soft accent
        'rose-light':       '#38542E',  // darker forest — hover
        brown:              '#B8D4A0',  // pale sage — body text
        'brown-light':      '#6E9960',  // medium sage — muted labels
        'brown-dark':       '#DCF0CC',  // near-white sage — headings
        green:              '#78B860',  // bright leaf — badges
        'green-light':      '#243620',  // very dark leaf — badge backgrounds
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(109, 175, 86, 0)' },
          '50%':       { boxShadow: '0 0 0 14px rgba(109, 175, 86, 0.2)' },
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
        'warm':    '0 4px 20px rgba(0, 0, 0, 0.35)',
        'warm-lg': '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
