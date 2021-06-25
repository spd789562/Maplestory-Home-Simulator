/* components */
import * as PIXI from 'pixi.js-legacy'
window.PIXI = PIXI
require('pixi-layers')
import {
  Application,
  Container,
  AnimatedSprite,
  Sprite,
  Rectangle,
  Graphics,
  Point,
  utils,
} from 'pixi.js-legacy'
import { Viewport } from 'pixi-viewport'
import PixiLoaderManager from './pixi-loader-manager'
import MapObject from './map-object'
import MapBack from './map-back'
import Minimap from './minimap'
import Furniture from './furniture'
import Capture from './component/capture'

/* utils */
import isClient from '@utils/is-client'
import {
  add,
  assoc,
  clone,
  evolve,
  filter,
  flatten,
  keys,
  map,
  path,
  pathEq,
  pick,
  pickBy,
  pipe,
  prop,
  tap,
  times,
  toPairs,
  uniq,
  values,
} from 'ramda'
import { entries } from '@utils/ramda'
import {
  GRID_WIDTH,
  GRID_LINE_STROKE,
  GRID_LINE_WIDTH,
  GRID_LINE_OPACITY,
  GRID_RESTRICT_BACKGROUND,
} from './constant'

/* mapping */
import MapTheme from '@mapping/map-theme'
import MapObjectMapping from '@mapping/map-object'
import Maps from '@mapping/map'

const { Stage, Group, Layer } = window.PIXI.display
const { EventEmitter } = utils

const getMapObjects = pipe(
  // filter non obj or null obj
  pickBy((val, key) => !Number.isNaN(+key) && val && val.obj),
  toPairs,
  // flatten obj
  map(([layer, data]) =>
    pipe(prop('obj'), values, map(assoc('layer', layer)))(data)
  ),
  values,
  flatten
)

const HF_HEIGHT = 160
const fakeTheme = 's1'
const defaultTheme = '0'

class PixiAPP {
  constructor(canvasRef) {
    this.canvas = {
      width: window.innerWidth,
      height: window.innerHeight - HF_HEIGHT,
    }
    this.app = new Application({
      width: this.canvas.width,
      height: this.canvas.height,
      backgroundColor: 0x666666,
      backgroundAlpha: 0.5,
      transparent: false,
      view: canvasRef,
      antialias: true,
    })
    this.showGrid = false
    this._isEdit = false
    this.app.layers = {}
    this.app.stage = new Stage()
    this.group = {
      normal: new Group(1),
      map: new Group(2),
      drag: new Group(3),
    }
    this.app.stage.addChild(new Layer(this.group.normal))
    this.app.stage.addChild(new Layer(this.group.map))
    this.app.stage.addChild(new Layer(this.group.drag))

    this.viewZoom = 1

    this.furnitures = []
    this.event = new EventEmitter()
    this.event.addListener('furnitureUpdate', this.handleUpdateFurniture)
    this.event.addListener('furnitureDelete', this.handleDeleteFurniture)

    /* capture button */
    this.$capture = new Capture(this)
    this.$capture.position.set(0, this.canvas.height - 80)
    this.app.stage.addChild(this.$capture)
  }
  /**
   * @param {string} selectId
   */
  changeHomeMap(selectId) {
    this.selectedMapTheme = MapTheme[selectId]
    if (this.mapId === this.selectedMapTheme.templateMapID) return

    this.clearMap()
    this.mapId = this.selectedMapTheme.templateMapID
    this.mapData = Maps[this.mapId]
    this.defaultTheme = '0'

    /* initial map infomation */
    this.edge = pipe(
      pick(['VRTop', 'VRRight', 'VRBottom', 'VRLeft']),
      ({ VRTop: top, VRRight: right, VRBottom: bottom, VRLeft: left }) => ({
        top,
        right,
        bottom,
        left,
      }),
      map(Number)
    )(this.mapData.info)
    this.center = {
      x: Math.abs(this.edge.left),
      y: Math.abs(this.edge.top),
    }
    this.world = {
      width: Math.abs(this.edge.right) + Math.abs(this.edge.left),
      height: Math.abs(this.edge.top) + Math.abs(this.edge.bottom),
    }

    this.viewport = new Viewport({
      screenWidth: this.canvas.width,
      screenHeight: this.canvas.height,
      worldWidth: this.world.width,
      worldHeight: this.world.height,
      interaction: this.app.renderer.plugins.interaction,
      divWheel: this.app.view,
      disableOnContextMenu: true,
    })
    const maxZoomWidthScale = this.world.width / this.canvas.width
    const maxZoomHeightScale = this.world.height / this.canvas.height
    const maxZoomScale = Math.max(maxZoomWidthScale, maxZoomHeightScale)
    this.event.emit('zoomRange', 1 / maxZoomScale, 3)
    // limit zoom range
    this.viewport
      .clampZoom({
        maxWidth: this.canvas.width * maxZoomScale,
        minWidth: this.canvas.width / 3,
      })
      .clamp({
        left: this.edge.left,
        top: this.edge.top,
        right: this.edge.right,
        bottom: this.edge.bottom,
        direction: 'all',
      })
      .moveCenter(this.center)
      .drag()
      .pinch()
      .wheel()
      .setZoom(Math.min(maxZoomScale, this.viewZoom))
      .on('moved', this.setVisibleRect)
      .on('wheel', (event) =>
        this.event.emit('zoom', event.viewport.lastViewport.scaleX)
      )
      .on('zoomed-end', (event) => {
        this.viewZoom = event.lastViewport.scaleX
      })
    this.viewport.parentGroup = this.group.normal

    this.setVisibleRect()

    // binding destroy event
    this.app.renderer.runners['destroy'].add({
      destroy: this.viewport?.destroy.bind(this.viewport),
    })
    this.app.stage.addChild(this.viewport)

    /* start render */
    this.renderMap()
  }
  updateAPPWidth(width) {
    if (!this.viewport) {
      return
    }
    this.viewport.screenWidth = width
    const maxZoomWidthScale = this.world.width / width
    const maxZoomHeightScale = this.world.height / this.canvas.height
    const maxZoomScale = Math.max(maxZoomWidthScale, maxZoomHeightScale)
    this.event.emit('zoomRange', 1 / maxZoomScale, 3)
    this.viewport.clampZoom({
      maxWidth: width * maxZoomScale,
      minWidth: width / 3,
    })
  }
  setVisibleRect = () => {
    this.visibleRect = this.viewport?.getVisibleBounds()
    this.$minimap && this.$minimap.update()
  }
  createLayer(index) {
    if (this.app.layers[index]) return
    const layer = new Container()
    layer.sortableChildren = true
    layer.zIndex = +index
    this.app.layers[index] = layer
    this.$map.addChild(this.app.layers[index])
  }
  toggleGrid() {
    this.showGrid = !this.showGrid
    this.renderGrid()
  }
  clearMap() {
    // clear task
    this.app.loaderManager && this.app.loaderManager.reset()
    // create new loader
    this.app.loaderManager = new PixiLoaderManager(this.app)
    this.viewport && this.app.stage.removeChild(this.viewport)
    this.$minimap && this.app.stage.removeChild(this.$minimap)
    this.$gridLayer = null
    this.app.layers = {}
  }
  renderMap() {
    this.$map = new Container()
    this.$map.position.set(this.center.x, this.center.y)
    this.$map.sortableChildren = true
    this.viewport.addChild(this.$map)

    times((index) => {
      this.createLayer(index)
    }, 12)
    this.renderMask()
    this.renderBack()
    this.renderObject()
    this.renderGrid()

    this.$minimap = new Minimap(this)
    this.$minimap.renderMinimap(300)
    this.app.stage.addChild(this.$minimap)
  }
  initialFurniture(furnitures) {
    furnitures.forEach((furniture) => {
      const f = new Furniture(this, furniture)
      f.updateGrid(f.position, 1)
      this.furnitures.push(f)
    })
  }
  applyHomeTheme(themes) {
    entries(([key, value]) => {
      const themeType = +value === 0 ? value : `s${value}`
      this.changeHomeTheme(key, themeType)
    }, themes)
  }
  changeHomeTheme(objectType, theme) {
    if (!this.homeObject[objectType]) return
    const objects = values(this.homeObject[objectType])
    objects.forEach((object) => object.changeTheme(theme))
  }
  placeNewFurniture(id, flip = false) {
    if (this.activeFurniture && this.activeFurniture.id === id) return
    /* cancel drag current moving furniture before change */
    this.activeFurniture && this.activeFurniture.cancelDrag()

    const _furniture = new Furniture(this, {
      id: `f${new Date().getTime()}${Math.random().toString(16)}`,
      furnitureID: id,
      flip: !!flip,
      position: {
        z: this.maxZIndex + 1,
      },
    })
    _furniture.isFirst = true
    _furniture.isDrag = true
    this.activeFurniture = _furniture
  }
  renderObject() {
    const allHomeObject = getMapObjects(this.mapData).map(
      (objectData) => new MapObject(this.app, objectData)
    )
    this.homeObject = allHomeObject.reduce((homeObjects, objects) => {
      const objectType = objects.objectType
      if (!homeObjects[objectType]) {
        homeObjects[objectType] = {}
      }
      homeObjects[objectType][objects.objectIndex] = objects
      return homeObjects
    }, {})
    allHomeObject.forEach((obj) => {
      !this.app.layers[obj.layer] && this.createLayer(obj.layer)
      obj.render()
    })
  }
  renderBack() {
    const backLayer = new Container()
    const frontLayer = new Container()
    backLayer.sortableChildren = true
    backLayer.zIndex = -1
    frontLayer.sortableChildren = true
    frontLayer.zIndex = 9999
    this.app.layers.back = backLayer
    this.app.layers.front = frontLayer
    this.$map.addChild(this.app.layers.back, this.app.layers.front)
    const allMapBack = Object.values(this.mapData.back).map(
      (backData, index) => new MapBack(this, backData, index)
    )
    allMapBack.forEach((back) => back.render())
  }
  renderGrid() {
    if (!this.$map) {
      return
    }
    if (this.$gridLayer) {
      this.$gridLayer.alpha = +this.showGrid
    } else {
      this.$gridLayer = new Container()
      this.$gridLayer.zIndex = 999
      this.$gridLayer.alpha = +this.showGrid
      this.$map.addChild(this.$gridLayer)
      /* grid placeable */
      this.gridPlaced = {}
      /* grid position points */
      this.gridPoints = {}

      /* house grid */
      entries(([key, grids]) => {
        const wallKey = `${key}-wall`
        this.gridPlaced[wallKey] = []
        this.gridPlaced[key] = []
        this.gridPoints[key] = {}
        const gridLine = new Graphics()
        gridLine.lineStyle(GRID_LINE_WIDTH, GRID_LINE_STROKE, GRID_LINE_OPACITY)
        gridLine.zIndex = 990
        const row = +grids.row
        const col = +grids.col
        const startX = +grids.left
        const startY = +grids.top
        const endX = startX + col * GRID_WIDTH
        const endY = startY + row * GRID_WIDTH
        gridLine.moveTo(startX, startY)
        gridLine.lineTo(endX, startY)
        gridLine.moveTo(startX, startY)
        gridLine.lineTo(startX, endY)
        /* draw grid and initialize gird placed together */
        times((index) => {
          this.gridPlaced[wallKey].push([])
          this.gridPlaced[key].push([])
          const currentX = startX + (index + 1) * GRID_WIDTH
          gridLine.moveTo(currentX, startY)
          gridLine.lineTo(currentX, endY)
        }, col)
        times((index) => {
          const currentY = startY + (index + 1) * GRID_WIDTH
          gridLine.moveTo(startX, currentY)
          gridLine.lineTo(endX, currentY)
          times((x) => {
            this.gridPlaced[wallKey][x][index] = 0
            this.gridPlaced[key][x][index] = 0
            this.gridPoints[key][`${x},${index}`] = new Point(
              startX + x * GRID_WIDTH,
              startY + index * GRID_WIDTH
            )
          }, col)
        }, row)
        this.$gridLayer.addChild(gridLine)

        /* set disabled */
        grids.disabled &&
          keys(grids.disabled).forEach((position) => {
            const [x, y] = position.split(',').map(Number)
            this.gridPlaced[wallKey][x][y] = 1
            this.gridPlaced[key][x][y] = 1
            gridLine.beginFill(GRID_RESTRICT_BACKGROUND, 0.3)
            gridLine.drawRect(
              startX + x * GRID_WIDTH,
              startY + y * GRID_WIDTH,
              GRID_WIDTH,
              GRID_WIDTH
            )
            gridLine.endFill()
          })
      }, this.mapData.housingGrid)
    }
  }
  updateGridPlaced = (floor, offsetX, offsetY, width, height, mode = 0) => {
    times((x) => {
      times((y) => {
        this.gridPlaced[floor][x + offsetX][y + offsetY] = mode
      }, height)
    }, width)
  }
  renderMask() {
    const mask = new Graphics()
    mask.beginFill(0xffffff)
    mask.moveTo(this.edge.left, this.edge.top)
    mask.lineTo(this.edge.right, this.edge.top)
    mask.lineTo(this.edge.right, this.edge.bottom)
    mask.lineTo(this.edge.left, this.edge.bottom)
    mask.lineTo(this.edge.left, this.edge.top)
    mask.endFill()
    this.$map.addChild(mask)
    this.$map.mask = mask
  }
  destroy() {
    if (this.app) {
      this.app.stop()
      this.app.destroy()
    }
  }
  getFurniture(id) {
    return this.furnitures.find((f) => f.id === id)
  }
  handleUpdateFurnitureZIndex = ({ id, index }) => {
    const furniture = this.getFurniture(id)
    furniture && furniture.moveAt(index)
  }
  handleUpdateFurniture = (e) => {
    const idx = this.furnitures.findIndex((f) => f.id === e.id)
    if (idx === -1) {
      this.furnitures.push(e)
    }
  }
  handleDeleteFurniture = ({ id }) => {
    const idx = this.furnitures.findIndex((f) => f.id === id)
    if (id !== -1) {
      const furniture = this.furnitures[idx]
      /* clear placement */
      furniture.updateGrid(furniture.position, 0)
      furniture.destroyWhenDrag()
      this.furnitures.splice(idx, 1)
    }
  }

  get isEdit() {
    return this._isEdit
  }
  set isEdit(isEdit) {
    this._isEdit = isEdit
    this.showGrid = isEdit
    this.renderGrid()
    this.event.emit('editChange', isEdit)
  }
  get zoom() {
    return this.viewport ? this.viewport.scaled : 1
  }
  set zoom(scale) {
    this.setVisibleRect()
    this.viewport?.setZoom(scale, true)
  }
  get activeFurniture() {
    return this._activeFurniture
  }
  set activeFurniture(activeFurniture) {
    this._activeFurniture = activeFurniture
    if (!activeFurniture) {
      this.event.emit('furnitureCancelPlace')
    }
  }
  get maxZIndex() {
    return this.furnitures.length
      ? Math.max.apply(null, this.furnitures.map(path(['position', 'z'])))
      : 0
  }
  get minZIndex() {
    return this.furnitures.length
      ? Math.min.apply(null, this.furnitures.map(path(['position', 'z'])))
      : 0
  }
  getZIndexCount(index) {
    return this.furnitures.filter(pathEq(['position', 'z'], index)).length
  }
  swapFurnituresIndex(firstZIndex, secondZIndex) {
    const firstFurniture = this.furnitures.find(
      pathEq(['position', 'z'], firstZIndex)
    )
    const secondFurniture = this.furnitures.find(
      pathEq(['position', 'z'], secondZIndex)
    )
    ;[firstFurniture.zIndex, secondFurniture.zIndex] = [
      secondFurniture.zIndex,
      firstFurniture.zIndex,
    ]
  }
}

export default PixiAPP
