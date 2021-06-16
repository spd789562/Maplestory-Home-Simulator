/* i18n */
import { withTranslation } from '@i18n'

/* components */
import { Row, Col, Tabs } from 'antd'
import TypeTab from './type-tab'

const Layer = ({ t }) => (
  <Row style={{ marginTop: -20 }}>
    <Col flex="1">
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab={t('tab_all')} key="1">
          <TypeTab type={0} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('tab_favorite')} key="2">
          <TypeTab type={1} />
        </Tabs.TabPane>
      </Tabs>
    </Col>
  </Row>
)

Layer.getInitialProps = async () => ({
  namespacesRequired: ['index'],
})

export default withTranslation('index')(Layer)
