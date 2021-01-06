import { reducerCreator } from './_helper'

export const SEARCH_UPDATE = 'SEARCH_UPDATE'
export const WIDTH_UPDATE = 'WIDTH_UPDATE'

const initialState = {
  hair: {
    name: '',
    gender: '',
  },
  face: {
    name: '',
    gender: '',
  },
  hat: {
    name: '',
    gender: '',
  },
  overall: {
    name: '',
    gender: '',
  },
  tabWidth: 300,
}

const reducer = reducerCreator(initialState, {
  [SEARCH_UPDATE]: (state, { type, field, value }) => ({
    ...state,
    [type]: {
      ...state[type],
      [field]: value,
    },
  }),
  [WIDTH_UPDATE]: (state, payload) => ({
    ...state,
    tabWidth: payload,
  }),
})

export default {
  initialState,
  reducer,
}
