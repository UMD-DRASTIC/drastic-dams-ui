module.exports = {
  configureWebpack: {
    devServer: {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  },
  devServer: {
    proxy: {
      '^/ldp': {
        target: 'http://0.0.0.0:9090',
        changeOrigin: true
      },
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
      //'Access-Control-Allow-Headers': '*'
    }
  },
  chainWebpack: (config) => {
    config.module.rule('worker')
      .test(/\.worker\.js$/i)
      .use('worker-loader')
      .loader('worker-loader');
  }
}
