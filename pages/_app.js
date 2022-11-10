import { Fragment } from 'react'
import App from 'next/app'
import Head from 'next/head'
import Link from 'next/link'
import { Noto_Sans_TC, Noto_Sans_SC, Noto_Sans } from '@next/font/google'
import { Layout, Select, BackTop } from 'antd'
import { appWithTranslation, useTranslation } from 'next-i18next'
import { Provider } from '../src/store'
import 'react-virtualized/styles.css'
// must this way
require('../styles/antd.less')
import '../styles/globals.css'

import styles from '../styles/Home.module.css'

const NotoSans = Noto_Sans({
  weight: '500',
  subsets: ['latin'],
})
const NotoSansTC = Noto_Sans_TC({
  weight: '500',
  subsets: ['chinese-traditional'],
})
const NotoSansSC = Noto_Sans_SC({
  weight: '500',
  subsets: ['chinese-simplified'],
})

const langFont = {
  en: NotoSans.className,
  zh_tw: NotoSansTC.className,
  zh_cn: NotoSansSC.className,
}

const { Header, Content, Footer } = Layout

const NextHead = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('index')
  return (
    <Head>
      <title>{t('seo_title')}</title>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <meta name="description" content={t('seo_desc')} />
      <meta name="keywords" content="Maplstory home" />
      <meta property="og:type" content="website" />
      <meta property="og:description" content={t('seo_desc')} />
      <meta
        property="og:url"
        content="https://maplestory-home-simulator.vercel.app/"
      />
      <meta property="og:locale" content={language} />
      <meta property="og:site_name" content={t('title')} />
      <meta property="og:title" content={t('seo_title')} />
    </Head>
  )
}

const AppHeader = () => {
  const { t, i18n } = useTranslation('index')
  return (
    <Header className={styles.header}>
      <div className={styles['header-container']}>
        <Link href="/">
          <h2 style={{ marginBottom: 0, cursor: 'pointer' }}>
            {t('title')}
            &nbsp;
          </h2>
        </Link>
        <div>
          <Select
            onChange={(value) =>
              i18n.changeLanguage && i18n.changeLanguage(value)
            }
            defaultValue={i18n.language}
          >
            <Select.Option value="en">English</Select.Option>
            <Select.Option value="zh_tw">繁體中文</Select.Option>
            <Select.Option value="zh_cn">简体中文</Select.Option>
          </Select>
        </div>
      </div>
    </Header>
  )
}

const AppFooter = () => {
  const { t } = useTranslation('index')
  return (
    <Footer className={styles.footer}>
      <div>
        {t('other_tools')}：
        <a href="https://maplestory-arcane-symbol-calculator.vercel.app">
          {t('web_arcane_symbol_calculator')}
        </a>
        、
        <a href="https://maplestory-boss-crystal-calculator.vercel.app">
          {t('web_boss_crystal_calculator')}
        </a>
      </div>
      {t('title')} ©2020 Created by 丫村
    </Footer>
  )
}

function MyApp({ Component, pageProps }) {
  const {
    i18n: { language },
  } = useTranslation('index')
  return (
    <Fragment>
      <NextHead />
      <AppHeader />
      <BackTop />
      <Content
        className={`${styles.content} ${langFont[language] || langFont.en}`}
      >
        <Provider>
          <Component {...pageProps} />
        </Provider>
      </Content>
      <AppFooter />
    </Fragment>
  )
}

MyApp.getInitialProps = async (appContext) => ({
  ...(await App.getInitialProps(appContext)),
})

export default appWithTranslation(MyApp)
