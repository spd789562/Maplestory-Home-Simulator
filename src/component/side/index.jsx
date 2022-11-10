import { useMemo, useCallback } from 'react'
import { useTranslation } from 'next-i18next'

/* store */
import { useStore } from '@store'
import { CHANGE_SIDE_OPEN } from '@store/meta'

/* component */
import { Drawer } from 'antd'
import Tabs from './tabs'
import HomeStyle from './home-style'
import FurnitureList from './furniture'
import Layer from './layer'
import Setting from './setting'

import isClient from '@utils/is-client'

const TabMapping = [
  { id: 0, title: 'tab_home_style', component: <HomeStyle /> },
  { id: 1, title: 'tab_furniture', component: <FurnitureList /> },
  { id: 2, title: 'tab_layer', component: <Layer /> },
  { id: 3, title: 'tab_setting', component: <Setting /> },
]

const Side = () => {
  const { t } = useTranslation('index')
  const [{ open, current: currentId }, dispatch] = useStore('meta.side')
  const currentTab = useMemo(() => TabMapping[currentId] || {}, [currentId])
  const width = Math.min(isClient() ? window.innerWidth - 30 : 300, 300)
  const handleClose = useCallback(
    () => dispatch({ type: CHANGE_SIDE_OPEN, payload: false }),
    []
  )
  return (
    <>
      <Tabs />
      <Drawer
        title={t(currentTab.title)}
        placement="right"
        mask={false}
        open={open}
        width={width}
        onClose={handleClose}
        forceRender
      >
        {currentTab.component}
      </Drawer>
    </>
  )
}

export default Side
