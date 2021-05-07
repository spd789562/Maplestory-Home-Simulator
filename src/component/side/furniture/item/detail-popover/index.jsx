import { withTranslation } from '@i18n'

/* components */
import { Popover, Divider, Tag } from 'antd'
import Favorite from '../favorite'
/* utils */
import { values, map } from 'ramda'

/* mapping */
import FurnitureMapping from '@mapping/furniture'
import StringMapping from '@mapping/furniture-string'
import TagColorMapping from '@mapping/tag/color'

const DetailPopover = ({ t, id, children }) => {
  const mappedString = StringMapping[+id]
  const furniture = FurnitureMapping[id]
  return (
    <Popover
      title={
        <div style={{ position: 'relative' }}>
          {mappedString.name}
          <Favorite
            id={id}
            buttonStyle={{
              position: 'absolute',
              top: 0,
              right: 0,
              fontSize: 18,
            }}
          />
        </div>
      }
      content={() => (
        <div style={{ maxWidth: 200, whiteSpace: 'pre-wrap' }}>
          {mappedString.desc}
          {furniture.info.type && (
            <>
              <div style={{ margin: '0 -14px' }}>
                <Divider
                  orientation="left"
                  style={{ fontSize: 12, color: '#6373ca' }}
                >
                  {t('furniture_function')}：{t(`title_${furniture.info.type}`)}
                </Divider>
              </div>
              <div>
                {t(`desc_${furniture.info.type}`)}
                {furniture.info.interact === 'animate' ? t('desc_animate') : ''}
              </div>
            </>
          )}
          {furniture.info.tag && (
            <>
              <div style={{ margin: '0 -14px' }}>
                <Divider
                  orientation="left"
                  style={{ fontSize: 12, color: '#6373ca' }}
                >
                  {t('furniture_tag')}
                </Divider>
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
      {children}
    </Popover>
  )
}

export default withTranslation('furniture')(DetailPopover)
