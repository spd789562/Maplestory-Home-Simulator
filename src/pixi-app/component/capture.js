import { Graphics, RenderTexture } from 'pixi.js-legacy'
import { identity } from 'ramda'
import PIXIFontAwesome from './fontawesome'
import { faCamera, faCameraRetro } from '@fortawesome/free-solid-svg-icons'
import { Modal } from 'antd'

class Capture extends Graphics {
  constructor(pixiApp) {
    super()
    this.pixiApp = pixiApp
    this.app = this.pixiApp.app
    const [iconWidth, iconHeight] = faCamera.icon
    this.buttonMode = true
    this.interactive = true
    this._iconColor = '0xffffff'
    this._isHover = false
    this._width = 80
    this._height = 80
    this._iconSize = Math.max(iconWidth, iconHeight)
    this._iconLimitSize = Math.min(this._width, this._height) * 0.7
    this._iconScale = this._iconLimitSize / this._iconSize
    this.$icon = new PIXIFontAwesome(faCameraRetro, { fill: this._iconColor })

    this.alpha = 0.5
    this.$icon.scale.set(this._iconScale)
    // this.$icon.pivot.set(0.5, 0.5)
    this.$icon.position.set(
      (this._width - iconWidth * this._iconScale) / 2,
      (this._height - iconHeight * this._iconScale) / 2
    )

    this.addChild(this.$icon)
    this.on('pointerdown', this.onCapture)
      .on('pointerover', this.onHover)
      .on('pointerout', this.onOut)
  }
  onHover = () => {
    // this.isHover = true
    this.alpha = 0.4
  }
  onOut = () => {
    // this.isHover = false
    this.alpha = 0.5
  }
  onCapture = () => {
    const _tempEdit = this.pixiApp.isEdit
    this.pixiApp.isEdit = false
    const $tempTexture = RenderTexture.create(this.pixiApp.world)
    this.app.renderer.render(this.pixiApp.$map, $tempTexture)
    const img = this.app.renderer.plugins.extract
      .canvas($tempTexture)
      .toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        Modal.info({
          title: 'Preview',
          content: <img src={url} style={{ maxWidth: '100%' }} />,
          width: 1000,
          icon: null,
        })
      }, 'image/jpeg')
    this.pixiApp.isEdit = _tempEdit
  }
}

export default Capture
