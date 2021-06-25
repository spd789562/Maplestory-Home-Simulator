/* components */
import { Graphics, Ticker, GRAPHICS_CURVES } from 'pixi.js-legacy'

const LOADING_LINE_WIDTH = 7
const ROTATE_STEP = Math.PI / 60
const FULL_DEGREE = Math.PI * 2

GRAPHICS_CURVES.adaptive = true

class Loading extends Graphics {
  constructor(width = 100, height = 100) {
    super()
    this.lineStyle(LOADING_LINE_WIDTH, 0xffffff, 0.7)
    this.arc(0, 0, Math.min(width, height) / 2, 0, (FULL_DEGREE * 4) / 5)
    this.scale.set(0.8)
    this.ticker = Ticker.shared
    this.ticker.add(this.animationTicker)
  }
  destroy() {
    this.ticker.stop()
    this.ticker.remove(this.animationTicker)
    this.parent && this.parent.removeChild(this)
  }
  animationTicker = (delta) => {
    this.rotation =
      (this.rotation >= FULL_DEGREE ? 0 : this.rotation) + delta * ROTATE_STEP
  }
}

export default Loading
