/* -*- mode: js2 -*- */
/**
 * @fileOverview
 * @name copy-none-js-file.js
 * @author yqrashawn <namy.19@gmail.com>
 */

const R = require("ramda");
const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs-extra");
const pwd = path.resolve(__dirname, "../");
const srcDir = path.resolve(pwd, "src/");
const destDir = path.resolve(pwd, "build/");
const log = console.log.bind(console);
const WATCHING =
  process.argv.includes("--watch") || process.argv.includes("-w");

const watcher = chokidar.watch(path.resolve(pwd, "src/**/*"), {
  ignored: [/\.js$/, /.DS_Store$/],
});

const pathToSrcAndDestPath = (p) => {
  const pathRelativeToSrc = path.relative(srcDir, p);
  const destPath = path.resolve(destDir, pathRelativeToSrc);
  return [p, destPath];
};

let COPYING = 0;

const closeWatcher = () => {
  if (!WATCHING) watcher.close();
};

const copy = ([src, dest]) => {
  COPYING += 1;
  fs.copy(src, dest).then(() => {
    COPYING -= 1;
    if (COPYING === 0) closeWatcher();
  });
};

copy([
  path.resolve(
    pwd,
    "node_modules/webextension-polyfill/dist/browser-polyfill.min.js"
  ),
  path.resolve(pwd, "build/browser-polyfill.min.js"),
]);

copy([
  path.resolve(
    pwd,
    "node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map"
  ),
  path.resolve(pwd, "build/browser-polyfill.min.js.map"),
]);

const cp = R.pipe(pathToSrcAndDestPath, copy);

const cpChanged = R.pipe((p) => {
  log(`Changed: ${path.relative(pwd, p)}`);
  return p;
}, cp);

watcher.on("add", cp).on("change", cpChanged);
