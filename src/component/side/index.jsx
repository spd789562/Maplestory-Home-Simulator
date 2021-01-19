import { useMemo } from 'react'

/* store */
import { useStore } from '@store'

/* component */
import { Drawer } from 'antd'
import Tabs from './tabs'
import HomeStyle from './home-style'

const TabMapping = [
  { id: 0, title: 'tab_home_style', component: <HomeStyle /> },
  { id: 1, title: 'tab_furniture' },
  { id: 2, title: 'tab_setting' },
]

const Side = () => {
  const [{ open, current: currentId }] = useStore('meta.side')
  const currentTab = useMemo(() => TabMapping[currentId] || {}, [currentId])
  return (
    <Drawer
      title={currentTab.title}
      placement="right"
      closable={false}
      mask={false}
      visible={open}
      forceRender
    >
      <Tabs />
      {currentTab.component}
    </Drawer>
  )
}

export default Side
