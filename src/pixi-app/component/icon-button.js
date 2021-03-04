import { Graphics } from 'pixi.js-legacy'
import PIXIFontAwesome from './fontawesome'

class IconButton extends Graphics {
  constructor(
    fontAwesomeIcon,
    {
      width = 40,
      height = width,
      bgColor = 0x666666,
      iconColor = 0xffffff,
      radius = 10,
    } = {}
  ) {
    super()
    const [iconWidth, iconHeight] = fontAwesomeIcon.icon
    this.buttonMode = true
    this.interactive = true
    this._bgColor = bgColor
    this._iconColor = iconColor
    this._radius = radius
    this._isHover = false
    this._width = width
    this._height = height
    this._iconSize = Math.max(iconWidth, iconHeight)
    this._iconLimitSize = Math.min(this._width, this._height) * 0.7
    this._iconScale = this._iconLimitSize / this._iconSize
    this.$icon = new PIXIFontAwesome(fontAwesomeIcon, { fill: iconColor })
    this.$icon.scale.set(this._iconScale)
    // this.$icon.pivot.set(0.5, 0.5)
    this.$icon.position.set(
      (width - iconWidth * this._iconScale) / 2,
      (height - iconHeight * this._iconScale) / 2
    )

    this.addChild(this.$icon)
    this.on('pointerdown', this.onClick)
      .on('pointerover', this.onHover)
      .on('pointerout', this.onOut)
    this._render_()
  }
  _render_() {
    this.clear()
    this.beginFill(this._bgColor, this._isHover ? 0.8 : 1)
    this.drawRoundedRect(0, 0, this._width, this._height, this._radius)
    this.endFill()
  }
  onHover = () => {
    // this.isHover = true
    this.alpha = 0.8
  }
  onOut = () => {
    // this.isHover = false
    this.alpha = 1
  }
  onClick() {}
  set isHover(isHover) {
    if (isHover !== this._isHover) {
      this._isHover = isHover
      this._render_()
    }
  }
}

export default IconButton
