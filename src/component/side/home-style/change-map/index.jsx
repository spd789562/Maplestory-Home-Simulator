import { withTranslation } from '@i18n'

/* components */
import { Popover } from 'antd'

/* utils */
import { getType } from '@mapping/map-theme/name'
import { F } from 'ramda'

import styles from './change-map.module.scss'

const ChangeMap = ({ t, mapList, currentId, handleChange }) => {
  return mapList.map(({ id, templateMapID, desc }) => (
    <div
      className={`${styles.map} ${
        currentId === id ? styles['map__active'] : ''
      }`}
      key={`map-preview-${templateMapID}`}
    >
      <Popover
        content={() => (
          <div style={{ maxWidth: 200 }}>
            {desc.split(/\\r\\n/).map((str, index) => (
              <span>
                {index !== 0 && <br />}
                {str}
              </span>
            ))}
          </div>
        )}
      >
        <h4 className={styles['map-title']}>
          {t(`home_type_${getType(templateMapID)}`)}
        </h4>
      </Popover>
      <img
        src={`/home-thumbnail/${id}.png`}
        alt={`${id}-thumbnail`}
        onClick={currentId === id ? F : handleChange(id)}
      />
    </div>
  ))
}

ChangeMap.getInitialProps = async () => ({
  namespacesRequired: ['index'],
})

export default withTranslation('index')(ChangeMap)
