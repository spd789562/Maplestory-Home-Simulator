import { memo } from 'react'
import { useTranslation } from 'next-i18next'

/* components */
import { Popover, Divider, Tag } from 'antd'
import Favorite from '../favorite'
/* utils */
import { values, map, pipe, path, defaultTo, findIndex, equals } from 'ramda'

/* mapping */
import FurnitureMapping from '@mapping/furniture'
import StringMapping from '@mapping/furniture-string'
import TagColorMapping from '@mapping/tag/color'

const typeIsRest = (furniture) =>
  pipe(path(['info', 'type']), equals('rest'))(furniture)
const tagHasChair = (furniture) =>
  pipe(
    path(['info', 'tag']),
    defaultTo({}),
    values,
    findIndex(equals('chair')),
    (index) => index !== -1
  )(furniture)

const DetailPopover = ({ id, children }) => {
  const { t } = useTranslation('furniture')
  const mappedString = StringMapping[+id] || { name: id, desc: '' }
  const furniture = FurnitureMapping[id]
  const isRest = typeIsRest(furniture)
  const isChair = tagHasChair(furniture)
  /* if type is rest, add 'chair' suffix by tag has chair, 'bed' suffix of other */
  const descSuffix = isRest ? `_${isChair ? 'chair' : 'bed'}` : ''
  return (
    <Popover
      title={
        <div style={{ position: 'relative' }}>
          {mappedString.name || id}
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
          {mappedString.desc.replace(/\\r\\n/g, '\r\n')}
          {furniture.info.type && (
            <>
              <div style={{ margin: '0 -14px' }}>
                <Divider
                  orientation="left"
                  style={{ fontSize: 12, color: '#6373ca' }}
                >
                  {t('furniture_function')}：
                  {t(`title_${furniture.info.type}${descSuffix}`)}
                </Divider>
              </div>
              <div>
                {t(`desc_${furniture.info.type}${descSuffix}`)}
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

export default memo(DetailPopover)
