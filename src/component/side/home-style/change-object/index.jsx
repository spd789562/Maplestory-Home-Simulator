import { useTranslation } from 'next-i18next'

/* components */
import { Popover, Row, Col } from 'antd'
import { InfoOutlined } from '@ant-design/icons'

/* utils */
import { entries } from '@utils/ramda'
import { __, includes, keys, prop, values, map, uniq, indexBy } from 'ramda'

/* mapping */
import StringMapping from '@mapping/furniture-string'

import styles from './change-object.module.scss'

const ChangeObject = ({ type, themes, handleChange, currentThemeData }) => {
  const { t } = useTranslation('index')
  const currentSelectFields = keys(currentThemeData)
  return (
    <div className={styles.container}>
      <h4 className={styles.title}>{t(`home_deco_${type}`)}</h4>
      <Row gutter={[8, 8]}>
        {entries(([key, { info, itemID, ...applyObjs }]) => {
          const mappedString = StringMapping[+itemID] || {}
          const needFields = values(applyObjs)
          const applyObj = indexBy(prop('name'), needFields)
          const changeFileds = uniq([type, ...map(prop('name'), needFields)])
          const matchFileds = currentSelectFields.filter(
            includes(__, changeFileds)
          )
          const hasTheme =
            matchFileds.filter(
              (field) => currentThemeData[field] === applyObj[field]?.state
            ).length >= needFields.length
          return (
            <Col span={6} key={itemID}>
              <div
                className={`${styles['list-item']} ${
                  hasTheme ? styles['list-item__active'] : ''
                }`}
                onClick={handleChange(needFields)}
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

export default ChangeObject
