import { curry, fromPairs, map, pipe, tap, toPairs } from 'ramda'

export const entries = curry((cb, obj) => pipe(toPairs, map(cb))(obj))

export const mapObject = curry((cb, obj) =>
  pipe(
    entries(([key, value]) => [key, cb([key, value])]),
    fromPairs
  )(obj)
)
