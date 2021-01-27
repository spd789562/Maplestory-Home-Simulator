/* mapping */
import { ParsedTheme } from '@mapping/map-theme'

/* store */
import { useStore } from '@store'
import { HOUSE_UPDATE } from '@store/house'

/* components */
import ChangeObject from './change-object'

/* utils */
import { entries } from '@utils/ramda'
import { getTheme } from '@mapping/map-theme/name'
import { assocPath, pipe, values } from 'ramda'

const HomeStyle = () => {
  const [currentIndex, dispatch] = useStore('house.current')
  const [currentHomeData] = useStore(`house.houses.${currentIndex}`)
  const handleChange = ({ info, itemID, ...applyObj }) => () => {
    dispatch({
      type: HOUSE_UPDATE,
      payload: pipe(
        ...values(applyObj).map(({ name, state }) =>
          assocPath(['theme', name], state)
        )
      )(currentHomeData),
    })
  }
  return (
    <div>
      {entries(
        ([type, themes]) => (
          <ChangeObject
            key={`home-obj-type-${type}`}
            type={type}
            themes={themes}
            handleChange={handleChange}
          />
        ),
        ParsedTheme[getTheme(currentHomeData.mapId)][0].themeable
      )}
    </div>
  )
}

export default HomeStyle
