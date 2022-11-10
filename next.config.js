const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const { i18n } = require('./next-i18next.config')
const withAntdLess = require('next-plugin-antd-less')
const withPlugins = require('next-compose-plugins')

const isProd = process.env.NODE_ENV === 'production'

const plugins = [
  withAntdLess({
    lessVarsFilePath: './styles/antd.less',
    javascriptEnabled: true,
  }),
]

module.exports = withPlugins([plugins], {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config, options) {
    config.plugins.push(new MomentLocalesPlugin())

    /* remove pixi warn */
    config.module.rules.push({
      test: '/.[js|ts]/',
      use: [
        {
          loader: 'webpack-preprocessor-loader',
          options: {
            debug: false,
          },
        },
      ],
    })

    return config
  },
  env: {
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID || '',
    IMAGE_CDN: process.env.IMAGE_CDN || '',
    isProd,
  },
  i18n,
})
