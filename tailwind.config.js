const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false,
  theme: {
    extend: {
      spacing: {
        '112': '30rem',
        '128': '36rem',
        '192': '48rem',
        '1/6': '16.7%',
      },
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      gray: colors.warmGray,
      yellow: colors.amber,
      green: colors.green,
      blue: colors.cyan,
      purple: colors.fuchsia,
      red: colors.rose,
    },
  },
};
