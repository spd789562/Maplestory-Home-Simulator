/* mapping */
import { ParsedTheme } from '@mapping/map-theme'
import { getTheme } from '@mapping/map-theme/name'

/* utils */
import { entries } from '@utils/ramda'
import { fromPairs, map, propEq } from 'ramda'

const getInitTheme = (selectId) => {
  const theme = ParsedTheme[getTheme(selectId)]
  const mapData = theme.find(propEq('id', selectId))
  return fromPairs(
    map(
      ({ 0: { info, itemID, ...themeObject } }) =>
        map(({ name, state }) => [name, state], themeObject),
      mapData.themeable
    )
  )
}

export default getInitTheme
