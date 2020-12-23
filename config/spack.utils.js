const R = require("ramda");
const path = require("path");

module.exports = {
  baseConfig: {
    entry: {
      background: path.resolve(__dirname, "../src/background/index.js"),
      inpage: path.resolve(__dirname, "../src/inpage/index.js"),
      popup: path.resolve(__dirname, "../src/popup/index.js"),
    },
    output: {
      path: path.resolve(__dirname, "../build"),
    },
    module: { type: "umd" },
  },
  setMinify: R.curry(R.assocPath(["options", "minify"])),
  setMode: R.curry(R.assoc("mode")),
  updateConfigWith: (...args) => {
    if (args.length < 2)
      throw new Error("At least two arguments, one config and one function");
    const [config, ...funcs] = args;

    return R.apply(R.pipe, funcs)(config);
  },
  matchNodeEnv: (map) => {
    const v = map[process.env.NODE_ENV];
    if (!v)
      throw new Error(
        `Can't find value for env ${process.env.NODE_ENV} in ${map}`
      );
    return v;
  },
};
