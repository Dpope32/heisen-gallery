const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = {
  stats: 'normal',
  performance: {
    hints: 'warning',
    maxEntrypointSize: 244000,
    maxAssetSize: 244000
  },
  mode: 'production',
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
    },
    usedExports: true,
  },
  entry: './src/renderer.js',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(jpe?g|png|gif|mp3|svg|mp4)$/i,
        use: {
          loader: 'file-loader',
          options: {
            name(resourcePath) {
              // Remove the src/Images prefix and normalize slashes
              const normalizedPath = resourcePath.replace(/^.*?src[\/\\]Images[\/\\]?/, '').replace(/\\/g, '/');
              
              if (!normalizedPath.includes('/')) {
                // Files in root Images directory
                return `root/[name].[ext]`;
              }
              
              // Files in subdirectories - keep their folder structure
              const [folder, ...rest] = normalizedPath.split('/');
              return `${folder}/[name].[ext]`;
            },
            outputPath: 'media'
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      favicon: './src/assets/favicon.svg'
    }),
    new Dotenv({
      path: './.env', 
      safe: false, 
      systemvars: true, 
      silent: false 
    })
  ]
};
