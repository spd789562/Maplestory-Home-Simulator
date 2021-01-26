import { useMemo, useCallback } from 'react'

/* store */
import { useStore } from '@store'
import { CHANGE_SIDE_OPEN } from '@store/meta'

/* component */
import { Drawer } from 'antd'
import Tabs from './tabs'
import HomeStyle from './home-style'

import isClient from '@utils/is-client'

const TabMapping = [
  { id: 0, title: 'tab_home_style', component: <HomeStyle /> },
  { id: 1, title: 'tab_furniture' },
  { id: 2, title: 'tab_setting' },
]

const Side = () => {
  const [{ open, current: currentId }, dispatch] = useStore('meta.side')
  const currentTab = useMemo(() => TabMapping[currentId] || {}, [currentId])
  const width = Math.min(isClient() ? window.innerWidth - 30 : 300, 300)
  const handleClose = useCallback(
    () => dispatch({ type: CHANGE_SIDE_OPEN, payload: false }),
    []
  )
  return (
    <Drawer
      title={currentTab.title}
      placement="right"
      mask={false}
      visible={open}
      width={width}
      onClose={handleClose}
      forceRender
    >
      <Tabs />
      {currentTab.component}
    </Drawer>
  )
}

export default Side
