import { memo } from 'react'

/* store */
import { useStore } from '@store'

/* components */
import { Row, Col } from 'antd'
import Item from '../item'

const FavoriteTab = () => {
  const [favoriteFurniture] = useStore('favorite-furniture')

  return (
    <Row gutter={[8, 8]} style={{ paddingRight: 6 }}>
      {favoriteFurniture.map((id) => (
        <Col span={6} key={`furniture-select-${id}`}>
          <Item id={id} />
        </Col>
      ))}
    </Row>
  )
}

export default memo(FavoriteTab)
