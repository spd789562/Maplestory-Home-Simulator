/* mapping */
import { ParsedTheme } from '@mapping/map-theme'

/* store */
import { useStore } from '@store'
import { HOUSE_UPDATE } from '@store/house'

/* utils */
import { entries } from '@utils/ramda'
import { getTheme } from '@mapping/map-theme/name'
import { assocPath } from 'ramda'

const HomeStyle = () => {
  const [currentIndex, dispatch] = useStore('house.current')
  const [currentHomeData] = useStore(`house.houses.${currentIndex}`)
  const handleChange = (type, theme) => () => {
    dispatch({
      type: HOUSE_UPDATE,
      payload: assocPath(['theme', type], theme, currentHomeData),
    })
  }
  return (
    <div>
      {entries(([type, value]) => {
        return (
          <div>
            {type}
            <br />
            {entries(
              ([key, value]) => (
                <img
                  src={`/theme-ui/Item-Consume-0267.img-0${value.itemID}-info-preview.png`}
                  alt=""
                  onClick={handleChange(type, key)}
                />
              ),
              value
            )}
          </div>
        )
      }, ParsedTheme[getTheme(currentHomeData.mapId)][0].themeable)}
    </div>
  )
}

export default HomeStyle
