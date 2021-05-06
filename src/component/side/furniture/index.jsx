/* store */
import { useStore } from '@store'

/* i18n */
import { withTranslation } from '@i18n'

/* components */
import { Row, Col } from 'antd'
import Item from './item'

/* utils */
import { flatten, keys, map, path, pipe, tap, uniq, values } from 'ramda'

/* mapping */
import FurnitureMapping from '@mapping/furniture'

const Furniture = ({ t }) => {
  return (
    <Row gutter={[8, 8]}>
      {keys(FurnitureMapping).map((id) => (
        <Col span={6} key={`furniture-select-${id}`}>
          <Item id={id} />
        </Col>
      ))}
    </Row>
  )
}

Furniture.getInitialProps = async () => ({
  namespacesRequired: ['index'],
})

export default withTranslation('index')(Furniture)
