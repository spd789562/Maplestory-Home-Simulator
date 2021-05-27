import { defaultTo, equals, findIndex, path, pipe, values } from 'ramda'

export const isPoster = (furniture) =>
  pipe(
    path(['info', 'tag']),
    defaultTo({}),
    values,
    findIndex(equals('poster')),
    (index) => index !== -1
  )(furniture)
