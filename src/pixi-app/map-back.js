/* components */
import {
  AnimatedSprite,
  TilingSprite,
  Graphics,
  Sprite,
  Rectangle,
  Texture,
} from 'pixi.js-legacy'
import GapTilingSprite from './gap-tiling-sprite'

/* utils */
import {
  clone,
  includes,
  map,
  path,
  pickBy,
  pipe,
  prop,
  toPairs,
  uniq,
  values,
} from 'ramda'
import { getMapBackImagePath } from '@utils/get-image-path'

/* mapping */
import MapBackMapping from '@mapping/map-back'

class MapBack {
  constructor(pixiApp, backData, index) {
    this.pixiApp = pixiApp
    this.app = this.pixiApp.app
    const {
      bS: homeType,
      no: backIndex,
      front,
      ani,
      f,
      x,
      y,
      rx,
      ry,
      type,
      cx = 0,
      cy = 0,
      flowX,
      flowY,
      a: aphla,
    } = backData

    const backType = this.animated ? 'ani' : 'back'

    this.dataPath = { homeType, backType, backIndex }

    this.data = MapBackMapping[`${homeType}.img`][backType][backIndex]

    this.layer = +front === 0 ? 'back' : 'front'
    this.flip = !!+f
    this.type = +type
    this.offset = { x: +x, y: +y }
    this.paralle = { x: +rx, y: +y }
    this.copies = { x: +cx, y: +cy }
    this.z = index
    this.aphla = Math.floor(+aphla / 255)
    this.animated = ani === '1'

    this.isMove = !!flowX || !!flowY
    this.move = {
      x: +flowX || 0,
      y: +flowY || 0,
    }
  }
  get frames() {
    const backs = this.animated ? values(this.data) : [this.data]
    return map(
      (
        { origin = {}, _imageData = {}, delay = 0, _inlink, _outlink } = {},
        index
      ) => {
        const linkPath = _inlink
          ? [this.dataPath.homeType, ..._inlink.split('/')]
          : _outlink
          ? [..._outlink.replace(/^Map\/Back\//, '').split('/')]
          : null

        const linkObj = linkPath ? path(linkPath, MapBackMapping) : null
        const originX = linkObj?.origin?.x || origin.x
        const originY = linkObj?.origin?.y || origin.y
        return {
          x: +originX * -1 + this.offset.x,
          y: +originY * -1 + this.offset.y,
          size: linkObj?._imageData || _imageData,
          src: getMapBackImagePath({
            ...this.dataPath,
            frame: this.animated ? index : null,
          }),
          delay,
        }
      }
    )(backs)
  }
  get framesSrc() {
    return this.frames.map(prop('src'))
  }
  render() {
    const { x, y, size } = this.frames[0]
    this.app.loaderManager.load(this.framesSrc, () => {
      // only repeat place 0 or negitive gep back
      if (this.type > 0 && this.type < 4) {
        this.sprite = new GapTilingSprite({
          texture: this.app.loader.resources[this.framesSrc[0]].texture,
          scene: {
            edge: this.pixiApp.edge,
            center: this.pixiApp.center,
          },
          size: map(Number, size),
          gap: this.copies,
          position: { x, y },
          mode: this.type,
        })
        if (this.isMove) {
          this.app.ticker.add(this.moveTicker)
        }
      } else {
        this.sprite = new AnimatedSprite(
          this.framesSrc.map((src) => this.app.loader.resources[src].texture)
        )
        this.sprite.width = +size.width
        this.sprite.height = +size.height
        if (this.animated) {
          this.sprite.animationSpeed = 1 / ((this.frames[0].delay || 80) / 16)
          this.sprite.play()
          this.app.ticker.add(this.animationTicker)
        }
        this.sprite.x = x
        this.sprite.y = y
      }
      this.sprite.zIndex = this.z
      this.app.layers[this.layer].addChild(this.sprite)
    })
  }
  animationTicker = () => {
    if (!this.sprite) return
    const data = this.frames[this.sprite.currentFrame]
    this.sprite.width = +data.size.width || this.sprite.width
    this.sprite.height = +data.size.height || this.sprite.height
    this.sprite.x = data.x || this.sprite.x
    this.sprite.y = data.y || this.sprite.y
  }
  moveTicker = () => {
    if (!this.sprite) return
    this.sprite.tilePosition.x += this.move.x
    this.sprite.tilePosition.y += this.move.y
  }
}

export default MapBack
