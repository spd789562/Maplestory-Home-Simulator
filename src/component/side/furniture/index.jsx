import { memo, useEffect } from 'react'

/* store */
import { useDispatch } from '@store'
import { INITIAL_FAVORITE_FURNITURE } from '@store/favorite-furniture'

/* i18n */
import { withTranslation } from '@i18n'

/* components */
import { Row, Col, Tabs } from 'antd'
import FavoriteTab from './favorite-tab'
import FurnitureTab from './furniture-tab'

const Furniture = ({ t }) => {
  const dispatch = useDispatch()
  useEffect(() => {
    const localFavorites = localStorage.getItem('HOUSE_SIMULATOR_furnitures')
    const parsedData = localFavorites && JSON.parse(localFavorites)
    if (parsedData && parsedData.length) {
      dispatch({
        type: INITIAL_FAVORITE_FURNITURE,
        payload: parsedData,
      })
    }
  }, [])
  return (
    <Row style={{ marginTop: -20 }}>
      <Col flex="1">
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab={t('tab_all')} key="1">
            <FurnitureTab />
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('tab_favorite')} key="2">
            <FavoriteTab />
          </Tabs.TabPane>
        </Tabs>
      </Col>
    </Row>
  )
}

Furniture.getInitialProps = async () => ({
  namespacesRequired: ['index'],
})

export default withTranslation('index')(memo(Furniture))
