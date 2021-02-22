/* store */
import { useStore } from '@store'

/* i18n */
import { withTranslation } from '@i18n'

/* components */
import { Row, Col } from 'antd'
import Item from './item'

/* utils */
import { keys } from 'ramda'

/* mapping */
import FurnitureMapping from '@mapping/furniture'

const Furniture = ({ t }) => {
  return (
    <Row>
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
