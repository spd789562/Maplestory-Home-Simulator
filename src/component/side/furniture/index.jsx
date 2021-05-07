/* store */
import { useStore } from '@store'

/* i18n */
import { withTranslation } from '@i18n'

/* components */
import { Row, Col, Tabs } from 'antd'
import Item from './item'

/* utils */
import { flatten, keys, map, path, pipe, tap, uniq, values } from 'ramda'

/* mapping */
import FurnitureMapping from '@mapping/furniture'

console.log(pipe(values, map(path(['info', 'type'])), uniq)(FurnitureMapping))

const Furniture = ({ t }) => {
  const [favoritesFurniture] = useStore('favorite-furniture')
  return (
    <Row style={{ marginTop: -20 }}>
      <Col flex="1">
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab={t('tab_all')} key="1">
            {/* add padding prevent TabPane overflow hidden overlay favorite star */}
            <Row gutter={[8, 8]} style={{ paddingRight: 6 }}>
              {keys(FurnitureMapping).map((id) => (
                <Col span={6} key={`furniture-select-${id}`}>
                  <Item id={id} />
                </Col>
              ))}
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('tab_favorite')} key="2">
            <Row gutter={[8, 8]} style={{ paddingRight: 6 }}>
              {favoritesFurniture.map((id) => (
                <Col span={6} key={`furniture-select-${id}`}>
                  <Item id={id} />
                </Col>
              ))}
            </Row>
          </Tabs.TabPane>
        </Tabs>
      </Col>
    </Row>
  )
}

Furniture.getInitialProps = async () => ({
  namespacesRequired: ['index'],
})

export default withTranslation('index')(Furniture)
