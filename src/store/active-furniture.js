import { reducerCreator } from './_helper'

export const CHANGE_ACTIVE_FURNITURE = 'CHANGE_ACTIVE_FURNITURE'
export const CLEAR_ACTIVE_FURNITURE = 'CLEAR_ACTIVE_FURNITURE'

const initialState = null

const reducer = reducerCreator(initialState, {
  [CHANGE_ACTIVE_FURNITURE]: (state, id) => {
    return id
  },
  [CLEAR_ACTIVE_FURNITURE]: (state) => {
    return null
  },
})

export default {
  initialState,
  reducer,
}
