module.exports = {
  // https://www.i18next.com/overview/configuration-options#logging
  debug: false,
  i18n: {
    defaultNS: 'index',
    defaultLocale: 'zh_tw',
    locales: ['en', 'zh_tw', 'zh_cn'],
  },
  /** To avoid issues when deploying to some paas (vercel...) */
  localePath:
    typeof window === 'undefined'
      ? require('path').resolve('./public/locales')
      : '/locales',

  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
