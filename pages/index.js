import React, { Fragment, memo, useState } from 'react'
import dynamic from 'next/dynamic'

/* component */
import Side from '@components/side'
import ZoomSlider from '@components/zoom-slider'

/* helper */
import { withTranslation } from '@i18n'

const HomeCanvas = dynamic(() => import('@components/home'), { ssr: false })

function Home({ t }) {
  const [zoom, setZoom] = useState(1)
  return (
    <div style={{ position: 'relative' }}>
      <HomeCanvas zoom={zoom} />
      <ZoomSlider setZoom={setZoom} />
      <Side />
    </div>
  )
}

Home.getInitialProps = async () => ({
  namespacesRequired: ['index'],
})

export default withTranslation('index')(memo(Home))
