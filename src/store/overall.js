import { reducerCreator } from './_helper'

export const OVERALL_INITIAL = 'OVERALL_INITIAL'

const initialState = []
const reducer = reducerCreator(initialState, {
  [OVERALL_INITIAL]: (state, payload) => payload,
})

export default {
  initialState,
  reducer,
}
