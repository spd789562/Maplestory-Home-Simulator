import Etc from './myHome.img.json'

/* utils */
import {
  assoc,
  filter,
  groupBy,
  is,
  map,
  not,
  pipe,
  prop,
  toPairs,
} from 'ramda'
import { getTheme } from './name'

export const ParsedTheme = pipe(
  toPairs,
  filter(([key]) => +key),
  map(([key, data]) => assoc('id', key, data)),
  map((data) => ({
    ...filter(pipe(is(Object), not), data),
    theme: getTheme(data.id),
    themeable: filter(is(Object), data),
  })),
  groupBy(prop('theme'))
)(Etc)

export default Etc
