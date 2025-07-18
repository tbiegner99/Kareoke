const { defineConfig } = require('@rspack/cli');
const { HtmlRspackPlugin, DefinePlugin } = require('@rspack/core');
const ReactRefreshPlugin = require('@rspack/plugin-react-refresh');

const isDev = process.env.NODE_ENV === 'development';

// Load environment variables
const getEnvironmentVariables = () => {
  const env = {};
  // Get all environment variables that start with REACT_APP_
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('REACT_APP_')) {
      env[`process.env.${key}`] = JSON.stringify(process.env[key]);
    }
  });

  // Also add NODE_ENV
  env['process.env.NODE_ENV'] = JSON.stringify(
    process.env.NODE_ENV || 'development'
  );

  return env;
};

module.exports = defineConfig({
  context: __dirname,
  entry: {
    main: './src/index.tsx',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      '@': require('path').resolve(__dirname, 'src'),
      context: require('path').resolve(__dirname, 'src/context'),
      models: require('path').resolve(__dirname, 'src/models'),
      domains: require('path').resolve(__dirname, 'src/domains'),
      ui: require('path').resolve(__dirname, 'src/ui'),
      utils: require('path').resolve(__dirname, 'src/utils'),
      config: require('path').resolve(__dirname, 'src/config'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              sourceMap: true,
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
              env: {
                targets: [
                  'chrome >= 87',
                  'edge >= 88',
                  'firefox >= 78',
                  'safari >= 14',
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.module\.css$/,
        type: 'css/module',
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        type: 'css',
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
        type: 'asset',
        generator: {
          filename: 'assets/images/[name].[contenthash:8][ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[contenthash:8][ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlRspackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      publicPath: '/',
      inject: 'body',
    }),
    new DefinePlugin({
      'process.env.VIDEO_SERVER_URL':
        process.env.VIDEO_SERVER_URL ?? 'http://localhost/',
      'process.env.BASE_URL': process.env.BASE_URL
        ? JSON.stringify(process.env.BASE_URL)
        : JSON.stringify(''),
    }),
    isDev && new ReactRefreshPlugin(),
  ].filter(Boolean),
  optimization: {
    minimizer: [new (require('@rspack/core').SwcJsMinimizerRspackPlugin)()],
  },
  output: {
    path: require('path').resolve(__dirname, 'dist'),
    filename: isDev ? '[name].js' : '[name].[contenthash:8].js',
    chunkFilename: isDev
      ? '[name].chunk.js'
      : '[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/[name].[contenthash:8][ext]',
    clean: true,
  },
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true,
    compress: true,
    proxy: {
      '/kareoke/video': {
        target: process.env.VIDEO_SERVER_URL || 'http://localhost',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: process.env.REACT_APP_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/api': {
        target: process.env.REACT_APP_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  devtool: isDev ? 'cheap-module-source-map' : 'source-map',
});
