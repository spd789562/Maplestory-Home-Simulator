import React, { Fragment, memo, useState } from 'react'
import dynamic from 'next/dynamic'

/* component */
// import Side from '@components/side'
import ZoomSlider from '@components/zoom-slider'

/* helper */
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

const HomeCanvas = dynamic(() => import('@components/home'), { ssr: false })
const ThemeSide = dynamic(() => import('@components/side'), { ssr: false })

function Home() {
  const [zoom, setZoom] = useState(1)
  return (
    <div style={{ position: 'relative' }}>
      <HomeCanvas zoom={zoom} />
      <ZoomSlider setZoom={setZoom} />
      <ThemeSide />
    </div>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['index', 'furniture'])),
    },
  }
}

export default Home
