const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
	mode: 'development',
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, '../../sites/propel/assets'),
		filename: 'searchspring.bundle.js',
		chunkFilename: 'searchspring.bundle.chunk.[fullhash:8].[id].js',
    },
	target: 'browserslist:modern',
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'@babel/preset-env',
								{
									browserslistEnv: 'modern',
								},
							],
						],
					},
				},
			},
		],
	},
	devtool: 'source-map',
});
