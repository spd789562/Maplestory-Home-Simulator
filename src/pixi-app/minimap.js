import { Container, Graphics, Text, TextStyle } from 'pixi.js-legacy'
import { flatten } from 'ramda'

const ButtonPath = flatten([
  [0, 0],
  [100, 0],
  [92.5, 24],
  [7.5, 24],
  [0, 0],
])

class Minimap extends Container {
  constructor(pixiApp) {
    super()
    this.pixiApp = pixiApp
    this.$mapContainer = new Container()
    this.$minimap = new Graphics()
    this.$viewable = new Graphics()
    this.$minimap.interactive = true
    this.$viewable.interactive = true
    this.$viewable.buttonMode = true
    this.$viewable.isDrag = false
    this.$mapContainer.addChild(this.$minimap)
    this.$mapContainer.addChild(this.$viewable)
    this.addChild(this.$mapContainer)
    this.renderButton()
    this.show = true
  }
  multipleRate(value) {
    return value * this.scaleRate
  }
  update() {
    const visibleRect = this.pixiApp.viewport.getVisibleBounds()
    this.$viewable.position.set(
      this.multipleRate(visibleRect.x),
      this.multipleRate(visibleRect.y)
    )
    this.$viewable.width = this.multipleRate(visibleRect.width)
    this.$viewable.height = this.multipleRate(visibleRect.height)
  }
  moveVisible = (event) => {
    const mapPosition = event.data.getLocalPosition(this.$minimap)
    const offsetX = this.$viewable.width / 2
    const offsetY = this.$viewable.height / 2
    const resultX = mapPosition.x
    const resultY = mapPosition.y
    let moveX =
      resultX > this.mapWidth
        ? this.mapWidth - offsetX
        : resultX < 0
        ? offsetX
        : resultX
    let moveY =
      resultY > this.mapWidth
        ? this.mapWidth - offsetY
        : resultY < 0
        ? offsetY
        : resultY

    this.$viewable.position.set(moveX, moveY)
    this.pixiApp.viewport.moveCenter(
      moveX / this.scaleRate,
      moveY / this.scaleRate
    )
    this.update()
  }
  renderButton() {
    this.$button = new Graphics()
    this.$button.interactive = true
    this.$button.buttonMode = true
    this.$button.beginFill(0x0000000)
    this.$button.drawPolygon(ButtonPath)
    this.$button.beginFill()
    const buttonTextStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xffffff,
    })
    const buttonText = new Text('Minimap', buttonTextStyle)
    buttonText.x = 18
    this.$button.addChild(buttonText)
    this.$button.on('pointerdown', this.toggleMinimap)
    this.pixiApp.app.ticker.add(this.toggleTicker)
    this.addChild(this.$button)
  }
  renderMinimap(width) {
    const scaleRate = width / this.pixiApp.world.width
    this.scaleRate = scaleRate
    const height = this.pixiApp.world.height * scaleRate
    this.mapWidth = width
    this.mapHeight = height
    const visibleRect = this.pixiApp.visibleRect
    this.$button.y = height

    this.$minimap.clear()
    this.$minimap.beginFill(0x000000)
    const minimap = this.$minimap.drawRect(0, 0, width, height)
    minimap.alpha = 0.8
    this.$minimap.endFill()

    this.$viewable.clear()
    this.$viewable.beginFill(0xffffff)
    const viewable = this.$viewable.drawRect(
      0,
      0,
      this.multipleRate(visibleRect.width),
      this.multipleRate(visibleRect.height)
    )
    viewable.alpha = 0.3
    this.$viewable.beginFill()
    this.$viewable.position.set(
      this.multipleRate(visibleRect.x),
      this.multipleRate(visibleRect.y)
    )
    // remove previous mask
    this.$mask && this.$mapContainer.removeChild(this.$mask)
    this.$mask = this.$minimap.clone()
    this.$mapContainer.addChild(this.$mask)
    // apply mask
    this.$mapContainer.mask = this.$mask

    // click minimap
    this.$minimap.on('pointerdown', this.moveVisible)
    // drag visible
    this.$viewable
      .on('pointerdown', this.startDragVisible)
      .on('pointerup', this.endDragVisible)
      .on('pointerupoutside', this.endDragVisible)
      .on('pointermove', this.dragingVisible)
  }
  startDragVisible = (event) => {
    this.$viewable.isDrag = true
    this.$viewable.eventData = event
  }
  endDragVisible = () => {
    this.$viewable.isDrag = true
    this.$viewable.eventData = null
  }
  dragingVisible = () => {
    this.$viewable.isDrag &&
      this.$viewable.eventData &&
      this.moveVisible(this.$viewable.eventData)
  }
  toggleMinimap = () => {
    this.show = !this.show
  }
  toggleTicker = (delta) => {
    if (!this.show && this.y >= -this.mapHeight) {
      const movePoint = this.y - delta * 6
      this.y = movePoint < -this.mapHeight ? -this.mapHeight : movePoint
    } else if (this.show && this.y <= 0) {
      const movePoint = this.y + delta * 6
      this.y = movePoint > 0 ? 0 : movePoint
    }
  }
}

export default Minimap
