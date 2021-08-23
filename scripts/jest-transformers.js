require('./setup-dotenv')
const {transformSync} = require('@swc/core')
const {mergeDeepObj} = require('@thi.ng/associative')

const hasjsx = src => /React/.test(src) || /\/>/.test(src) || /<\//.test(src)

const jestOpt = {
  // when filename not specified, swc won't read configs from swcrc, which
  // we don't need here for transforming files for jest
  // filename: path.endsWith('packages/spec/src/spec.js') ? undefined : path,
  jsc: {
    externalHelpers: false,
    parser: {
      syntax: 'ecmascript',
      exportNamespaceFrom: true,
      functionBind: true,
      jsx: true,
      dynamicImport: true,
      exportDefaultFrom: true,
      privateMethod: true,
      importMeta: true,
    },
    target: 'es2020',
    loose: false,
    transform: {
      // from @swc/jest https://github.com/swc-project/jest/blob/b0f559401a066d60c53e3f3253da76a69a74a3ce/index.ts#L47
      hidden: {
        jest: true,
      },
    },
  },
}
const jestOptWithReact = {
  jsc: {
    transform: {
      react: {
        runtime: 'automatic',
      },
    },
  },
}

const snowpackImportMetaEnv = code =>
  typeof code === 'string'
    ? code.replaceAll('import.meta.env', 'process.env')
    : code

module.exports = {
  process: (...args) => {
    let [src, path, jestConfig] = args // eslint-disable-line no-unused-vars
    src = snowpackImportMetaEnv(...args)

    if (/require\(("|')crypto("|')\)/.test(src)) {
      src = src.replaceAll('require("crypto")', 'window.nodejsCrypto')
      src = src.replaceAll("require('crypto')", 'window.nodejsCrypto')
    }

    if (/import .* from 'react-use'/.test(src)) {
      src = src.replaceAll("from 'react-use'", "from 'react-use/esm/index.js'")
    }

    const [, , transformOptions = {}] =
      (jestConfig.transform || []).find(
        ([, transformerPath]) => transformerPath === __filename,
      ) || []

    let jopts = mergeDeepObj(transformOptions, jestOpt)
    let compileWithSwc = false

    if (path.includes('node_modules/react-use/')) {
      jopts = mergeDeepObj(jopts, {module: {type: 'commonjs'}})
      compileWithSwc = true
    }

    if (src.includes("import ky from 'ky'")) {
      src = src.replace("import ky from 'ky'", "import ky from 'ky-universal'")
    }

    if (hasjsx(src)) {
      compileWithSwc = true
      jopts = mergeDeepObj(jopts, jestOptWithReact)
    }

    if (compileWithSwc) return transformSync(src, jopts).code
    return src
  },
}
