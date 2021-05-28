import { reducerCreator } from './_helper'

export const INIT_APP_REF = 'INIT_APP_REF'
export const UPDATE_APP_EDIT = 'UPDATE_APP_EDIT'
export const UPDATE_APP_ZOOM = 'UPDATE_APP_ZOOM'
export const UPDATE_APP_ACTIVE_FURNITURE = 'UPDATE_APP_ACTIVE_FURNITURE'
export const UPDATE_APP_WIDTH_BY_SIDE = 'UPDATE_APP_WIDTH_BY_SIDE'
export const DELETE_APP_FURNITURE = 'DELETE_APP_FURNITURE'
export const DESTROY_APP = 'DESTROY_APP'

const initialState = {}

const creactFlow = (callback) => (appRef, payload) => {
  appRef.current && callback(appRef.current, payload)
  return appRef
}

const reducer = reducerCreator(initialState, {
  [INIT_APP_REF]: (__, app) => {
    return app
  },
  [UPDATE_APP_EDIT]: creactFlow((app, isEdit) => {
    app.isEdit = isEdit
  }),
  [UPDATE_APP_ZOOM]: creactFlow((app, isEdit) => {
    app.zoom = zoom
  }),
  [UPDATE_APP_ACTIVE_FURNITURE]: creactFlow((app, activeFurnitureID) => {
    activeFurnitureID && app.placeNewFurniture(activeFurnitureID)
  }),
  [UPDATE_APP_WIDTH_BY_SIDE]: creactFlow((app, sideIsOpen) => {
    const sideWidth = Math.min(window.innerWidth - 30, 300)
    app.updateAPPWidth(window.innerWidth - (sideIsOpen ? sideWidth : 0))
  }),
  [DELETE_APP_FURNITURE]: creactFlow((app, id) => {
    app.event.emit('furnitureDelete', { id })
  }),
  [DESTROY_APP]: () => {
    return null
  },
})

export default {
  initialState,
  reducer,
}
