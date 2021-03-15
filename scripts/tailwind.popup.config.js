module.exports = {
  purge: {
    content: ['./packages/popup/**/*.html', './packages/popup/**/*.js'],
    options: {
      keyframes: true,
    },
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
