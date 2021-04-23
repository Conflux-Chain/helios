module.exports = {
  purge: {
    content: [
      './packages/popup/**/*.html',
      './packages/popup/**/*.js',
      './packages/doc-ui/**/*.html',
      './packages/doc-ui/**/*.js',
      './packages/ui/**/*.html',
      './packages/ui/**/*.js',
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
