/* components */
import {
  AnimatedSprite,
  Container,
  Graphics,
  Point,
  Rectangle,
} from 'pixi.js-legacy'
import Loading from './component/loading'
import FurniturePlacement from './component/furniture-placement'

/* utils */
import {
  any,
  clone,
  flatten,
  identity,
  includes,
  isNil,
  keys,
  map,
  multiply,
  path,
  pickBy,
  pipe,
  prop,
  times,
  values,
  __,
} from 'ramda'
import { entries, mapObject } from '@utils/ramda'
import { getFurnitureImagePath } from '@utils/get-image-path'

/* mapping */
import {
  GRID_WIDTH,
  FURNITURE_RESTRICT_BACKGROUND,
  FURNITURE_ALLOWABLE_BACKGROUND,
} from './constant'
import FurnitureMapping from '@mapping/furniture'

const FURNITURE_ID = '02672080'

const getLayers = pickBy((_, key) => includes('layer', key))
const getFrames = pickBy((_, key) => !Number.isNaN(+key))
const keyIsStage = includes(__, ['start', 'loop', 'end'])

class Furniture {
  constructor(pixiApp, furnitureData) {
    this.pixiApp = pixiApp
    this.app = pixiApp.app
    if (!furnitureData.furnitureID) return null
    this.id = furnitureData.id
    this.furnitureID = furnitureData.furnitureID.toString().padStart(8, '0')

    this.wz = FurnitureMapping[this.furnitureID]
    if (!this.wz) return null
    /**
     * grid count
     * @type {Point}
     */
    this.grid = {
      x: +this.wz.info.gridX,
      y: +this.wz.info.gridY,
    }
    /**
     * grid actual width
     * @type {Point}
     */
    this.gridSize = map(multiply(GRID_WIDTH), this.grid)
    /**
     * furniture place offset
     * @type {Point}
     */
    this.offset = {
      x: (this.grid.x * GRID_WIDTH) / 2,
      y: this.grid.y * GRID_WIDTH,
    }
    /**
     * furniture vertex offset
     * @type {Point}
     */
    this.vertexOffset = {
      x: -this.offset.x,
      y: -this.offset.y / 2,
    }
    this.position = {
      x: furnitureData.position?.x || 0,
      y: furnitureData.position?.y || 0,
      z: 1,
      floor:
        (furnitureData.position?.floor &&
          pixiApp.mapData.housingGrid[furnitureData.position.floor] &&
          furnitureData.position.floor) ||
        keys(pixiApp.mapData.housingGrid)[0],
    }
    this.prevPosition = clone(this.position)
    this.isWall = this.furnitureID.startsWith('02671')
    this.layerIndex = this.isWall ? 3 : 4

    this.statesData = this.wz.states
      ? this.wz.states
      : { 0: { loop: getLayers(this.wz) } }
    this.stateCount = keys(this.statesData).length
    this.state = 0
    this.stateStage = 'loop'

    this.frames = this.parseFrames()
    this.components = {}

    this.$placement = new FurniturePlacement({
      handleFlip: this.handleFlip,
      handleUpIndex: this.handleUpIndex,
      handleDownIndex: this.handleDownIndex,
      handleDelete: this.handleDelete,
    })
    this.$placement.x = -this.offset.x
    this.$placement.y = -this.offset.y - 42
    this.$placement.parentGroup = pixiApp.group.drag

    /**
     * Whole Furniture Layer
     * @type {Container}
     */
    this.$container = new Container()

    /**
     * Furniture Frames Layer
     * @type {Container}
     */
    this.$furniture = new Container()
    this.$furniture.sortableChildren = true

    /**
     * Initialize position
     * @type {Container}
     */
    this.$container.x =
      this.floorBasic.x + GRID_WIDTH * this.position.x + this.offset.x
    this.$container.y =
      this.floorBasic.y + GRID_WIDTH * this.position.y + this.offset.y
    this.$container.sortableChildren = true
    this.$container.zIndex = this.position.z
    this.$container.addChild(this.$furniture)

    this.app.layers[this.layerIndex].addChild(this.$container)

    this.canMove = true
    this.canPlace = true
    this.isDrag = false
    this.flip = !!furnitureData.flip

    this.$loading = new Loading(this.gridSize.x, this.gridSize.y)
    this.$loading.y = -this.offset.y / 2
    this.$container.addChild(this.$loading)

    this.render()
    this.renderRestrict()
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
                  let _id = this.furnitureID
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
    if ((this.stateStage !== 'loop' && this.isPlaying) || this.stateCount === 1)
      return
    const _state = this.nextState
    this.play('end', () => {
      this.state = _state
      this.playStart()
    })
  }
  clearPreviousFrame() {
    this.$furniture.removeChildren()
  }
  play(stage, cb = identity) {
    if (!path([this.state, stage], this.frames)) {
      cb()
      return
    }
    this.clearPreviousFrame()
    this.stateStage = stage
    let doneCount = 0
    const maxFrame = values(this.currentFrames).length
    map(({ name, z, delay, frames }) => {
      const componentKey = `${this.state}-${stage}-${name}`
      const aniSprite = new AnimatedSprite(
        frames.map(({ src }) => this.app.loader.resources[src].texture)
      )
      aniSprite.animationSpeed = 1 / ((delay || 80) / 16)
      aniSprite.zIndex = z
      aniSprite.loop = stage === 'loop'
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
  playStart() {
    this.play('start', () => {
      this.play('loop')
    })
  }
  toggleEdit = (isEdit) => {
    this.canMove = isEdit
    this.$container.interactive = isEdit
    this.$container.buttonMode = isEdit
    this.$furniture.interactive = this.stateCount > 1 || isEdit
    this.$furniture.buttonMode = this.stateCount > 1 || isEdit
  }
  render() {
    this.app.loaderManager.load(this.allLayerSrc, () => {
      this.$loading.destroy()
      this.toggleEdit(this.pixiApp.isEdit)
      this.pixiApp.event.on('editChange', this.toggleEdit)
      this.$container
        .on('pointerover', () => {
          !this.$placement.parent && this.$container.addChild(this.$placement)
        })
        .on('pointerdown', (e) => {
          const points = (this.dragEvent || e).data.getLocalPosition(
            this.app.layers[this.layerIndex]
          )
          if (this.furnitureArea.contains(points.x, points.y)) {
            this.$furniture.emit('pointerdown', e)
          }
        })
        .on('pointerout', () => {
          this.$placement.parent && this.$container.removeChild(this.$placement)
        })

      this.$furniture
        .on('pointerdown', (e) => {
          if (this.isDrag) {
            this.placeFurniture()
          } else if (this.pixiApp.isEdit) {
            this.startDragFurniture(e)
          } else {
            this.changeState()
          }
        })
        .on('pointermove', this.dragFurniture)
      this.playStart()
    })
  }
  renderRestrict() {
    if (this.$restrict) {
      this.$restrict.alpha = this.canPlace ? 0 : 1
      this.$allowance.alpha =
        this.canPlace && this.pixiApp.isEdit && this.isDrag ? 1 : 0
    } else {
      this.$restrict = new Graphics()
      this.$restrict.beginFill(FURNITURE_RESTRICT_BACKGROUND, 0.6)
      this.$restrict.drawRect(
        -this.offset.x,
        -this.offset.y,
        this.gridSize.x,
        this.gridSize.y
      )
      this.$restrict.endFill()
      this.$restrict.zIndex = 999
      this.$restrict.alpha = this.canPlace ? 0 : 1
      this.$allowance = new Graphics()
      this.$allowance.beginFill(FURNITURE_ALLOWABLE_BACKGROUND, 0.3)
      this.$allowance.drawRect(
        -this.offset.x,
        -this.offset.y,
        this.gridSize.x,
        this.gridSize.y
      )
      this.$allowance.endFill()
      this.$allowance.zIndex = 999
      this.$allowance.alpha = this.canPlace && this.pixiApp.isEdit ? 1 : 0
      this.$container.addChild(this.$restrict)
      this.$container.addChild(this.$allowance)
    }
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
      this.isOut = false
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

  checkGridInteraction(gridPlaced) {
    return (
      this.isOut ||
      any((x) => {
        const pos_x = this.position.x + x
        return (
          !gridPlaced[pos_x] ||
          any((y) => {
            const pos_y = this.position.y + y
            const occupied = gridPlaced[pos_x][pos_y]
            return isNil(occupied) || occupied === 1
          }, times(identity, this.grid.y))
        )
      }, times(identity, this.grid.x))
    )
  }

  checkPlaceable() {
    const floor = `${this.position.floor}${this.isWall ? '-wall' : ''}`
    if (!this.isWall) {
      const bottom_x = this.position.x + this.grid.x
      const bottom_y = this.position.y + this.grid.y
      const gridPlaced = this.pixiApp.gridPlaced[floor]
      const gridPlacedX = gridPlaced[bottom_x - 1]
      if (
        !gridPlacedX ||
        isNil(gridPlacedX[bottom_y - 1]) ||
        bottom_y < gridPlacedX.length
      ) {
        return false
      }
    }
    const hasInteraction = this.checkGridInteraction(
      this.pixiApp.gridPlaced[floor]
    )
    return !hasInteraction
  }

  startDragFurniture = (event) => {
    this.isDrag = true
    this.dragEvent = event
    this.pixiApp.activeFurniture = this
    // add furniture to drag group
    this.$container.parentGroup = this.pixiApp.group.drag
    this.renderRestrict()
    /* clear placed */
    this.updateGrid(this.prevPosition, 0)
  }
  dragFurniture = (event) => {
    if (this.isDrag) {
      if (this.dragEvent) {
        const mapPosition = this.dragEvent.data.getLocalPosition(
          this.app.layers[this.layerIndex]
        )
        this.autoStickGrid(mapPosition)
        this.canPlace = this.checkPlaceable()
        this.renderRestrict()
      } else {
        this.startDragFurniture(event)
      }
    }
  }
  placeFurniture = () => {
    if (this.canPlace) {
      this.isDrag = false
      this.eventData = null
      // remove furniture from drag group
      this.$container.parentGroup = null
      this.$container._activeParentLayer = null
      this.renderRestrict()
      this.updateGrid(this.position, 1)
      /* resetPrevious */
      this.prevPosition = clone(this.position)

      this.pixiApp.activeFurniture = null
      this.isFirst = false
      this.pixiApp.event.emit('furnitureUpdate', this)
    } else if (this.isFirst) {
      this.destoryWhenDrag()
    }
  }
  destoryWhenDrag = () => {
    this.isDrag = false
    this.eventData = null
    this.pixiApp.activeFurniture = null
    this.$container.destroy()
  }
  cancelDrag = () => {
    if (this.pixiApp.isEdit && this.isDrag && this.dragEvent) {
      this.isDrag = false
      this.eventData = null
      this.canPlace = true
      if (this.isFirst) {
        this.destoryWhenDrag()
        return
      }
      this.renderRestrict()
      this.updateGrid(this.prevPosition, 1)
      this.position = clone(this.prevPosition)

      /* restore position */
      this.isOut = false
      this.$container.position.set(
        this.floorBasic.x + this.position.x * GRID_WIDTH + this.offset.x,
        this.floorBasic.y + this.position.y * GRID_WIDTH + this.offset.y
      )

      this.pixiApp.activeFurniture = null
    }
  }

  updateGrid = (position, mode) => {
    const { floor, x: offsetX, y: offsetY } = position
    const _floor = `${floor}${this.isWall ? '-wall' : ''}`
    this.pixiApp.updateGridPlaced(
      _floor,
      offsetX,
      offsetY,
      this.grid.x,
      this.grid.y,
      mode
    )
  }

  handleFlip = () => {
    this.flip = !this.flip
    this.pixiApp.event.emit('furnitureUpdate', this)
  }
  handleUpIndex = () => {
    const maxIndex = this.pixiApp.maxZIndex
    const nextIndex = this.zIndex + 1
    const maxIndexFurnitureCount = this.pixiApp.getZIndexCount(maxIndex)
    const currentIndexCount = this.pixiApp.getZIndexCount(this.zIndex)
    if (
      nextIndex === maxIndex &&
      currentIndexCount === 1 &&
      maxIndexFurnitureCount === 1
    ) {
      this.pixiApp.swapFurnituresIndex(this.zIndex, maxIndex)
    } else if (nextIndex < maxIndex || maxIndexFurnitureCount > 1) {
      this.zIndex = nextIndex
    }
  }
  handleDownIndex = () => {
    const minIndex = this.pixiApp.minZIndex
    const nextIndex = this.zIndex - 1
    const minIndexFurnitureCount = this.pixiApp.getZIndexCount(minIndex)
    const currentIndexCount = this.pixiApp.getZIndexCount(this.zIndex)
    if (
      nextIndex === minIndex &&
      currentIndexCount === 1 &&
      minIndexFurnitureCount === 1
    ) {
      this.pixiApp.swapFurnituresIndex(this.zIndex, minIndex)
    } else if (nextIndex > minIndex || minIndexFurnitureCount > 1) {
      this.zIndex = nextIndex
    }
  }
  handleDelete = () => {
    /* clear placed */
    this.updateGrid(this.position, 0)
    this.pixiApp.event.emit('furnitureDelete', this)
    this.$container.destroy()
  }

  static onFrameChange(sprite, frames) {
    const data = frames[sprite.currentFrame]
    sprite.animationSpeed = 1 / ((+data.delay || 80) / 16)
    sprite.width = +data.size.width || sprite.width
    sprite.height = +data.size.height || sprite.height
    sprite.x = data.x || sprite.x
    sprite.y = data.y || sprite.y
  }

  /**
   * current floor vertex position
   * @type {Point}
   */
  get floorBasic() {
    return {
      x: +this.pixiApp.mapData.housingGrid[this.position.floor].left,
      y: +this.pixiApp.mapData.housingGrid[this.position.floor].top,
    }
  }

  get furnitureArea() {
    return new Rectangle(
      this.$container.position.x - this.offset.x,
      this.$container.position.y - this.offset.y,
      this.gridSize.x,
      this.gridSize.y
    )
  }

  get flip() {
    return this._flip
  }
  set flip(isFlip) {
    this.$furniture.scale.x *= this._flip !== isFlip ? -1 : 1
    this._flip = isFlip
  }

  get zIndex() {
    return this.position.z
  }
  set zIndex(index) {
    this.position.z = index
    this.$container.zIndex = index
    if (index > this.zIndex) {
      this.app.layers[this.layerIndex].addChild(this.$container)
    } else {
      this.app.layers[this.layerIndex].addChildAt(this.$container, 0)
    }
    this.pixiApp.event.emit('furnitureUpdate', this)
    this.pixiApp.event.emit('zIndexUpdate', this.pixiApp.furnitures)
  }
}

export default Furniture
