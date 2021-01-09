/* components */
import {
  Application,
  Container,
  AnimatedSprite,
  Sprite,
  Graphics,
} from 'pixi.js-legacy'
import { Viewport } from 'pixi-viewport'
import MapObject from './map-object'
import PixiLoaderManager from './pixi-loader-manager'

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

/* utils */
import { getMapObjectImagePath } from '@utils/get-image-path'

/* mapping */
import MapTheme from '@mapping/map-theme'
import MapObjectMapping from '@mapping/map-object'
import Maps from '@mapping/map'

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

const HF_HEIGHT = 260
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
      transparent: true,
      view: canvasRef,
    })
    this.showGrid = true
    this.app.loaderManager = new PixiLoaderManager(this.app)
    this.app.layers = {}
  }
  /**
   * @param {string} selectId
   */
  changeHomeMap(selectId) {
    this.selectedMapTheme = MapTheme[selectId]
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
      x: +this.mapData.miniMap.centerX || Math.abs(this.edge.left),
      y: +this.mapData.miniMap.centerY || Math.abs(this.edge.top),
    }
    this.world = {
      width:
        this.mapData.miniMap.width ||
        Math.abs(this.edge.right) + Math.abs(this.edge.left),
      height:
        this.mapData.miniMap.height ||
        Math.abs(this.edge.top) + Math.abs(this.edge.bottom),
    }

    this.viewport = new Viewport({
      screenWidth: this.canvas.width,
      screenHeight: this.canvas.height,
      worldWidth: this.world.width,
      worldHeight: this.world.height,
      interaction: this.app.renderer.plugins.interaction,
    })
      // limit zoom range
      .clampZoom({
        maxWidth: this.world.width + this.canvas.width,
        maxHeight: this.world.height + this.canvas.height,
      })
      .moveCenter(this.center)
      .drag()
      .pinch()
      .wheel()

    // binding destory event
    this.app.renderer.runners['destroy'].add({
      destroy: this.viewport.destroy.bind(this.viewport),
    })
    this.app.stage.addChild(this.viewport)

    /* start render */
    this.renderMap()
  }
  createLayer(index) {
    if (this.app.layers[index]) return
    const layer = new Container()
    layer.sortableChildren = true
    this.app.layers[index] = layer
    this.$map.addChild(this.app.layers[index])
  }
  toggleGrid() {
    this.showGrid = !this.showGrid
    this.renderGrid()
  }
  renderMap() {
    this.$map = new Container()
    this.$map.position.set(this.center.x, this.center.y)
    this.$map.sortableChildren = true
    this.viewport.addChild(this.$map)

    this.renderObject()
    this.renderGrid()
  }
  changeHomeTheme(objectType, theme) {
    if (!this.homeObject[objectType]) return
    const objects = values(this.homeObject[objectType])
    objects.forEach((object) => object.changeTheme(theme))
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
  renderBack() {}
  renderGrid() {
    if (this.$layer) {
      this.$layer.alpha = +this.showGrid
    } else {
      /* remove previous layer */
      this.$layer && this.$map.removeChild(this.$layer)

      this.$layer = new Container()
      this.$layer.zIndex = 999
      this.$map.addChild(this.$layer)

      /* just basic coordinate */
      const line = new Graphics()
      line.lineStyle(2, 0x000000, 1)
      line.moveTo(this.edge.left, 0)
      line.lineTo(this.edge.right, 0)
      line.moveTo(0, this.edge.top)
      line.lineTo(0, this.edge.bottom)
      this.$layer.addChild(line)

      /* house grid */
      values(this.mapData.housingGrid).forEach((grids) => {
        const gridLine = new Graphics()
        gridLine.lineStyle(2, 0x333333, 1)
        gridLine.zIndex = 990
        const gridUnit = 30
        const row = +grids.row
        const col = +grids.col
        const startX = +grids.left
        const startY = +grids.top
        const endX = startX + col * gridUnit
        const endY = startY + row * gridUnit
        times((index) => {
          const currentY = startY + index * gridUnit
          gridLine.moveTo(startX, currentY)
          gridLine.lineTo(endX, currentY)
        }, row + 1)
        times((index) => {
          const currentX = startX + index * gridUnit
          gridLine.moveTo(currentX, startY)
          gridLine.lineTo(currentX, endY)
        }, col + 1)
        this.$layer.addChild(gridLine)
      })
    }
  }

  destory() {
    this.app.stop()
    this.app.destroy()
  }
}

export default PixiAPP
