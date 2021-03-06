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
  assocPath,
  add,
  __,
  ifElse,
  pipe,
  append,
  curry,
  equals,
  adjust,
  identity,
  map,
} from 'ramda'

export const HOUSE_CHANGE = 'HOUSE_CHANGE'
export const HOUSE_REORDER = 'HOUSE_REORDER'
export const HOUSE_INITIAL = 'HOUSE_INITIAL'
export const HOUSE_APPEND = 'HOUSE_APPEND'
export const HOUSE_UPDATE = 'HOUSE_UPDATE'
export const HOUSE_UPDATE_FURNITURE = 'HOUSE_UPDATE_FURNITURE'
export const HOUSE_REORDER_FURNITURE = 'HOUSE_REORDER_FURNITURE'
export const HOUSE_UPDATE_FURNITURE_INDEX = 'HOUSE_UPDATE_FURNITURE_INDEX'
export const HOUSE_DELETE_FURNITURE = 'HOUSE_DELETE_FURNITURE'
export const HOUSE_DUPLICATE = 'HOUSE_DUPLICATE'
export const HOUSE_DELETE = 'HOUSE_DELETE'

const initialState = {
  houses: [],
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
        houses: () => (Array.isArray(payload) ? payload : [payload]),
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
  [HOUSE_UPDATE_FURNITURE]: (state, payload) =>
    pipe(
      evolve({
        houses: update(
          state.current,
          evolve(
            {
              furnitures: (furnitures) => {
                const idx = findIndex(propEq('id', payload.id), furnitures)
                if (idx !== -1) {
                  return update(idx, payload, furnitures)
                } else {
                  return append(payload, furnitures)
                }
              },
            },
            state.houses[state.current]
          )
        ),
      }),
      SaveToStorage
    )(state),
  [HOUSE_UPDATE_FURNITURE_INDEX]: (state, payload) =>
    pipe(
      evolve({
        houses: update(
          state.current,
          evolve(
            {
              furnitures: (furnitures) => {
                const idx = findIndex(propEq('id', payload.id), furnitures)
                if (idx !== -1) {
                  return pipe(
                    adjust(idx, assocPath(['position', 'z'], payload.z)),
                    payload.index !== undefined
                      ? move(idx, payload.index)
                      : identity
                  )(furnitures)
                }
                return furnitures
              },
            },
            state.houses[state.current]
          )
        ),
      }),
      SaveToStorage
    )(state),
  [HOUSE_REORDER_FURNITURE]: (state, payload) =>
    pipe(
      evolve({
        houses: update(
          state.current,
          evolve(
            {
              furnitures: (furnitures) => {
                return pipe(
                  map((f) => {
                    const correspondFurniture = payload.find(propEq('id', f.id))
                    if (correspondFurniture) {
                      return assocPath(
                        ['position', 'z'],
                        correspondFurniture.z,
                        f
                      )
                    }
                    return f
                  })
                )(furnitures)
              },
            },
            state.houses[state.current]
          )
        ),
      }),
      SaveToStorage
    )(state),
  [HOUSE_DELETE_FURNITURE]: (state, id) =>
    pipe(
      evolve({
        houses: update(
          state.current,
          evolve(
            {
              furnitures: (furnitures) =>
                remove(findIndex(propEq('id', id), furnitures), 1, furnitures),
            },
            state.houses[state.current]
          )
        ),
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
