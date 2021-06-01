require('./setup-dotenv')
// const swcJest = require('@swc/jest')
// const {transformSync} = require('@swc/core')

const snowpackImportMetaEnv = code =>
  typeof code === 'string'
    ? code.replaceAll('import.meta.env', 'process.env')
    : code

module.exports = {
  process: (...args) => {
    args[0] = snowpackImportMetaEnv(...args)
    let [src /* path, jestConfig */] = args
    if (src.includes("import ky from 'ky'"))
      src = src.replace("import ky from 'ky'", "import ky from 'ky-universal'")
    // const [, , transformOptions = {}] =
    //   (jestConfig.transform || []).find(
    //     ([, transformerPath]) => transformerPath === __filename,
    //   ) || []

    // if (/\.(t|j)sx?$/.test(path)) {
    //   return transformSync(src, {
    //     ...transformOptions,
    //     // when filename not specified, swc won't read configs from swcrc, which
    //     // we don't need here for transforming files for jest
    //     // filename: path.endsWith('packages/spec/src/spec.js') ? undefined : path,
    //     jsc: {
    //       externalHelpers: false,
    //       parser: {},
    //       // target: 'es2020',
    //       loose: false,
    //       transform: {
    //         hidden: {
    //           jest: true,
    //         },
    //       },
    //     },
    //     // module: {
    //     //   type: 'commonjs',
    //     // },
    //   })
    // }
    return src

    // args[0] = swcJest.process(...args)
    // return args[0]
  },
}
