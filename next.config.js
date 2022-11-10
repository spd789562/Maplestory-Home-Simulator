const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const { i18n } = require('./next-i18next.config')
const withAntdLess = require('next-plugin-antd-less')
const path = require('path')
const config = require('./config')
const withPlugins = require('next-compose-plugins')

const isProd = process.env.NODE_ENV === 'production'

const localeSubpaths = {
  en: 'en',
  zh_tw: 'zh_tw',
  zh_cn: 'zh_cn',
}

// fix: prevents error when .less files are required by node
if (typeof require !== 'undefined') {
  require.extensions['.less'] = (file) => {}
}

const plugins = [
  withAntdLess({
    lessVarsFilePath: './styles/antd.less',
  }),
  withBundleAnalyzer,
]

module.exports = withPlugins([plugins], {
  webpack(config, options) {
    config.plugins.push(new MomentLocalesPlugin())
    config.resolve.modules.push(path.resolve('./'))

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
  publicRuntimeConfig: {
    ...config,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID || '',
    IMAGE_CDN: process.env.IMAGE_CDN || '',
    localeSubpaths,
    isProd,
  },
  experimental: {
    jsconfigPaths: true,
  },
  i18n,
})
