/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.js', './src/**/*.jsx'],
  theme: {
    extend: {
      colors: {
        cream:              '#F1F4EC',  // warm sage white — page background
        'cream-dark':       '#E3E9D6',  // light sage — cards, forms
        'cream-darker':     '#C8D5B8',  // medium sage — borders, hover
        terracotta:         '#5B7F4E',  // moss green — buttons, active tab, accents
        'terracotta-light': '#72A063',  // lighter moss — hover
        'terracotta-dark':  '#3F5C35',  // deep forest — darker hover
        rose:               '#93B285',  // dusty leaf green — soft accents
        'rose-light':       '#BDD4B0',  // light leaf — hover states
        brown:              '#4A6340',  // rich forest — body text
        'brown-light':      '#7A9E6E',  // sage — muted labels
        'brown-dark':       '#2C3E27',  // deep forest — headings
        green:              '#82B86E',  // bright leaf — badges, note cards
        'green-light':      '#B8D9A8',  // light leaf — badge backgrounds
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(91, 127, 78, 0)' },
          '50%':       { boxShadow: '0 0 0 10px rgba(91, 127, 78, 0.15)' },
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
