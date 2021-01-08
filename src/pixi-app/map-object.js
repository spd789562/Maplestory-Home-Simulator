/* components */
import { AnimatedSprite } from 'pixi.js-legacy'

/* utils */
import { clone, map, path, pickBy, pipe, prop, toPairs, uniq } from 'ramda'
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
    this.objectType = objectType
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
            ? path([this.wzType, ..._inlink.split('/')], MapObjectMapping)
            : null
          return {
            frame,
            x: +origin.x * -1 + this.position.x,
            y: +origin.y * -1 + this.position.y,
            size: (linkObj && linkObj._imageData) || _imageData,
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
    if (this.themeData[theme]) {
      this.theme = theme
      // this.render()
    }
  }
  render() {
    const isAnimation = this.frames.length > 1
    const { x, y, size } = this.frames[0]
    if (!this.sprite) {
      this.sprite = new AnimatedSprite(
        this.framesSrc.map((src) => this.app.loader.resources[src].texture)
      )
    } else {
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
      this.app.ticker.add(this.animationTicker)
    } else {
      this.app.ticker.remove(this.animationTicker)
      this.sprite.stop()
    }
  }
  animationTicker() {
    const data = frames[this.sprite.currentFrame]
    this.sprite.width = data.size.width || this.sprite.width
    this.sprite.height = data.size.height || this.sprite.height
    this.sprite.x = data.x || this.sprite.x
    this.sprite.y = data.y || this.sprite.y
  }
}

export default MapObject
