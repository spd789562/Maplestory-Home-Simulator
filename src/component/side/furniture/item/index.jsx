import { memo } from 'react'

/* store */
import { useDispatch } from '@store'
import { CHANGE_ACTIVE_FURNITURE } from '@store/active-furniture'
import { UPDATE_APP_ACTIVE_FURNITURE, UPDATE_APP_EDIT } from '@store/app'
import { ENTER_EDIT } from '@store/meta'

/* components */
import DetailPopover from './detail-popover'
import Favorite from './favorite'

/* utils */
import { defaultTo, equals, findIndex, path, pipe, values } from 'ramda'

/* mapping */
import { filteredFurniture as FurnitureMapping } from '@mapping/furniture'

import styles from './item.module.scss'

const isPoster = (furniture) =>
  pipe(
    path(['info', 'tag']),
    defaultTo({}),
    values,
    findIndex(equals('poster')),
    (index) => index !== -1
  )(furniture)

const Item = ({ id }) => {
  const dispatch = useDispatch()
  const handleClick = () => {
    dispatch({ type: ENTER_EDIT })
    dispatch({ type: UPDATE_APP_EDIT, payload: true })
    dispatch({ type: CHANGE_ACTIVE_FURNITURE, payload: id })
    dispatch({ type: UPDATE_APP_ACTIVE_FURNITURE, payload: id })
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
              _isPoster ? '-info-avatar' : '-info-icon'
            }.png)`,
          }}
          onClick={handleClick}
        />
      </DetailPopover>
    </div>
  )
}
export default memo(Item)
