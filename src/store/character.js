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

export const CHARACTER_CHANGE = 'CHARACTER_CHANGE'
export const CHARACTER_REORDER = 'CHARACTER_REORDER'
export const CHARACTER_INITIAL = 'CHARACTER_INITIAL'
export const CHARACTER_APPEND = 'CHARACTER_APPEND'
export const CHARACTER_UPDATE = 'CHARACTER_UPDATE'
export const CHARACTER_DUPLICATE = 'CHARACTER_DUPLICATE'
export const CHARACTER_DELETE = 'CHARACTER_DELETE'

const initialState = {
  characters: [],
  current: {},
  lastId: 1000000,
}

const findCharacterById = (id, characters) => find(propEq('id', id), characters)
const findCharacterIndexById = curry((id, characters) =>
  findIndex(propEq('id', id), characters)
)
const SaveToStorage = (state) => {
  localStorage.setItem(
    'MAPLESALON_characters',
    JSON.stringify(state.characters)
  )
  return state
}

const reducer = reducerCreator(initialState, {
  [CHARACTER_CHANGE]: (state, payload) =>
    mergeRight(state, {
      current: findCharacterById(payload, state.characters),
    }),
  [CHARACTER_INITIAL]: (state, payload) =>
    evolve(
      {
        characters: concat(
          __,
          (Array.isArray(payload) ? payload : [payload]).map((c, index) =>
            assoc('id', state.lastId + 1 + index, c)
          )
        ),
        lastId: add((Array.isArray(payload) ? payload : [payload]).length),
      },
      state
    ),
  [CHARACTER_REORDER]: (state, payload) =>
    pipe(
      evolve({
        characters: move(payload.source.index, payload.destination.index),
      }),
      SaveToStorage
    )(state),
  [CHARACTER_APPEND]: (state, payload) =>
    pipe(
      evolve({
        characters: concat(
          __,
          (Array.isArray(payload) ? payload : [payload]).map((c, index) =>
            assoc('id', state.lastId + 1 + index, c)
          )
        ),
        lastId: add((Array.isArray(payload) ? payload : [payload]).length),
      }),
      SaveToStorage
    )(state),
  [CHARACTER_UPDATE]: (state, payload) =>
    pipe(
      evolve({
        characters: pipe(
          findCharacterIndexById(payload.id),
          ifElse(
            // If character has been delete, append this
            equals(-1),
            () => append(payload, state.characters),
            update(__, payload, state.characters)
          )
        ),
      }),
      SaveToStorage
    )(state),
  [CHARACTER_DUPLICATE]: (state, payload) =>
    pipe(
      evolve({
        characters: insert(
          findIndex(propEq('id', payload), state.characters),
          mergeRight(findCharacterById(payload, state.characters), {
            id: state.lastId + 1,
          })
        ),
        lastId: add(1),
      }),
      SaveToStorage
    )(state),
  [CHARACTER_DELETE]: (state, payload) =>
    pipe(
      evolve({
        characters: remove(
          findCharacterIndexById(payload, state.characters),
          1
        ),
      }),
      SaveToStorage
    )(state),
})

export default {
  initialState,
  reducer,
}
