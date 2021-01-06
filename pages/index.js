import React, { memo } from 'react'
import dynamic from 'next/dynamic'

/* component */

/* helper */
import { withTranslation } from '@i18n'

const HomeCanvas = dynamic(() => import('@components/home'), { ssr: false })

function Home({ t }) {
  return <HomeCanvas />
}

Home.getInitialProps = async () => ({
  namespacesRequired: ['index'],
})

export default withTranslation('index')(memo(Home))
