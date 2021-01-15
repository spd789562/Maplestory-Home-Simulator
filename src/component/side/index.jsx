/* store */
import { useStore } from '@store'

/* component */
import { Drawer } from 'antd'
import Tabs from './tabs'

const Side = () => {
  const [isOpen] = useStore('meta.side.open')

  return (
    <Drawer
      title="Basic Drawer"
      placement="right"
      closable={false}
      mask={false}
      visible={isOpen}
      forceRender
    >
      <Tabs />
    </Drawer>
  )
}

export default Side
