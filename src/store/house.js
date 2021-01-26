import { reducerCreator } from './_helper'

import {
  find,
  findIndex,
  mergeRight,
  propEq,
  update,
  evolve,
  concat,
  insert,
  remove,
  move,
  prop,
  max,
  assoc,
  add,
  __,
  ifElse,
  pipe,
  append,
  curry,
  equals,
} from 'ramda'

import Home from '@modules/home'

export const HOUSE_CHANGE = 'HOUSE_CHANGE'
export const HOUSE_REORDER = 'HOUSE_REORDER'
export const HOUSE_INITIAL = 'HOUSE_INITIAL'
export const HOUSE_APPEND = 'HOUSE_APPEND'
export const HOUSE_UPDATE = 'HOUSE_UPDATE'
export const HOUSE_DUPLICATE = 'HOUSE_DUPLICATE'
export const HOUSE_DELETE = 'HOUSE_DELETE'

const initialState = {
  houses: [new Home('017')],
  current: 0,
  lastId: 1000000,
}

const findHouseById = (id, houses) => find(propEq('id', id), houses)
const findHouseIndexById = curry((id, houses) =>
  findIndex(propEq('id', id), houses)
)
const SaveToStorage = (state) => {
  localStorage.setItem('HOUSE_SIMULATOR_houses', JSON.stringify(state.houses))
  return state
}

const reducer = reducerCreator(initialState, {
  [HOUSE_INITIAL]: (state, payload) =>
    evolve(
      {
        houses: concat(
          __,
          (Array.isArray(payload) ? payload : [payload]).map((c, index) =>
            assoc('id', state.lastId + 1 + index, c)
          )
        ),
        lastId: add((Array.isArray(payload) ? payload : [payload]).length),
      },
      state
    ),
  [HOUSE_APPEND]: (state, payload) =>
    pipe(
      evolve({
        houses: concat(
          __,
          (Array.isArray(payload) ? payload : [payload]).map((c, index) =>
            assoc('id', state.lastId + 1 + index, c)
          )
        ),
        lastId: add((Array.isArray(payload) ? payload : [payload]).length),
      }),
      SaveToStorage
    )(state),
  [HOUSE_UPDATE]: (state, payload) =>
    pipe(
      evolve({
        houses: update(state.current, payload),
      }),
      SaveToStorage
    )(state),
  [HOUSE_DUPLICATE]: (state, payload) =>
    pipe(
      evolve({
        houses: insert(
          findIndex(propEq('id', payload), state.houses),
          mergeRight(findHouseById(payload, state.houses), {
            id: state.lastId + 1,
          })
        ),
        lastId: add(1),
      }),
      SaveToStorage
    )(state),
  [HOUSE_DELETE]: (state, payload) =>
    pipe(
      evolve({
        houses: remove(findHouseIndexById(payload, state.houses), 1),
      }),
      SaveToStorage
    )(state),
})

export default {
  initialState,
  reducer,
}
