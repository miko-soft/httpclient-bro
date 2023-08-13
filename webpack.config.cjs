/**
 * Run $ npx webpack --config client/webpack-client.config.js
 * from the project's root folder.
 */
const path = require('path');
const { ESBuildMinifyPlugin } = require('esbuild-loader');

module.exports = {
  mode: 'production',
  stats: { warnings: true },
  entry: {
    'httpclient-bro': './index.js',
    'httpclient-bro.min': './index.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
    clean: true // remove content of the directory defined in the output.path
  },

  devtool: 'source-map',
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        include: /\.min\.js$/, // minify only httpclient-bro.min.js
        keepNames: true, // keep function names https://esbuild.github.io/api/#keep-names
      }),
    ],
  },

  watch: true,
  watchOptions: {
    aggregateTimeout: 200,
    poll: 1000,
    ignored: ['node_modules']
  }
};
