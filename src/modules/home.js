/* mapping */
import { ParsedTheme } from '@mapping/map-theme'
import { getTheme } from '@mapping/map-theme/name'

/* utils */
import { entries } from '@utils/ramda'
import { fromPairs, map, propEq } from 'ramda'

class Home {
  constructor(selectId) {
    const theme = ParsedTheme[getTheme(selectId)]
    const currentMapData = theme.find(propEq('id', selectId))
    this.selectId = selectId
    this.mapId = currentMapData.templateMapID
    this.theme = fromPairs(
      map(
        ({ 0: { info, itemID, ...themeObject } }) =>
          map(({ name, state }) => [name, state], themeObject),
        currentMapData.themeable
      )
    )
    this.furnitures = []
  }
}

export default Home
