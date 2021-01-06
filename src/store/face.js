import { reducerCreator } from './_helper'

export const FACE_INITIAL = 'FACE_INITIAL'

const initialState = []
const reducer = reducerCreator(initialState, {
  [FACE_INITIAL]: (state, payload) => payload,
})

export default {
  initialState,
  reducer,
}
