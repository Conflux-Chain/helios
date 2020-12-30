const path = require("path");
const { promisify } = require("util");
const rimraf = require("rimraf");
const rm = promisify(rimraf);

(async function () {
  await Promise.all([
    rm(path.resolve(__dirname, "../build/**/dev.js")),
    rm(path.resolve(__dirname, "../build/**/*.mustache")),
    rm(path.resolve(__dirname, "../build/background/background.html")),
    rm(path.resolve(__dirname, "../build/inpage/inpage.html")),
  ]).catch((err) => {
    console.log("failed to remove dev file in prod build");
    throw err;
  });
})();
