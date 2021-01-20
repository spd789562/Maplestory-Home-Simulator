import Etc from './myHome.img.json'

/* utils */
import {
  assoc,
  either,
  equals,
  filter,
  groupBy,
  is,
  join,
  map,
  not,
  pipe,
  prop,
  splitWhen,
  toPairs,
} from 'ramda'

export const ParsedTheme = pipe(
  toPairs,
  filter(([key]) => +key),
  map(([key, data]) => assoc('id', key, data)),
  map((data) => ({
    ...filter(pipe(is(Object), not), data),
    themeable: filter(is(Object), data),
  })),
  groupBy(
    pipe(
      prop('info'),
      splitWhen(either(equals('_'), equals('-'))),
      prop(0),
      join('')
    )
  )
)(Etc)

export default Etc
