import { reducerCreator } from './_helper'

export const INIT_APP_REF = 'INIT_APP_REF'
export const UPDATE_APP_EDIT = 'UPDATE_APP_EDIT'
export const UPDATE_APP_ZOOM = 'UPDATE_APP_ZOOM'
export const UPDATE_APP_ACTIVE_FURNITURE = 'UPDATE_APP_ACTIVE_FURNITURE'
export const UPDATE_APP_WIDTH_BY_SIDE = 'UPDATE_APP_WIDTH_BY_SIDE'
export const UPDATE_APP_FURNITURE_HOVER = 'UPDATE_APP_FURNITURE_HOVER'
export const UPDATE_APP_FURNITURE_INDEX = 'UPDATE_APP_FURNITURE_INDEX'
export const REORDER_APP_FURNITURE = 'REORDER_APP_FURNITURE'
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
  [UPDATE_APP_ZOOM]: creactFlow((app, zoom) => {
    app.zoom = zoom || 1
  }),
  [UPDATE_APP_ACTIVE_FURNITURE]: creactFlow((app, furnitureId) => {
    furnitureId && app.placeNewFurniture(furnitureId)
  }),
  [UPDATE_APP_WIDTH_BY_SIDE]: creactFlow((app, sideIsOpen) => {
    const sideWidth = Math.min(window.innerWidth - 30, 300)
    app.updateAPPWidth(window.innerWidth - (sideIsOpen ? sideWidth : 0))
  }),
  [UPDATE_APP_FURNITURE_HOVER]: creactFlow((app, { id, isHover }) => {
    const targetFurniture = app.getFurniture(id)
    if (targetFurniture) {
      targetFurniture.isHover = isHover
    }
  }),
  [UPDATE_APP_FURNITURE_INDEX]: creactFlow((app, { id, z }) => {
    id && app.handleUpdateFurnitureZIndex({ id, index: z })
  }),
  [REORDER_APP_FURNITURE]: creactFlow((app, furnitures) => {
    furnitures.length &&
      furnitures.map(({ id, z }) =>
        app.handleUpdateFurnitureZIndex({ id, index: z })
      )
  }),
  [DELETE_APP_FURNITURE]: creactFlow((app, id) => {
    id && app.event.emit('furnitureDelete', { id })
  }),
  [DESTROY_APP]: () => {
    return null
  },
})

export default {
  initialState,
  reducer,
}
