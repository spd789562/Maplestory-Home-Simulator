import { withTranslation } from '@i18n'

/* store */
import { useDispatch } from '@store'
import { CHANGE_ACTIVE_FURNITURE } from '@store/active-furniture'

/* components */
import { Popover, Row, Col } from 'antd'

/* utils */
import { entries } from '@utils/ramda'
import { __, includes, keys, prop, values, map } from 'ramda'

/* mapping */
import FurnitureMapping from '@mapping/furniture'
import StringMapping from '@mapping/furniture-string'

import styles from './item.scss'

const Item = ({ t, id }) => {
  const dispatch = useDispatch()
  const handleClick = () => {
    dispatch({ type: CHANGE_ACTIVE_FURNITURE, payload: id })
  }
  return (
    <img
      src={`/furniture/Item-Consume-0267.img-${id}-info-icon.png`}
      onClick={handleClick}
      alt=""
    />
  )
}

Item.getInitialProps = async () => ({
  namespacesRequired: ['index'],
})

export default withTranslation('index')(Item)
