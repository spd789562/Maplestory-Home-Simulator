import { Container, Graphics } from 'pixi.js-legacy'

class Minimap extends Container {
  constructor(pixiApp) {
    super()
    this.pixiApp = pixiApp
    this.$minimap = new Graphics()
    this.$viewable = new Graphics()
    this.$minimap.interactive = true
    this.$viewable.interactive = true
    this.$viewable.buttonMode = true
    this.$viewable.isDrag = false
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
  renderMinimap(width) {
    const scaleRate = width / this.pixiApp.world.width
    this.scaleRate = scaleRate
    const height = this.pixiApp.world.height * scaleRate
    this.mapWidth = width
    this.mapHeight = height
    const visibleRect = this.pixiApp.visibleRect

    this.$minimap.beginFill(0x000000)
    const minimap = this.$minimap.drawRect(0, 0, width, height)
    minimap.alpha = 0.8
    this.$minimap.endFill()
    this.$mask = this.$minimap.clone()

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

    this.addChild(this.$minimap)
    this.addChild(this.$viewable)
    this.addChild(this.$mask)
    this.mask = this.$mask

    this.$minimap.on('pointerdown', this.moveVisible)
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
}

export default Minimap
