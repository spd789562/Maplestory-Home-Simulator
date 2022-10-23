/* components */
import * as filters from 'pixi-filters'
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
  defaultTo,
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
  composeP,
} from 'ramda'
import { entries, mapObject, notNil, notNilOr } from '@utils/ramda'
import {
  getFurnitureImagePath,
  getFurnitureAvatarPath,
} from '@utils/get-image-path'

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
  _flip = false
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
      x: defaultTo(0, furnitureData.position?.x),
      y: defaultTo(0, furnitureData.position?.y),
      z: defaultTo(1, furnitureData.position?.z),
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
    this.stateCount = keys(this.statesData).length
    this.state = 0
    this.stateStage = 'loop'

    this.frames = this.parseFrames()
    this.stageMap = this.parserStageName()
    this.components = {}

    this.$placement = new FurniturePlacement({
      handleMove: this.handleMove,
      handleFlip: this.handleFlip,
      handleDuplicate: this.handleDuplicate,
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
    this.$furniture.hitArea = this.furnitureArea

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
  parserStageName() {
    /* current state and stage corresponding index */
    /* [state]: { [start|loop|end]: number } */
    return map(({ Sections }) => {
      return keys(Sections).reduce((keyMap, key, index) => {
        keyMap[key.toLowerCase()] = index
        return keyMap
      }, {})
    }, this.statesData)
  }
  parseFrames() {
    /* map state */
    return mapObject(([state, { LayerSlots }]) => {
      let _z = 10
      /* map layers */
      return mapObject(([layer, layerData]) => {
        const z = layerData.z ? layerData.z : _z--
        /* map layers */
        return mapObject(([stage, stageData]) => {
          const framsCount = keys(stageData.AnimReference).length
          const frameMaxZ = Math.max(
            ...values(map(prop('z'), stageData.AnimReference))
          )
          const _z = frameMaxZ === -Infinity ? z : frameMaxZ
          /* prevent all frame dont have delay, use generic delay count by total time */
          const defaultDelay =
            (+(stageData.EndPos || 0) - +(stageData.StartPos || 0)) / framsCount
          return {
            name: layer,
            z: _z,
            delay: 0,
            /* map frames */
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
                let _isAvatar = _inlink && _inlink.includes('info/avatar')
                if (_inlink && !_isAvatar) {
                  /* ${furnitureID}/states/${state}/LayerSlots/${layer}/${stage}/AnimReference/${frame} */
                  const linkpath = _inlink.split('/')
                  _id = linkpath[0]
                  _state = linkpath[2]
                  _layer = linkpath[4]
                  _stage = linkpath[5]
                  _frame = linkpath[7]
                }
                const originX = notNil(origin?.x)
                  ? origin.x
                  : notNil(linkObj?.origin?.x)
                  ? linkObj.origin.x
                  : 0
                const originY = notNil(origin?.y)
                  ? origin.y
                  : notNil(linkObj?.origin?.y)
                  ? linkObj.origin.y
                  : 0
                return {
                  frame,
                  x: +originX * -1,
                  y: +originY * -1,
                  size: defaultTo(linkObj?._imageData, _imageData),
                  src: _isAvatar
                    ? getFurnitureAvatarPath({ id: _id })
                    : getFurnitureImagePath({
                        id: _id,
                        state: _state,
                        stage: _stage,
                        layer: _layer,
                        frame: _frame,
                      }),
                  delay: delay || defaultDelay,
                }
              },
              stageData.AnimReference
            ),
          }
        }, layerData)
      }, LayerSlots)
    }, this.statesData)
  }
  get currentStateLayers() {
    return this.frames[this.state]
  }
  get allLayerSrc() {
    return pipe(
      values, // state
      map(
        pipe(
          values, // layer
          map(
            pipe(
              values, // stage
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
    const stageIndex = path([this.state, stage], this.stageMap)
    if (stageIndex === undefined) {
      cb()
      return
    }
    this.clearPreviousFrame()
    this.stateStage = stage
    let doneCount = 0
    let maxLayer = values(this.currentStateLayers).length
    map(({ name, z, delay, frames } = {}) => {
      /* current stage of layer doesn't have any frames */
      if (!frames || !frames.length) {
        maxLayer -= 1
        return
      }
      const componentKey = `${this.state}-${stageIndex}-${name}`
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
        if (doneCount >= maxLayer) {
          this.isPlaying = false
          cb()
        }
      }
      this.isPlaying = true
      this.components[componentKey] = aniSprite
      this.$furniture.addChild(this.components[componentKey])
      aniSprite.play()
    })(map(prop(stageIndex), this.currentStateLayers))
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
      this.$loading?.destroy()
      this.toggleEdit(this.pixiApp.isEdit)
      this.pixiApp.event.on('editChange', this.toggleEdit)
      this.$container
        .on('pointerover', () => {
          ;(this.pixiApp.activeFurniture?.id === this.id ||
            !this.pixiApp.activeFurniture) &&
            !this.$placement.parent &&
            this.$container.addChild(this.$placement)
        })
        .on('pointerdown', (e) => {
          !this.$placement.parent && this.$container.addChild(this.$placement)
          const points = (this.dragEvent || e).data.getLocalPosition(
            this.app.layers[this.layerIndex]
          )
          if (this.furnitureArea.contains(points.x, points.y)) {
            this.$furniture.emit('pointerdown', e)
          }
        })
        .on('pointermove', (event) => {
          this.isDrag && event.stopPropagation()
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
    !this.isFirst && this.updateGrid(this.prevPosition, 0)
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

      this.$placement.parent && this.$container.removeChild(this.$placement)
    } else if (this.isFirst) {
      this.destroyWhenDrag()
    }
  }
  destroyWhenDrag = () => {
    this.isDrag = false
    this.eventData = null
    this.pixiApp.activeFurniture = null
    this.$container?.destroy()
  }
  cancelDrag = () => {
    if (this.pixiApp.isEdit && this.isDrag && this.dragEvent) {
      this.isDrag = false
      this.eventData = null
      this.canPlace = true
      if (this.isFirst) {
        this.destroyWhenDrag()
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

  handleMove = () => {
    this.startDragFurniture()
  }
  handleFlip = () => {
    this.flip = !this.flip
    this.pixiApp.event.emit('furnitureUpdate', this)
  }
  handleDuplicate = () => {
    this.pixiApp.placeNewFurniture(this.furnitureID, this.flip)
    this.$container.emit('pointerout')
  }
  handleUpIndex = () => {
    const nextIndex = this.zIndex + 1
    nextIndex <= this.pixiApp.maxZIndex &&
      this.pixiApp.swapFurnituresIndex(this.zIndex, nextIndex)
  }
  handleDownIndex = () => {
    const nextIndex = this.zIndex - 1
    nextIndex >= this.pixiApp.minZIndex &&
      this.pixiApp.swapFurnituresIndex(this.zIndex, nextIndex)
  }
  handleDelete = () => {
    this.pixiApp.event.emit('furnitureDelete', this)
  }

  moveAt = (index) => {
    this.zIndex = index
    // const _index = Math.min(index, this.pixiApp.furnitures.length - 1)
    // this.app.layers[this.layerIndex].addChildAt(this.$container, _index)
  }

  static onFrameChange(sprite, frames) {
    const data = frames[sprite.currentFrame]
    sprite.animationSpeed = 1 / ((+data.delay || 80) / 16)
    sprite.width = defaultTo(sprite.width, +data.size.w)
    sprite.height = defaultTo(sprite.height, +data.size.h)
    sprite.x = defaultTo(sprite.x, data.x)
    sprite.y = defaultTo(sprite.y, data.y)
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

  get isHover() {
    return this._isHover
  }
  set isHover(isHover) {
    this.$furniture.filters = isHover
      ? [new filters.GlowFilter({ color: 0xffff66 })]
      : []
    this._isHover = isHover
  }

  get zIndex() {
    return this.position.z
  }
  set zIndex(index) {
    const prevIndex = this.zIndex
    this.position.z = index
    this.$container.zIndex = index
    // if (index > prevIndex) {
    //   this.app.layers[this.layerIndex].addChild(this.$container)
    // } else {
    //   this.app.layers[this.layerIndex].addChildAt(this.$container, 0)
    // }
    // const itemIndex = this.app.layers[this.layerIndex].getChildIndex(
    //   this.$container
    // )
    // this.pixiApp.event.emit('furnitureUpdate', this)
    this.pixiApp.event.emit('zIndexUpdate', {
      id: this.id,
      z: index,
      index: index,
    })
  }
}

export default Furniture
