/* components */
import { Popover, Row, Col } from 'antd'

/* utils */
import { entries } from '@utils/ramda'
import { __, includes, keys, prop, values, map } from 'ramda'

/* mapping */
import StringMapping from '@mapping/furniture-string'

import styles from './change-object.module.scss'

const ChangeObject = ({ type, themes, handleChange, currentThemeData }) => {
  const currentSelectFields = keys(currentThemeData)
  return (
    <div className={styles.container}>
      <h4 className={styles.title}>{type}</h4>
      <Row gutter={[4, 4]}>
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
              <Popover
                title={mappedString.name}
                content={() => (
                  <div style={{ maxWidth: 200 }}>{mappedString.desc}</div>
                )}
              >
                <div
                  className={`${styles['list-item']} ${
                    hasTheme ? styles['list-item__active'] : ''
                  }`}
                >
                  <img
                    src={`/theme-ui/Item-Consume-0267.img-0${itemID}-info-preview.png`}
                    alt=""
                    onClick={handleChange(needFields)}
                    key={`home-obj-${itemID}`}
                  />
                </div>
              </Popover>
            </Col>
          )
        }, values(themes))}
      </Row>
    </div>
  )
}

export default ChangeObject
