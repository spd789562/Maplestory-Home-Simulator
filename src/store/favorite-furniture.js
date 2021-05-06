import { reducerCreator } from './_helper'
import { append, equals, find, identity, ifElse, pipe, without } from 'ramda'

export const ADD_FAVORITE_FURNITURE = 'ADD_FAVORITE_FURNITURE'
export const REMOVE_FAVORITE_FURNITURE = 'REMOVE_FAVORITE_FURNITURE'
export const CLEAR_FAVORITE_FURNITURE = 'CLEAR_FAVORITE_FURNITURE'

const initialState = []

const SaveToStorage = (state) => {
  localStorage.setItem('HOUSE_SIMULATOR_furnitures', JSON.stringify(state))
  return state
}

const reducer = reducerCreator(initialState, {
  [ADD_FAVORITE_FURNITURE]: (state, id) =>
    pipe(ifElse(find(equals(id)), identity, append(id)), SaveToStorage)(state),
  [REMOVE_FAVORITE_FURNITURE]: (state, id) =>
    pipe(without([id]), SaveToStorage)(state),
  [CLEAR_FAVORITE_FURNITURE]: () => SaveToStorage([]),
})

export default {
  initialState,
  reducer,
}
