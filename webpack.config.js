// Taken from https://raw.githubusercontent.com/imba/imba.io/v2/webpack.config.js
var path = require('path');

module.exports = [{
	entry: {
		index: "./src/app.imba",
	},
	plugins: [
	],
	resolve: {
		extensions: [".imba",".js",".json"]
	},

	module: {
		rules: [{
			test: /\.imba$/,
			loader: 'imba/loader'
		}]
	},

	devServer: {
		contentBase: path.resolve(__dirname, 'public'),
		compress: true,
		port: 8080,
		// https: false
	},

	output: {
		path: path.resolve(__dirname, 'public'),
		filename: 'app.[name].js'
	},

    node: {
        fs: "empty"
     }
}]