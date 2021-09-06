/* components */
import { AnimatedSprite } from 'pixi.js-legacy'

/* utils */
import { clone, has, map, path, pickBy, pipe, prop, toPairs, uniq } from 'ramda'
import { getMapObjectImagePath } from '@utils/get-image-path'

/* mapping */
import MapObjectMapping from '@mapping/map-object'

class MapObject {
  constructor(app, objectData) {
    this.app = app
    const {
      layer,
      x,
      y,
      z,
      name,
      oS: wzType,
      l0: homeType,
      l1: objectType,
      l2: objectIndex,
    } = objectData
    this.dataPath = { wzType, homeType, objectType, objectIndex }
    const objs = MapObjectMapping[wzType][homeType][objectType][objectIndex]
    const defaultFrames = pipe(
      pickBy((_, key) => !Number.isNaN(+key)),
      map(clone)
    )(objs)
    this.themeData = pickBy((_, key) => key === '0' || Number.isNaN(+key), {
      ...objs,
      0: defaultFrames,
    })
    this.layer = layer
    this.position = { x: +x, y: +y, z: +z }
    this.theme = '0'
    this.objectType = name || objectType
    this.objectIndex = objectIndex
  }
  get frames() {
    const currentObject = this.themeData[this.theme]
    return pipe(
      toPairs,
      map(
        ([
          frame,
          { origin = {}, _imageData = {}, delay = 0, _inlink } = {},
        ]) => {
          const linkObj = _inlink
            ? path(
                [this.dataPath.wzType, ..._inlink.split('/')],
                MapObjectMapping
              )
            : null
          const originX = origin?.x || linkObj?.origin?.x
          const originY = origin?.y || linkObj?.origin?.y
          return {
            frame,
            x: +originX * -1 + this.position.x,
            y: +originY * -1 + this.position.y,
            size: linkObj?._imageData || _imageData,
            src: getMapObjectImagePath({
              wzType: this.dataPath.wzType,
              homeType: this.dataPath.homeType,
              objectType: this.dataPath.objectType,
              objectIndex: this.dataPath.objectIndex,
              theme: this.theme,
              frame,
            }),
            delay,
          }
        }
      )
    )(currentObject)
  }
  get framesSrc() {
    return this.frames.map(prop('src'))
  }
  changeTheme(theme) {
    if (has(theme, this.themeData) && theme !== this.theme) {
      this.theme = theme
      this.sprite && this.sprite.stop && this.sprite.stop()
      this.render()
    }
  }
  render() {
    const isAnimation = this.frames.length > 1
    const renderTheme = this.theme
    if (this.sprite) {
      this.sprite.alpha = !this.frames.length ? 0 : 1
    }
    const { x, y, size } = this.frames[0] || {}
    this.app.loaderManager.load(this.framesSrc, () => {
      if (
        !this.framesSrc.filter((src) => this.app.loader.resources[src])
          .length ||
        this.theme !== renderTheme
      ) {
        return
      }
      if (!this.sprite) {
        this.sprite = new AnimatedSprite(
          this.framesSrc.map((src) => this.app.loader.resources[src].texture)
        )
        this.app.layers[this.layer].addChild(this.sprite)
      } else {
        this.app.ticker.remove(this.animationTicker)
        this.sprite.textures = this.framesSrc.map(
          (src) => this.app.loader.resources[src].texture
        )
      }
      this.sprite.width = +size.width
      this.sprite.height = +size.height
      this.sprite.x = x
      this.sprite.y = y
      this.sprite.zIndex = this.position.z
      if (isAnimation) {
        this.sprite.animationSpeed = 1 / ((this.frames[0].delay || 80) / 16)
        this.sprite.play()
        this.sprite.onFrameChange = this.animationTicker
      } else {
        this.app.ticker.remove(this.animationTicker)
        this.sprite.stop()
      }
    })
  }
  animationTicker = () => {
    if (!this.sprite || !this.frames[this.sprite.currentFrame]) return
    const data = this.frames[this.sprite.currentFrame]
    this.sprite.width = +data.size.width || this.sprite.width
    this.sprite.height = +data.size.height || this.sprite.height
    this.sprite.x = data.x || this.sprite.x
    this.sprite.y = data.y || this.sprite.y
  }
}

export default MapObject
