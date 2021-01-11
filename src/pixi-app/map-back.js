/* components */
import { AnimatedSprite, TilingSprite } from 'pixi.js-legacy'

/* utils */
import {
  clone,
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
      cx,
      cy,
      a: aphla,
    } = backData

    const backType = this.animated ? 'ani' : 'back'

    this.dataPath = { homeType, backType, backIndex }

    this.data = MapBackMapping[homeType][backType][backIndex]

    this.layer = +front === 0 ? 'back' : 'front'
    this.flip = !!+f
    this.type = +type
    this.offset = { x: +x, y: +y }
    this.paralle = { x: +rx, y: +y }
    this.copies = { x: +cx, y: +cy }
    this.z = index
    this.aphla = Math.floor(+aphla / 255)
    this.animated = ani === '1'
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
      if ((this.type === 3 || this.type === 1) && this.copies.x === 0) {
        this.sprite = new TilingSprite(
          this.app.loader.resources[this.framesSrc[0]].texture,
          this.pixiApp.world.width,
          +size.height
        )
        this.sprite.x = this.pixiApp.edge.left
        this.sprite.y = y
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
}

export default MapBack
