import React, { Fragment, memo } from 'react'
import dynamic from 'next/dynamic'

/* component */
import Side from '@components/side'

/* helper */
import { withTranslation } from '@i18n'

const HomeCanvas = dynamic(() => import('@components/home'), { ssr: false })

function Home({ t }) {
  return (
    <Fragment>
      <HomeCanvas />
      <Side />
    </Fragment>
  )
}

Home.getInitialProps = async () => ({
  namespacesRequired: ['index'],
})

export default withTranslation('index')(memo(Home))
