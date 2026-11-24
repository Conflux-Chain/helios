const {resolve} = require('path')
const esbuild = require('esbuild')
const {isDev} = require('./snowpack.utils.js')
const {render} = require('mustache')
const jsStringEscape = require('js-string-escape')
const fs = require('fs-extra')
const templatePath = resolve(
  __dirname,
  '../packages/content-script/index.js.mustache',
)
const template = fs.readFileSync(templatePath, {encoding: 'utf-8'})
const builtInpagePath = resolve(
  __dirname,
  isDev()
    ? '../packages/browser-extension/inpage.js'
    : '../packages/browser-extension/build/inpage.js',
)

function renderTemplate(content) {
  content = content ?? fs.readFileSync(builtInpagePath, {encoding: 'utf-8'})
  content = '"' + jsStringEscape(content) + '"'
  fs.writeFileSync(
    templatePath.replace('.mustache', ''),
    render(template, {content}),
  )
}

const contentScriptOpts = {
  entryPoints: [resolve(__dirname, '../packages/content-script/index.js')],
  minify: !isDev(),
  bundle: true,
  outfile: resolve(
    __dirname,
    isDev()
      ? '../packages/browser-extension/content-script.js'
      : '../packages/browser-extension/build/content-script.js',
  ),
}

const inpageOpts = {
  entryPoints: [resolve(__dirname, '../packages/inpage/index.js')],
  minify: !isDev(),
  bundle: true,
  outfile: builtInpagePath,
}

module.exports = async () => {
  if (!isDev()) {
    await esbuild.build(inpageOpts)
    renderTemplate()
    return esbuild.build(contentScriptOpts)
  }

  const content = await esbuild.context(contentScriptOpts)
  const inpage = await esbuild.context({
    ...inpageOpts,
    plugins: [
      {
        name: 'update-content-script',
        setup(build) {
          build.onEnd(async result => {
            if (result.errors.length) return
            renderTemplate()
            await content.rebuild()
          })
        },
      },
    ],
  })
  await inpage.rebuild()
  await Promise.all([inpage.watch(), content.watch()])
}

if (require.main === module) {
  module.exports().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}
