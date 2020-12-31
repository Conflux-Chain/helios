module.exports = {
  extends: ["standard", "prettier"],
  plugins: ["prettier"],
  globals: {
    browser: "readonly",
  },
  rules: {
    "import/no-duplicates": 0,
  },
};
