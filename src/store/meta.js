import { reducerCreator } from './_helper'

import { assoc, evolve } from 'ramda'

export const CHANGE_SIDE_OPEN = 'CHANGE_SIDE_OPEN'
export const CHANGE_SIDE_CURRENT = 'CHANGE_SIDE_CURRENT'
export const UPDATE_ZOOM_VALUE = 'UPDATE_ZOOM_VALUE'
export const UPDATE_ZOOM_RANGE = 'UPDATE_ZOOM_RANGE'
export const ENTER_EDIT = 'ENTER_EDIT'
export const EXIT_EDIT = 'EXIT_EDIT'

const isClient = typeof window !== 'undefined'

const initialState = {
  side: {
    open: false,
    current: 0,
  },
  zoom: {
    min: 0.1,
    value: 1,
    max: 4,
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
  [UPDATE_ZOOM_VALUE]: (state, zoom) => {
    return {
      ...state,
      zoom: {
        ...state.zoom,
        value: zoom,
      },
    }
  },
  [UPDATE_ZOOM_RANGE]: (state, payload) => {
    return {
      ...state,
      zoom: {
        ...state.zoom,
        min: payload.min || state.zoom.min,
        max: payload.max || state.zoom.max,
      },
    }
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
