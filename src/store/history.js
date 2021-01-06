import { reducerCreator } from './_helper'
import {
  prepend,
  find,
  findIndex,
  ifElse,
  propEq,
  identity,
  move,
  take,
  pipe,
} from 'ramda'

export const INITIAL_HISTORY = 'INITIAL_HISTORY'
export const APPEND_HISTORY = 'APPEND_HISTORY'

const initialState = []
const HISTORY_LIMIT = 20

const SaveToStorage = (state) => {
  localStorage.setItem('MAPLESALON_history', JSON.stringify(state))
  return state
}

const reducer = reducerCreator(initialState, {
  [INITIAL_HISTORY]: (state, payload) => payload,
  [APPEND_HISTORY]: (state, payload) =>
    pipe(
      ifElse(
        find(propEq('id', payload.id)),
        move(findIndex(propEq('id', payload.id), state), 0),
        prepend(payload)
      ),
      take(HISTORY_LIMIT),
      SaveToStorage
    )(state),
})

export default {
  initialState,
  reducer,
}
