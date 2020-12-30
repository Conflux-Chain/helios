#!/usr/bin/env node
"use strict";
const { cli } = require("snowpack");
const { setEnvBasedOnArgv } = require("./snowpack.utils");

setEnvBasedOnArgv();

cli(process.argv).catch(function (error) {
  console.error(`
${error.stack || error.message || error}
`);
  process.exit(1);
});
