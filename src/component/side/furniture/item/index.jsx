import { withTranslation } from '@i18n'

/* store */
import { useDispatch } from '@store'
import { CHANGE_ACTIVE_FURNITURE } from '@store/active-furniture'

/* components */
import DetailPopover from './detail-popover'
import Favorite from './favorite'

import styles from './item.scss'

const Item = ({ t, id }) => {
  const dispatch = useDispatch()
  const handleClick = () => {
    dispatch({ type: CHANGE_ACTIVE_FURNITURE, payload: id })
  }
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
            backgroundImage: `url(/furniture/Item-Consume-0267.img-${id}-info-icon.png)`,
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

export default withTranslation('index')(Item)
