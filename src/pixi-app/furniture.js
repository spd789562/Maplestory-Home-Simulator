/* components */
import { AnimatedSprite, Container } from 'pixi.js-legacy'
import Loading from './component/loading'

/* utils */
import {
  flatten,
  includes,
  keys,
  map,
  multiply,
  path,
  pickBy,
  pipe,
  prop,
  values,
  __,
} from 'ramda'
import { entries, mapObject } from '@utils/ramda'
import { getFurnitureImagePath } from '@utils/get-image-path'

/* mapping */
import { GRID_WIDTH } from './constant'
import FurnitureMapping from '@mapping/furniture'

const FURNITURE_ID = '02672080'

const getLayers = pickBy((_, key) => includes('layer', key))
const getFrames = pickBy((_, key) => !Number.isNaN(+key))
const keyIsStage = includes(__, ['start', 'loop', 'end'])

class Furniture {
  constructor(pixiApp, furnitureData) {
    this.pixiApp = pixiApp
    this.app = pixiApp.app
    this.id = furnitureData.id
    this.wz = FurnitureMapping[furnitureData.id]
    this.grid = {
      x: +this.wz.info.gridX,
      y: +this.wz.info.gridY,
    }
    this.gridSize = map(multiply(GRID_WIDTH), this.grid)
    this.offset = {
      x: (this.grid.x * GRID_WIDTH) / 2,
      y: this.grid.y * GRID_WIDTH,
    }
    this.vertexOffset = {
      x: -this.offset.x,
      y: -this.offset.y / 2,
    }
    this.position = {
      x: furnitureData.position?.x || 0,
      y: furnitureData.position?.y || 0,
      z: 1,
      floor: furnitureData.position?.floor || 0,
    }
    this.floorBasic = {
      x: +pixiApp.mapData.housingGrid['1stFloor'].left,
      y: +pixiApp.mapData.housingGrid['1stFloor'].top,
    }

    this.statesData = this.wz.states
      ? this.wz.states
      : { 0: { loop: getLayers(this.wz) } }
    this.stateCount = keys(this.statesData).length
    this.state = 0
    this.stateStage = 'loop'

    this.frames = this.parseFrames()
    this.components = {}

    this.$container = new Container()
    this.$furniture = new Container()
    this.$furniture.sortableChildren = true

    this.$container.x = this.floorBasic.x + GRID_WIDTH * 5 + this.offset.x
    this.$container.y = this.floorBasic.y + this.offset.y
    this.$container.sortableChildren = true
    this.$container.addChild(this.$furniture)

    this.app.layers[4].addChild(this.$container)

    this.canMove = true
    this.canPlace = false
    this.isDrag = false

    this.$loading = new Loading(this.gridSize.x, this.gridSize.y)
    this.$loading.y = -this.offset.y / 2
    this.$container.addChild(this.$loading)

    this.render()
  }
  parseFrames() {
    const isState = this.stateCount !== 1
    return mapObject(([state, stateData]) => {
      const hasStage = !!keys(stateData).find(keyIsStage)
      return mapObject(
        ([stage, stageData]) =>
          mapObject(
            ([layer, layerData]) => ({
              name: layer,
              z: +layerData.z || 0,
              delay: +layerData.delay || 0,
              frames: entries(
                ([
                  frame,
                  { origin = {}, _imageData = {}, delay = 0, _inlink } = {},
                ]) => {
                  const linkObj = _inlink
                    ? path(_inlink.split('/'), FurnitureMapping)
                    : null
                  let _id = this.id
                  let _state = state
                  let _stage = stage
                  let _layer = layer
                  let _frame = frame
                  let _isState = isState
                  let _hasStage = hasStage
                  if (_inlink) {
                    const linkpath = _inlink.split('/')
                    const lastIndex = linkpath.length - 1
                    _id = linkpath[0]
                    _isState = linkpath[1] === 'states'
                    _state = _isState ? linkpath[2] : 0
                    _hasStage = keyIsStage(linkpath[3])
                    _stage = _hasStage ? linkpath[3] : null
                    _layer = linkpath[lastIndex - 1]
                    _frame = linkpath[lastIndex]
                  }
                  const originX = linkObj?.origin?.x || origin.x
                  const originY = linkObj?.origin?.y || origin.y

                  return {
                    frame,
                    x: +originX * -1,
                    y: +originY * -1,
                    size: linkObj?._imageData || _imageData,
                    src: getFurnitureImagePath({
                      id: _id,
                      state: _state,
                      stage: _stage,
                      layer: _layer,
                      frame: _frame,
                      isState: _isState,
                      hasStage: _hasStage,
                    }),
                    delay,
                  }
                },
                getFrames(layerData)
              ),
            }),
            getLayers(stageData)
          ),
        hasStage ? stateData : { loop: stateData }
      )
    }, this.statesData)
  }
  get currentFrames() {
    return this.frames[this.state][this.stateStage]
  }
  get allLayerSrc() {
    return pipe(
      values, // state
      map(
        pipe(
          values, // stage
          map(
            pipe(
              values, // layer
              map(pipe(prop('frames'), map(prop('src'))))
            )
          )
        )
      ),
      flatten
    )(this.frames)
  }
  get nextState() {
    const next = this.state + 1
    return next > this.stateCount - 1 ? 0 : next
  }
  changeState = (state) => {
    if (this.isPlaying) return
    const _state = this.nextState
    this.playEnd(() => {
      this.state = _state
      this.playStart()
    })
  }
  clearPreviousFrame() {
    this.$furniture.removeChildren()
  }
  playStart() {
    if (!this.frames[this.state]?.start) {
      this.playLoop()
      return
    }
    this.clearPreviousFrame()
    this.stateStage = 'start'
    let doneCount = 0
    const maxFrame = values(this.currentFrames).length
    map(({ name, z, delay, frames }) => {
      const componentKey = `${this.state}-start-${name}`
      const aniSprite = new AnimatedSprite(
        frames.map(({ src }) => this.app.loader.resources[src].texture)
      )
      aniSprite.animationSpeed = 1 / ((delay || 80) / 16)
      aniSprite.zIndex = z
      aniSprite.loop = false
      const onFrameChange = () => Furniture.onFrameChange(aniSprite, frames)
      onFrameChange()
      aniSprite.onFrameChange = onFrameChange
      aniSprite.onComplete = () => {
        doneCount += 1
        if (doneCount >= maxFrame) {
          this.isPlaying = false
          this.playLoop()
        }
      }
      this.isPlaying = true
      this.components[componentKey] = aniSprite
      this.$furniture.addChild(this.components[componentKey])
      aniSprite.play()
    })(this.currentFrames)
  }
  playLoop() {
    this.clearPreviousFrame()
    this.stateStage = 'loop'
    map(({ name, z, delay, frames }) => {
      const componentKey = `${this.state}-loop-${name}`
      const aniSprite = new AnimatedSprite(
        frames.map(({ src }) => this.app.loader.resources[src].texture)
      )
      aniSprite.animationSpeed = 1 / ((delay || 80) / 16)
      aniSprite.zIndex = z
      const onFrameChange = () => Furniture.onFrameChange(aniSprite, frames)
      onFrameChange()
      aniSprite.onFrameChange = onFrameChange
      this.components[componentKey] = aniSprite
      this.$furniture.addChild(this.components[componentKey])
      aniSprite.play()
    })(this.currentFrames)
  }
  playEnd(cb = identity) {
    if (!this.frames[this.state]?.end) {
      cb()
      return
    }
    this.clearPreviousFrame()
    this.stateStage = 'end'
    let doneCount = 0
    const maxFrame = values(this.currentFrames).length
    map(({ name, z, delay, frames }) => {
      const componentKey = `${this.state}-end-${name}`
      const aniSprite = new AnimatedSprite(
        frames.map(({ src }) => this.app.loader.resources[src].texture)
      )
      aniSprite.animationSpeed = 1 / ((delay || 80) / 16)
      aniSprite.zIndex = z
      aniSprite.loop = false
      const onFrameChange = () => Furniture.onFrameChange(aniSprite, frames)
      onFrameChange()
      aniSprite.onFrameChange = onFrameChange
      aniSprite.onComplete = () => {
        doneCount += 1
        if (doneCount >= maxFrame) {
          this.isPlaying = false
          cb()
        }
      }
      this.isPlaying = true
      this.components[componentKey] = aniSprite
      this.$furniture.addChild(this.components[componentKey])
      aniSprite.play()
    })(this.currentFrames)
  }
  render() {
    // const isAnimation = this.frames.length > 1
    // const renderTheme = this.theme
    // if (this.sprite) {
    //   this.sprite.alpha = !this.frames.length ? 0 : 1
    // }
    // const { x, y, size } = this.frames[0] || {}
    this.app.loaderManager.load(this.allLayerSrc, () => {
      this.$loading.destroy()

      this.$furniture.interactive = true
      this.$furniture.buttonMode = true
      this.$furniture
        .on('pointerdown', (e) => {
          if (this.isDrag && this.canPlace) {
            this.isDrag = false
            this.placeFurniture()
          } else if (this.canMove) {
            this.startDragFurniture(e)
          } else {
            this.changeState()
          }
        })
        .on('pointermove', this.dragFurniture)
      this.playStart()
    })
  }

  autoStickGrid(mousePoint) {
    let nearest = null
    entries(([floor, points]) => {
      entries(([pos, point]) => {
        if (
          Math.abs(mousePoint.x + this.vertexOffset.x - point.x) <
            GRID_WIDTH / 2 &&
          Math.abs(mousePoint.y + this.vertexOffset.y - point.y) <
            GRID_WIDTH / 2
        ) {
          nearest = point
          const [x, y] = pos.split(',')
          this.position.floor = floor
          this.position.x = +x
          this.position.y = +y
        }
      }, points)
    }, this.pixiApp.gridPoints)
    if (nearest) {
      this.$container.position.set(
        nearest.x + this.offset.x,
        nearest.y + this.offset.y
      )
    } else {
      this.isOut = true
      this.$container.position.set(
        mousePoint.x,
        mousePoint.y + this.gridSize.y / 2
      )
    }
  }

  checkPlaceable() {
    return true
  }

  startDragFurniture = (event) => {
    this.isDrag = true
    this.dragEvent = event
  }
  dragFurniture = () => {
    if (this.isDrag && this.dragEvent) {
      const mapPosition = this.dragEvent.data.getLocalPosition(
        this.app.layers[4]
      )
      this.autoStickGrid(mapPosition)
      this.canPlace = this.checkPlaceable()
    }
  }
  placeFurniture = () => {
    if (this.canPlace) {
      this.isDrag = false
      this.eventData = null
    }
  }

  static onFrameChange(sprite, frames) {
    const data = frames[sprite.currentFrame]
    sprite.animationSpeed = 1 / ((+data.delay || 80) / 16)
    sprite.width = +data.size.width || sprite.width
    sprite.height = +data.size.height || sprite.height
    sprite.x = data.x || sprite.x
    sprite.y = data.y || sprite.y
  }
}

export default Furniture
