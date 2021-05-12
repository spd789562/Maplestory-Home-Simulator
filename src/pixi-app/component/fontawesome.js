import { Graphics } from 'pixi.js-legacy'
import parse from 'parse-svg-path'
import abs from 'abs-svg-path'
import normalize from 'normalize-svg-path'

const defaultColor = 0x000

class PIXIFontAwesome extends Graphics {
  constructor(
    { icon } = {},
    { fill = defaultColor, strokeColor = null, strokeWidth = 2 } = {}
  ) {
    super()
    if (typeof icon[4] === 'string') {
      this._fillColor = fill
      this._strokeColor = strokeColor
      this._strokeWidth = strokeWidth
      this._svgPath = icon[4]
      this._parsedSVGPath = normalize(abs(parse(this._svgPath)))
      this._render_()
    }
  }
  _render_() {
    this.clear()
    this._fillColor && this.beginFill(this._fillColor)
    this._strokeColor && this.lineStyle(this._strokeWidth, this._strokeColor)
    this._drawPath()
    this.endFill()
  }
  _drawPath() {
    this._parsedSVGPath.forEach((arg) => {
      const [code, x1, y1, x2, y2, dx, dy] = arg
      switch (code) {
        case 'M':
          this.moveTo(x1, y1)
          break
        case 'C':
          this.bezierCurveTo(x1, y1, x2, y2, dx, dy)
          break
        case 'Z':
          this.closePath()
          break
        default:
          break
      }
    })
  }
  set fillColor(color) {
    this._fillColor = color
    this._render_()
  }
  set strokeColor(color) {
    this._strokeColor = color
    this._render_()
  }
  set strokeWidth(width) {
    this._strokeWidth = width
    this._render_()
  }
}

export default PIXIFontAwesome
