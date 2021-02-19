import { reducerCreator } from './_helper'

import { assoc, evolve } from 'ramda'

export const CHANGE_SIDE_OPEN = 'CHANGE_SIDE_OPEN'
export const CHANGE_SIDE_CURRENT = 'CHANGE_SIDE_CURRENT'
export const ENTER_EDIT = 'ENTER_EDIT'
export const EXIT_EDIT = 'EXIT_EDIT'

const isClient = typeof window !== 'undefined'

const initialState = {
  side: {
    open: false,
    current: 0,
  },
  edit: false,
}
const reducer = reducerCreator(initialState, {
  [CHANGE_SIDE_OPEN]: (state, payload) => {
    return { ...state, side: { open: payload, current: state.side.current } }
  },
  [CHANGE_SIDE_CURRENT]: (state, payload) => {
    return { ...state, side: { open: true, current: payload } }
  },
  [ENTER_EDIT]: (state, _) => {
    return { ...state, edit: true }
  },
  [EXIT_EDIT]: (state, _) => {
    return { ...state, edit: false }
  },
})

export default {
  initialState,
  reducer,
}
