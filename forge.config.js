const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: ['src/Images'],
    icon: './src/favicon.ico',
    name: 'Heisen Gallery'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'HeisenGallery',
        setupIcon: './src/favicon.ico',
        iconUrl: 'file:///' + path.resolve('./src/favicon.ico').replace(/\\/g, '/'),
        loadingGif: './src/favicon.ico'
      },
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: {
          entry: './src/index.js',
          target: 'electron-main',
          resolve: {
            extensions: ['.js', '.jsx', '.json'],
          },
          module: {
            rules: [
              {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-react'],
                  },
                },
              },
            ],
          },
        },
        renderer: {
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
          ],
          config: {
            resolve: {
              extensions: ['.js', '.jsx', '.json'],
            },
            plugins: [
              new HtmlWebpackPlugin({
                template: './src/index.html',
              }),
            ],
            devServer: {
              port: 4000,
              hot: true,
            },
            module: {
              rules: [
                {
                  test: /\.jsx?$/,
                  exclude: /node_modules/,
                  use: {
                    loader: 'babel-loader',
                    options: {
                      presets: ['@babel/preset-react'],
                    },
                  },
                },
                {
                  test: /\.css$/,
                  use: ['style-loader', 'css-loader'],
                },
                {
                  test: /\.(jpe?g|JPE?G|png|PNG|gif|mp4|MP4|svg)$/,
                  use: {
                    loader: 'file-loader',
                    options: {
                      name: '[path][name].[ext]',
                      publicPath: '../..',
                      outputPath: (url, resourcePath, context) => {
                        return `src/${url}`;
                      }
                    }
                  }
                },
              ],
            },
          },
        },
      },
    },
  ],
};
