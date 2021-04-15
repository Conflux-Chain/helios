module.exports = {
  purge: {
    content: [
      './packages/popup/**/*.html',
      './packages/popup/**/*.js',
      './packages/ui-components/**/*.html',
      './packages/ui-components/**/*.js',
    ],
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
  corePlugins: {
    preflight: false,
  },
}
