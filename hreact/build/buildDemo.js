const rollup = require('rollup');
const path = require('path');
const babelPlugin = require('rollup-plugin-babel');
const moduleResolve = require('rollup-plugin-node-resolve');
const extensions = ['.js', '.ts'];
rollup.watch({
  input: path.resolve(__dirname, '../demo/index.js'),
  plugins: [
    moduleResolve({
      extensions,
    }),
    babelPlugin({
      extensions,
    }),
  ],
  output: [
    {
      file: path.resolve(__dirname, '../dist/demo.js'),
      format: 'esm'
    }
  ]
}).on('event', console.log)

require('fs').watch(path.resolve(__dirname))
