import { memo, useState, useMemo } from 'react'

/* components */
import { Row, Col } from 'antd'
import Item from '../item'

/* utils */
import {
  flatten,
  identity,
  is,
  keys,
  map,
  path,
  pipe,
  tap,
  uniq,
  values,
} from 'ramda'

/* mapping */
import { filteredFurniture as FurnitureMapping } from '@mapping/furniture'

const FurnitureTab = () => {
  const [filterCallback, setFilterCallback] = useState(identity)
  const filteredFurniture = useMemo(() => {
    const res = filterCallback(FurnitureMapping)
    return Array.isArray(res) ? res : keys(res)
  }, [filterCallback])
  return (
    <Row gutter={[8, 8]} style={{ paddingRight: 6 }}>
      {filteredFurniture.map((id) => (
        <Col span={6} key={`furniture-select-${id}`}>
          <Item id={id} />
        </Col>
      ))}
    </Row>
  )
}

export default memo(FurnitureTab)
