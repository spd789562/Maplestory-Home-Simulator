import { useMemo } from 'react'
/* store */
import { useStore } from '@store'
import { CHANGE_SIDE_OPEN, CHANGE_SIDE_CURRENT } from '@store/meta'
import { UPDATE_APP_WIDTH_BY_SIDE } from '@store/app'

/* components */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlay,
  faHome,
  faCouch,
  faLayerGroup,
  faCog,
} from '@fortawesome/free-solid-svg-icons'

/* styles */
import styles from './tabs.module.scss'

const TabMapping = [
  { id: 0, icon: faHome },
  { id: 1, icon: faCouch },
  { id: 2, icon: faLayerGroup },
  { id: 3, icon: faCog },
]

const Tabs = () => {
  const [{ open, current: currentId }, dispatch] = useStore('meta.side')
  const posRight = useMemo(
    () => (open ? Math.min(window.innerWidth - 30, 300) : 0),
    [open]
  )

  const handleToggle = () => {
    dispatch({ type: CHANGE_SIDE_OPEN, payload: !open })
    dispatch({ type: UPDATE_APP_WIDTH_BY_SIDE, payload: !open })
  }
  const handleChangeTab = (id) => () => {
    dispatch({ type: CHANGE_SIDE_CURRENT, payload: id })
    dispatch({ type: UPDATE_APP_WIDTH_BY_SIDE, payload: true })
  }

  return (
    <ul className={styles.tabs} style={{ right: posRight }}>
      <li
        className={[styles['tabs-tab'], styles['tabs-tab__arrow']].join(' ')}
        onClick={handleToggle}
      >
        <FontAwesomeIcon icon={faPlay} transform={{ rotate: open ? 0 : 180 }} />
      </li>
      {TabMapping.map(({ id, icon }) => (
        <li
          className={styles['tabs-tab']}
          onClick={handleChangeTab(id)}
          key={`side-tab-${id}`}
        >
          <FontAwesomeIcon
            icon={icon}
            style={{ color: +currentId === id && open ? '#6373ca' : '#999' }}
          />
        </li>
      ))}
    </ul>
  )
}

export default Tabs
