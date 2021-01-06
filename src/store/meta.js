import { reducerCreator } from './_helper'

import { assoc, evolve } from 'ramda'

export const INITIAL_WZ = 'INITIAL_WZ'
export const UPDATE_CHARACTER = 'UPDATE_CHARACTER'
export const CHANGE_REGION = 'CHANGE_REGION'
export const CHANGE_DATA_REGION = 'CHANGE_DATA_REGION'

const isClient = typeof window !== 'undefined'

const initialState = {
  region: {
    region: (isClient && localStorage.getItem('region')) || '',
    version: (isClient && localStorage.getItem('version')) || '',
    hair: '',
    face: '',
    overall: '',
    hat: '',
  },
  character: {
    skin: {
      id: '',
      region: '',
      version: '',
    },
    hat: {
      id: '',
      region: '',
      version: '',
    },
    overall: {
      id: '',
      region: '',
      version: '',
    },
    hair: {
      id: '',
      colorId: '0',
      region: '',
      version: '',
    },
    face: {
      id: '',
      colorId: '0',
      region: '',
      version: '',
    },
    earsType: '0',
    skinId: '',
    hairId: '',
    hairColorId: '0',
    faceId: '',
    faceColorId: '0',
    mixHairColorId: '',
    mixHairOpacity: 0.5,
    mixFaceColorId: '',
    mixFaceOpacity: 0.5,
    items: {},
  },
  wz: {},
}
const reducer = reducerCreator(initialState, {
  [CHANGE_REGION]: (state, payload) => {
    let { region, version } =
      typeof payload === 'string' ? state.wz[payload] : payload
    localStorage.setItem('region', region)
    localStorage.setItem('version', version)
    return { ...state, region: { ...state.region, region, version } }
  },
  [CHANGE_DATA_REGION]: (state, payload) => {
    return {
      ...state,
      region: assoc(payload.field, payload.region, state.region),
    }
  },
  [UPDATE_CHARACTER]: (state, payload) => {
    return { ...state, character: { ...state.character, ...payload } }
  },
  [INITIAL_WZ]: (state, payload) => ({ ...state, wz: payload }),
})

export default {
  initialState,
  reducer,
}
