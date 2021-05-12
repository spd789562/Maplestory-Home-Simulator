import { memo } from 'react'
import { withTranslation } from '@i18n'

/* store */
import { useDispatch } from '@store'
import { CHANGE_ACTIVE_FURNITURE } from '@store/active-furniture'

/* components */
import DetailPopover from './detail-popover'
import Favorite from './favorite'

/* utils */
import { defaultTo, equals, findIndex, path, pipe, values } from 'ramda'

/* mapping */
import { filteredFurniture as FurnitureMapping } from '@mapping/furniture'

import styles from './item.scss'

const isPoster = (furniture) =>
  pipe(
    path(['info', 'tag']),
    defaultTo({}),
    values,
    findIndex(equals('poster')),
    (index) => index !== -1
  )(furniture)

const Item = ({ t, id }) => {
  const dispatch = useDispatch()
  const handleClick = () => {
    dispatch({ type: CHANGE_ACTIVE_FURNITURE, payload: id })
  }
  const furniture = FurnitureMapping[id] || {}
  const _isPoster = isPoster(furniture)
  return (
    <div className={styles['item']}>
      <Favorite
        id={id}
        buttonStyle={{
          position: 'absolute',
          top: -8,
          right: -8,
          fontSize: 20,
          zIndex: 1,
        }}
      />
      <DetailPopover id={id}>
        <div
          className={styles['item-image']}
          style={{
            backgroundImage: `url(/furniture/Item-Consume-0267.img-${id}${
              _isPoster ? '-layer1-0' : '-info-icon'
            }.png)`,
          }}
          onClick={handleClick}
        />
      </DetailPopover>
    </div>
  )
}

Item.getInitialProps = async () => ({
  namespacesRequired: ['index'],
})

export default withTranslation('index')(memo(Item))
