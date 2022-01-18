/**
 * @fileOverview
 * @name get-workspaces-packages.js
 */

const childProcess = require('child_process')
const path = require('path')
const yarnPath = path.resolve(
  __dirname,
  '..',
  '.yarn',
  'releases',
  'yarn-3.1.0.cjs',
)

module.exports = function ({noPrivate = false, ignore = []} = {}) {
  const rst = childProcess.spawnSync(
    'node',
    [yarnPath, 'workspaces', 'list', '--json'],
    {
      cwd: path.resolve(__dirname, '..'),
    },
  )

  const packages = rst.stdout
    .toString()
    .trim()
    .split('\n')
    .reduce((acc, v) => {
      const p = JSON.parse(v)
      if (ignore.includes(p.name)) return acc
      p.absLocation = path.resolve(process.cwd(), p.location)
      if (noPrivate) {
        const pkg = require(path.resolve(p.absLocation, 'package.json'))
        if (pkg.private) return acc
      }
      acc.push(p)
      return acc
    }, [])

  return packages
}
