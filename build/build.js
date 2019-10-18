/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const rollup = require('rollup')
const path = require('path')
const resolvePlugin = require('rollup-plugin-node-resolve')
const babelPlugin = require('rollup-plugin-babel')

const resolve = (p = '') => path.resolve(__dirname, '..', p)
const extensions = ['.ts', '.js']
rollup.rollup({
  input: resolve('./src/index.ts'),
  plugins: [
    resolvePlugin({
      jsnext: true,
      extensions
    }),
    babelPlugin({ extensions })
  ]

}).then(bundle => {
  bundle.write({
    dir: resolve('./dist'),
    name: 'index.js',
    format: 'esm',
    sourcemap: true
  })
}, console.warn)
