import { reducerCreator } from './_helper'

export const HAT_INITIAL = 'HAT_INITIAL'

const initialState = []
const reducer = reducerCreator(initialState, {
  [HAT_INITIAL]: (state, payload) => payload,
})

export default {
  initialState,
  reducer,
}
