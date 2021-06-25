import { useReducer, useMemo } from 'react'

import {
  createContext,
  useContext,
  useContextSelector,
} from 'use-context-selector'

import { combineReducer } from './_helper'
import metaReducer from './meta'
import houseReducer from './house'
import appReducer from './app'
import activeFurnitureReducer from './active-furniture'
import favoriteFurnitureReducer from './favorite-furniture'

import { isNil, prop, curry, path, pipe } from 'ramda'
import { createSelector } from 'reselect'

const GlobalStore = createContext({})

const [combinedReducers, initialState] = combineReducer({
  app: appReducer,
  meta: metaReducer,
  house: houseReducer,
  'active-furniture': activeFurnitureReducer,
  'favorite-furniture': favoriteFurnitureReducer,
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

export const useStoreSelector = (field, selector) => {
  const getData = createSelector(prop(field), selector)
  return useContextSelector(GlobalStore, getData)
}

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
