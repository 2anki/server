const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  module: {
    rules: [
      { test: /\.imba$/, loader: 'imba/loader' },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
                ident: 'postcss',
                plugins: () => [
                  require('tailwindcss'),
                  require('autoprefixer')
                ]
              }
            }
          ]
        })
      },
    ],
  },
  resolve: {
    extensions: [".imba", ".js", ".css"]
  },
  entry: ["./src/app.imba", "./src/app.css"],
  output: {  path: __dirname + '/dist', filename: "app.js" },
  plugins: [
    new ExtractTextPlugin({
      filename: 'app.css'
    })
  ]
}
