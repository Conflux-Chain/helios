const {mergeDeepRight, isEmpty} = require('ramda');
const mustache = require('mustache');
const fs = require('fs-extra');
const path = require('path');

const mergeConfig = mergeDeepRight;

function isDev() {
  return process.argv.includes('dev') || process.env.NODE_ENV === 'development';
}

function isProd() {
  return (
    process.argv.includes('build') || process.env.NODE_ENV === 'production'
  );
}

function setEnvBasedOnArgv() {
  if (isDev()) {
    process.env.NODE_ENV = 'development';
  } else if (isProd()) {
    process.env.NODE_ENV = 'production';
  }
}

function mustacheRender(from, to, params) {
  if (!params || isEmpty(params)) return;
  const t = fs.readFileSync(path.resolve(__dirname, from), {
    encoding: 'utf-8',
  });
  const rst = mustache.render(t, params);
  fs.writeFileSync(path.resolve(__dirname, to), rst);
}

module.exports = {
  mergeConfig,
  setEnvBasedOnArgv,
  isDev,
  isProd,
  mustacheRender,
};
