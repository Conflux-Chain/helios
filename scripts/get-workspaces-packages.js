/**
 * @fileOverview
 * @name get-workspaces-packages.js
 */

const childProcess = require('child_process')
const path = require('path')

module.exports = function ({ignore = []} = {}) {
  const rst = childProcess.spawnSync('yarn', ['workspaces', 'list', '--json'], {
    cwd: path.resolve(__dirname, '../'),
  })

  const packages = rst.stdout
    .toString()
    .trim()
    .split('\n')
    .reduce((acc, v) => {
      const p = JSON.parse(v)
      if (!ignore.includes(p.name)) acc.push(p)
      return acc
    }, [])

  return packages
}
