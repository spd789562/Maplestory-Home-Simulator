const has = (maps) => (type) => !!maps[type]

export const reducerCreator = (initState, actionMaps) => (
  state = initState,
  { type, payload }
) => (has(actionMaps)(type) ? actionMaps[type](state, payload) : state)

export const combineReducer = (reducers) => {
  const keys = Object.keys(reducers)
  let globalState = keys.reduce(
    (state, key) => Object.assign(state, { [key]: reducers[key].initialState }),
    {}
  )
  const combinedReducer = (state, action) => {
    let newState = { ...state }
    keys.forEach((key) => {
      const changedData = reducers[key].reducer(state[key], action)
      newState[key] = changedData
    })
    return newState
  }

  return [combinedReducer, globalState]
}

export const combineDispatch = (dispatchs) => (payload) =>
  dispatchs.forEach((dispatch) => dispatch(payload))
