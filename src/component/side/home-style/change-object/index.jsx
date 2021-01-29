import { withTranslation } from '@i18n'

/* components */
import { Popover, Row, Col } from 'antd'
import { InfoOutlined } from '@ant-design/icons'

/* utils */
import { entries } from '@utils/ramda'
import { __, includes, keys, prop, values, map } from 'ramda'

/* mapping */
import StringMapping from '@mapping/furniture-string'

import styles from './change-object.module.scss'

const ChangeObject = ({ t, type, themes, handleChange, currentThemeData }) => {
  const currentSelectFields = keys(currentThemeData)
  return (
    <div className={styles.container}>
      <h4 className={styles.title}>{t(`home_deco_${type}`)}</h4>
      <Row gutter={[8, 8]}>
        {entries(([key, { info, itemID, ...applyObjs }]) => {
          const mappedString = StringMapping[+itemID] || {}
          const needFields = values(applyObjs)
          const changeFileds = [type, ...map(prop('name'), needFields)]
          const matchFileds = currentSelectFields.filter(
            includes(__, changeFileds)
          )
          const hasTheme =
            matchFileds.filter((field) => currentThemeData[field] === key)
              .length > 0
          return (
            <Col span={6} key={itemID}>
              <div
                className={`${styles['list-item']} ${
                  hasTheme ? styles['list-item__active'] : ''
                }`}
              >
                <Popover
                  title={mappedString.name}
                  content={() => (
                    <div style={{ maxWidth: 200 }}>{mappedString.desc}</div>
                  )}
                  mouseEnterDelay={0.7}
                  arrowPointAtCenter
                  placement="left"
                >
                  <div className={`${styles['list-item-info']}`}>
                    <InfoOutlined />
                  </div>
                </Popover>
                <img
                  src={`/theme-ui/Item-Consume-0267.img-0${itemID}-info-preview.png`}
                  alt=""
                  onClick={handleChange(needFields)}
                  key={`home-obj-${itemID}`}
                />
              </div>
            </Col>
          )
        }, values(themes))}
      </Row>
    </div>
  )
}

ChangeObject.getInitialProps = async () => ({
  namespacesRequired: ['index'],
})

export default withTranslation('index')(ChangeObject)
