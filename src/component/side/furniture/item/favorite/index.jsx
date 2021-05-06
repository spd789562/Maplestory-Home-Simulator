import { useCallback } from 'react'
import { withTranslation } from '@i18n'
import { useStoreSelector, useDispatch } from '@store'

/* components */
import { Badge, Tooltip } from 'antd'
import { StarFilled } from '@ant-design/icons'

/* utils */
import { find, pipe, equals } from 'ramda'

/* mapping */
import {
  ADD_FAVORITE_FURNITURE,
  REMOVE_FAVORITE_FURNITURE,
} from '@store/favorite-furniture'

const Favorite = ({ t, id, buttonStyle = {} }) => {
  const isFavorite = useStoreSelector(
    'favorite-furniture',
    pipe(find(equals(id)), Boolean)
  )
  const dispatch = useDispatch()
  const handleClick = useCallback(() => {
    dispatch({
      type: isFavorite ? REMOVE_FAVORITE_FURNITURE : ADD_FAVORITE_FURNITURE,
      payload: id,
    })
  }, [isFavorite])
  return (
    <Tooltip
      title={t('add_favorite')}
      mouseEnterDelay={0.7}
      arrowPointAtCenter
      placement="topRight"
    >
      <StarFilled
        style={{
          color: isFavorite ? '#ffbe00' : '#999',
          ...buttonStyle,
        }}
        onClick={handleClick}
      />
    </Tooltip>
  )
}

export default withTranslation()(Favorite)
