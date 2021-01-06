import { useReducer, useMemo } from 'react'

import {
  createContext,
  useContext,
  useContextSelector,
} from 'use-context-selector'

import { combineReducer } from './_helper'
import hairReducer from './hair'
import faceReducer from './face'
import hsitoryReducer from './history'
import searchReducer from './search'
import metaReducer from './meta'
import characterReducer from './character'
import hatReducer from './hat'
import overallReducer from './overall'

import { isNil, prop, curry, path, pickAll } from 'ramda'

const GlobalStore = createContext({})

const [combinedReducers, initialState] = combineReducer({
  hair: hairReducer,
  meta: metaReducer,
  character: characterReducer,
  face: faceReducer,
  search: searchReducer,
  hat: hatReducer,
  overall: overallReducer,
  history: hsitoryReducer,
})

export const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(combinedReducers, initialState)
  return (
    <GlobalStore.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {children}
    </GlobalStore.Provider>
  )
}

// export const useDispatch = () => useContext(GlobalStore).dispatch
export const useDispatch = () =>
  useContextSelector(GlobalStore, prop('dispatch'))

export const useStroeSelector = (field, selector) =>
  useContextSelector(GlobalStore, pipe(prop(field), selector))

export const useStore = (keyPath, initialValue = null) => {
  const dispatch = useDispatch()
  let keys = []
  if (keyPath.indexOf('.') !== 1) {
    keys = keyPath.split('.')
  } else if (Array.isArray(keyPath)) {
    keys = keyPath
  } else {
    keys = [keyPath]
  }
  let result = useContextSelector(GlobalStore, path(keys))
  if (
    initialValue !== null &&
    result.constructor === Object &&
    Object.keys(result).length === 0
  ) {
    result = initialValue
  }

  return [result, dispatch]
}
