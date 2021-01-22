import { curry, map, pipe, toPairs } from 'ramda'

export const entries = curry((cb, obj) => pipe(toPairs, map(cb))(obj))
