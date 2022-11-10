/* i18n */
import { useTranslation } from 'next-i18next'

/* components */
import { Row, Col, Tabs } from 'antd'
import TypeTab from './type-tab'

const Layer = () => {
  const { t } = useTranslation('index')
  return (
    <Row style={{ marginTop: -20 }}>
      <Col flex="1">
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab={t('tab_layer_ground')} key="1">
            <TypeTab type={0} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('tab_layer_wall')} key="2">
            <TypeTab type={1} />
          </Tabs.TabPane>
        </Tabs>
      </Col>
    </Row>
  )
}

export default Layer
