module.exports = {
  module: {
    rules: [
      { test: /\.imba$/, loader: 'imba/loader' },
    ],
  },
  resolve: {
    extensions: [".imba", ".js"]
  },
  entry: ["./src/app.imba"],
  output: {  path: __dirname + '/dist', filename: "app.js" },
  plugins: [],
  node: {
    fs: "empty",
    child_process: "empty",
    tls: "empty",
    net: "empty",
  },
  devServer: {
    historyApiFallback: {
      index: 'index.html'
    },
    proxy: {
      '/f': 'http://localhost:2020'
    }
  }
}
