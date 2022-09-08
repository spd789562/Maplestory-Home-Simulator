/* components */
import { AnimatedSprite } from 'pixi.js-legacy'

/* utils */
import {
  clone,
  has,
  map,
  path,
  pickBy,
  pipe,
  prop,
  toPairs,
  match,
  defaultTo,
} from 'ramda'
import { getMapObjectImagePath } from '@utils/get-image-path'

/* mapping */
import MapObjectMapping from '@mapping/map-object'

const recursiveGetObject = (obj, wzType) => {
  const link = obj._inlink || obj._outlink
  if (link) {
    const _wzType = match(/\/(\w+)\.img\//, link)[1] || wzType
    let arrPath = link.replace(/^Map\/Obj\/myHome2?\.img\//, '').split('/')
    arrPath = [_wzType, ...arrPath]
    const linkObj = path(arrPath)(MapObjectMapping)
    const insideObj = recursiveGetObject(linkObj, _wzType)
    if (insideObj) {
      return insideObj
    } else {
      return linkObj
    }
  }
  return null
}
const getOutlinkInfo = (_outlink) => {
  const info = _outlink.split('/')
  // like this Map/Obj/myHome.img/NewYearType/exteriorDeco/1/0
  const theme = info[7] ? info[6] : '0'
  const frame = info[7] ? info[7] : info[6]
  return {
    wzType: info[2].replace('.img', ''),
    homeType: info[3],
    objectType: info[4],
    objectIndex: info[5],
    theme,
    frame,
  }
}

class MapObject {
  constructor(app, objectData) {
    this.app = app
    const {
      layer,
      x,
      y,
      z,
      f, // flip
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
    this.flip = !!f
    this._name = `${wzType}-${homeType}-${objectType}-${objectIndex}`
  }
  get frames() {
    const currentObject = this.themeData[this.theme]
    return pipe(
      toPairs,
      map(
        ([
          frame,
          { origin = {}, _imageData = {}, delay = 0, _inlink, _outlink } = {},
        ]) => {
          const linkObj = recursiveGetObject(
            { _inlink, _outlink },
            this.dataPath.wzType
          )
          const originX =
            origin?.x !== undefined ? origin.x : linkObj?.origin?.x
          const originY =
            origin?.y !== undefined ? origin.y : linkObj?.origin?.y
          return {
            frame,
            x: +originX * -1 + this.position.x,
            y: +originY * -1 + this.position.y,
            size: linkObj?._imageData || _imageData,
            src: _outlink
              ? getMapObjectImagePath(getOutlinkInfo(_outlink))
              : getMapObjectImagePath({
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
      this.sprite.name = this._name
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
      this.sprite.anchor.x = this.flip ? 1 : 0
      this.sprite.scale.x *= this.flip ? -1 : 1
    })
  }
  animationTicker = () => {
    if (!this.sprite || !this.frames[this.sprite.currentFrame]) return
    const data = this.frames[this.sprite.currentFrame]
    this.sprite.width = defaultTo(+data.size.width, this.sprite.width)
    this.sprite.height = defaultTo(+data.size.height, this.sprite.height)
    this.sprite.x = defaultTo(data.x, this.sprite.x)
    this.sprite.y = defaultTo(data.y, this.sprite.y)
  }
}

export default MapObject
