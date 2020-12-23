const { config } = require("@swc/core/spack");
const {
  baseConfig,
  updateConfigWith,
  matchNodeEnv,
  setMinify,
} = require("./config/spack.utils.js");

module.exports = config(
  matchNodeEnv({
    development: baseConfig,
    production: updateConfigWith(baseConfig, setMinify(true)),
  })
);
