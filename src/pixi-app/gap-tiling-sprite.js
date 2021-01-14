import { Container, Sprite } from 'pixi.js-legacy'

/* utils */
import { flatten, isNil, times } from 'ramda'

class GapTilingSprite extends Container {
  constructor({ texture, scene, size, gap, position, mode = 3 }) {
    super()
    this.texture = texture

    /* tiling gap */
    this.gap = {
      x: isNil(gap.x) ? size.width : gap.x,
      y: isNil(gap.y) ? size.height : gap.y,
    }
    /* position */
    this.pos = {
      x: position.x || 0,
      y: position.y || 0,
    }
    /* texture size */
    this.size = size
    this.mode = mode

    /* calc start point */
    this.colUnit = this.gap.x || this.size.width
    this.rowUnit = this.gap.y || this.size.height

    const posWithCenterX = scene.center.x + this.pos.x
    const posWithCenterY = scene.center.y + this.pos.y
    const minimumLeftDistance =
      Math.ceil((posWithCenterX - scene.edge.left) / this.colUnit) *
      this.colUnit
    const minimumTopDistance =
      Math.ceil((posWithCenterY - scene.edge.top) / this.rowUnit) * this.rowUnit
    this.startX = posWithCenterX - minimumLeftDistance - this.pos.x
    this.startY = posWithCenterY - minimumTopDistance

    /* tiling size */
    this.boxSize = {
      width: scene.edge.right - this.startX,
      height: scene.edge.bottom - this.startY,
    }

    this.data = []

    this.placeTexture()
  }
  get points() {
    const rowCount =
      this.mode === 1 ? 1 : Math.ceil(this.boxSize.height / this.rowUnit) + 1
    const colCount =
      this.mode === 2 ? 1 : Math.ceil(this.boxSize.width / this.colUnit) + 1

    return flatten(
      times((xIndex) => {
        const x = (colCount === 1 ? 0 : this.startX) + xIndex * this.colUnit
        return times((yIndex) => {
          const y = (rowCount === 1 ? 0 : this.startY) + yIndex * this.rowUnit
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
