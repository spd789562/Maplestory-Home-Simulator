import { withTranslation } from '@i18n'

/* components */
import { Popover, Divider, Tag } from 'antd'
import { InfoOutlined } from '@ant-design/icons'

/* utils */
import { values, map } from 'ramda'

/* mapping */
import FurnitureMapping from '@mapping/furniture'
import StringMapping from '@mapping/furniture-string'
import TagColorMapping from '@mapping/tag/color'

import styles from './detail-popover.scss'

const DetailPopover = ({ t, id }) => {
  const mappedString = StringMapping[+id]
  const furniture = FurnitureMapping[id]
  return (
    <Popover
      title={mappedString.name}
      content={() => (
        <div style={{ maxWidth: 200 }}>
          {mappedString.desc}
          {furniture.info.tag && (
            <>
              <div style={{ margin: '0 -14px' }}>
                <Divider />
              </div>
              <div style={{ marginTop: -12, marginBottom: -8 }}>
                {map(
                  (tag) => (
                    <Tag
                      color={TagColorMapping[tag]}
                      key={`${id}_tag_${tag}`}
                      style={{ marginBottom: 8 }}
                    >
                      {t(`tag_${tag}`)}
                    </Tag>
                  ),
                  values(furniture.info.tag)
                )}
              </div>
            </>
          )}
        </div>
      )}
      mouseEnterDelay={0.7}
      arrowPointAtCenter
      placement="left"
    >
      <div className={styles['info-button']}>
        <InfoOutlined />
      </div>
    </Popover>
  )
}

export default withTranslation()(DetailPopover)
