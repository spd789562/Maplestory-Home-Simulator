import { Container, Sprite } from 'pixi.js-legacy'

/* utils */
import { flatten, isNil, times } from 'ramda'

class GapTilingSprite extends Container {
  constructor({ texture, width, height, size, gap, mode = 3 }) {
    super()
    this.texture = texture
    /* tiling size */
    this.boxSize = {
      width,
      height,
    }
    /* tiling gap */
    this.gap = {
      x: isNil(gap.x) ? size.width : gap.x,
      y: isNil(gap.y) ? size.height : gap.y,
    }
    /* texture size */
    this.size = size
    this.mode = mode

    this.data = []

    this.placeTexture()
  }
  get points() {
    const rowUnit = this.gap.y || this.size.height
    const colUnit = this.gap.x || this.size.width
    const rowCount =
      this.mode === 1 ? 1 : Math.ceil(this.boxSize.height / rowUnit)
    const colCount =
      this.mode === 2 ? 1 : Math.ceil(this.boxSize.width / colUnit)
    return flatten(
      times((xIndex) => {
        const x = xIndex * colUnit
        return times((yIndex) => {
          const y = yIndex * rowUnit
          return { x, y }
        }, rowCount)
      }, colCount)
    )
  }
  placeTexture() {
    this.points.forEach(({ x, y }) => {
      const sprite = new Sprite(this.texture)
      sprite.width = this.size.width
      sprite.height = this.size.height
      sprite.position.set(x, y)
      this.addChild(sprite)
      this.data.push(sprite)
    })
  }
}

export default GapTilingSprite
