import {
  Texture,
  Sprite,
  ObservablePoint,
  Point,
  Container,
  Transform,
} from 'pixi.js-legacy'

/* utils */
import { flatten, isNil, times } from 'ramda'

// mode 1 horizontal
// mode 2 vertical
// mode 3 both
class GapTilingSprite extends Container {
  constructor({ texture, scene, size, gap, position, mode = 3 }) {
    super()
    const _w = mode === 2 ? size.width : scene.edge.right - scene.edge.left
    const _h = mode === 1 ? size.height : scene.edge.bottom - scene.edge.top
    this._w = _w
    this._h = _h
    this.width = _w
    this.height = _h
    this.position.x = mode !== 2 ? scene.edge.left : position.x
    this.position.y = mode !== 1 ? scene.edge.top : position.y
    this.tileTransform = new Transform()
    this._texture = texture
    this._size = size
    this.gap = {
      x: gap.x > 0 ? gap.x - size.width : 0,
      y: gap.y > 0 ? gap.y - size.height : 0,
    }
    this.distence = {
      x: size.width + this.gap.x,
      y: size.height + this.gap.y,
    }

    const mask = new Sprite(Texture.WHITE)
    mask.width = _w
    mask.height = _h
    this.addChild(mask)
    this.mask = mask

    this.maxXCount = Math.ceil(_w / (size.width + this.gap.x)) + 1
    this.maxYCount = Math.ceil(_h / (size.height + this.gap.y)) + 1

    this._tilePosition = new ObservablePoint(this.positionUpdate, this, 0, 0)
    this._prevPosition = new Point(0, 0)

    this.tiling()

    this._tilePosition.x = position.x
    this._tilePosition.y = mode !== 2 ? 0 : position.y
    this._prevPosition.copyFrom(this._tilePosition)
  }
  tiling() {
    const { maxXCount, maxYCount } = this
    const textures = []
    times((i) => {
      times((j) => {
        const sprite = new Sprite(this._texture)
        sprite.x = i * this.distence.x
        sprite.y = j * this.distence.y
        textures.push(sprite)
      }, maxYCount)
    }, maxXCount)

    this._textures = textures
    this.addChild(...textures)
  }
  positionUpdate() {
    const incrementX = this._tilePosition.x - this._prevPosition.x
    const incrementY = this._tilePosition.y - this._prevPosition.y
    this._prevPosition.copyFrom(this._tilePosition)

    this._textures.forEach((sprite) => {
      sprite.x = sprite.x + incrementX
      sprite.y = sprite.y + incrementY
      // check out of bound
      let isRePosition = false
      const repositionPoint = new Point()
      repositionPoint.copyFrom(sprite.position)

      const xDistence = this.distence.x
      const yDistence = this.distence.y
      if (sprite.x + xDistence < 0) {
        repositionPoint.x = this.getLastTextureOnY(sprite.y).x + xDistence
        isRePosition = true
      } else if (sprite.x > this._w) {
        repositionPoint.x = this.getFirstTextureOnY(sprite.y).x - xDistence
        isRePosition = true
      }

      if (sprite.y + yDistence < 0) {
        repositionPoint.y = this.getLastTextureOnX(sprite.x).y + yDistence
        isRePosition = true
      } else if (sprite.y > this._h) {
        repositionPoint.y = this.getFirstTextureOnX(sprite.x).y - yDistence
        isRePosition = true
      }

      if (isRePosition) {
        sprite.position.copyFrom(repositionPoint)
        // reset z-index
        this.removeChild(sprite)
        this.addChild(sprite)
      }
    })
  }
  getFirstTextureOnX(x) {
    return this._textures.reduce((acc, texture) => {
      if (texture.x === x && (isNil(acc) || texture.y < acc.y)) {
        return texture
      }
      return acc
    }, null)
  }
  getFirstTextureOnY(y) {
    return this._textures.reduce((acc, texture) => {
      if (texture.y === y && (isNil(acc) || texture.x < acc.x)) {
        return texture
      }
      return acc
    }, null)
  }
  getLastTextureOnX(x) {
    return this._textures.reduce((acc, texture) => {
      if (texture.x === x && (isNil(acc) || texture.y > acc.y)) {
        return texture
      }
      return acc
    }, null)
  }
  getLastTextureOnY(y) {
    return this._textures.reduce((acc, texture) => {
      if (texture.y === y && (isNil(acc) || texture.x > acc.x)) {
        return texture
      }
      return acc
    }, null)
  }
  get tilePosition() {
    return this._tilePosition
  }
  set tilePosition(value) {
    this._tilePosition.copyFrom(value)
  }
}

export default GapTilingSprite
