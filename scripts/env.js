function isDev() {
  return process.argv.includes('dev') || process.env.NODE_ENV === 'development'
}

function isProd() {
  return process.argv.includes('build') || process.env.NODE_ENV === 'production'
}

module.exports = {isDev, isProd}
