import { reducerCreator } from './_helper'

export const HAIR_INITIAL = 'HAIR_INITIAL'

const initialState = []
const reducer = reducerCreator(initialState, {
  [HAIR_INITIAL]: (state, payload) => payload,
})

export default {
  initialState,
  reducer,
}
