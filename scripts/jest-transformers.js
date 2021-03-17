require('./setup-dotenv')
// const swcJest = require('@swc/jest')
const {transformSync} = require('@swc/core')

const snowpackImportMetaEnv = code =>
  typeof code === 'string'
    ? code.replaceAll('import.meta.env', 'process.env')
    : code

module.exports = {
  process: (...args) => {
    args[0] = snowpackImportMetaEnv(...args)
    const [src, path, jestConfig] = args
    const [, , transformOptions = {}] =
      (jestConfig.transform || []).find(
        ([, transformerPath]) => transformerPath === __filename,
      ) || []

    if (/\.(t|j)sx?$/.test(path)) {
      return transformSync(src, {
        ...transformOptions,
        filename: path,
        jsc: {
          target: 'es2020',
          loose: false,
          transform: {
            //@ts-ignore
            hidden: {
              jest: true,
            },
          },
        },
        module: {
          type: 'commonjs',
        },
      })
    }
    return src

    // args[0] = swcJest.process(...args)
    // return args[0]
  },
}
