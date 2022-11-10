import { useTranslation } from 'next-i18next'

/* components */
import { Popover } from 'antd'
import { InfoCircleFilled } from '@ant-design/icons'

/* utils */
import { getType } from '@mapping/map-theme/name'
import { F } from 'ramda'

import styles from './change-map.module.scss'

const ChangeMap = ({ mapList, currentId, handleChange }) => {
  const { t } = useTranslation('index')
  return mapList.map(({ id, templateMapID, desc }) => (
    <div
      className={`${styles.map} ${
        currentId === id ? styles['map__active'] : ''
      }`}
      key={`map-preview-${templateMapID}`}
    >
      <h4 className={styles['map-title']}>
        {t(`home_type_${getType(templateMapID)}`)}
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
          mouseEnterDelay={0.7}
          placement="topRight"
          arrowPointAtCenter
        >
          <InfoCircleFilled style={{ marginTop: 4 }} />
        </Popover>
      </h4>
      <img
        src={`/home-thumbnail/${id}.png`}
        alt={`${id}-thumbnail`}
        onClick={currentId === id ? F : handleChange(id)}
      />
    </div>
  ))
}

export default ChangeMap
