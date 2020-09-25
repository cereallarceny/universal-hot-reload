import url from 'url';
import webpack from 'webpack';
import webpackDevServer from 'webpack-dev-server';

/**
 * Start webpack dev server for hmr
 */
const watchClientChanges = (clientConfig, callback) => {
  const clonedClientConfig = { ...clientConfig };
  const { entry, plugins, devServer = {} } = clonedClientConfig;

  const { publicPath } = clonedClientConfig.output;
  const { protocol, host, port } = url.parse(publicPath);
  const webpackDevServerUrl = `${protocol}//${host}`;

  const hmrEntries = [
    `${require.resolve('webpack-dev-server/client/')}?${webpackDevServerUrl}`,
    require.resolve('webpack/hot/dev-server'),
  ];
  if (entry.push) {
    clientConfig.entry = entry.concat(hmrEntries); // eslint-disable-line
  } else {
    clientConfig.entry = [entry, ...hmrEntries]; // eslint-disable-line
  }

  const hmrPlugin = new webpack.HotModuleReplacementPlugin();
  if (!plugins) {
    clientConfig.plugins = [hmrPlugin]; // eslint-disable-line
  } else {
    plugins.push(hmrPlugin);
  }

  const compiler = webpack(clientConfig);
  const devServerOptions = {
    quiet: false, // don’t output anything to the console.
    noInfo: false, // suppress boring information
    lazy: false, // no watching, compiles on request
    publicPath,
    stats: 'errors-only',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    hot: true,
    sockPort: port,
    ...devServer, // Add any overrides here
  };

  // When the compiler is done, trigger the callback function
  compiler.hooks.done.tap('watchClientChanges', () => {
    if (callback) callback();
  });

  const server = new webpackDevServer(compiler, devServerOptions);
  server.listen(port, 'localhost', () => {
    console.log(`Starting webpack-dev-server on ${webpackDevServerUrl}`);
  });
};

export default watchClientChanges;
