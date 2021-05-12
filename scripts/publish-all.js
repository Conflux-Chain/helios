const getWorkspacePackages = require('./get-workspaces-packages.js')
const childProcess = require('child_process')

const pkgs = getWorkspacePackages({noPrivate: true})

;(async () =>
  await Promise.all(
    pkgs.map(pkg => {
      const p = childProcess.spawn('yarn', [
        'workspace',
        pkg.name,
        'npm',
        'publish',
        '--tolerate-republish',
      ])
      p.stdout.on('data', d => console.log(`[INFO] ${pkg.name}: ${d}`))
      p.stderr.on('data', d => console.log(`[ERROR] ${pkg.name}: ${d}`))
      return new Promise(resolve => p.on('close', resolve))
    }),
  ))()
