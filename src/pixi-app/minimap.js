import { Container, Graphics } from 'pixi.js-legacy'

class Minimap extends Container {
  constructor(pixiApp) {
    super()
    this.pixiApp = pixiApp
    this.$minimap = new Graphics()
    this.$minimap.interactive = true
    this.$viewable = new Graphics()
  }
  multipleRate(value) {
    return value * this.scaleRate
  }
  update() {
    const visibleRect = this.pixiApp.visibleRect
    this.$viewable.position.set(
      this.multipleRate(visibleRect.x),
      this.multipleRate(visibleRect.y)
    )
    this.$viewable.width = this.multipleRate(visibleRect.width)
    this.$viewable.height = this.multipleRate(visibleRect.height)
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

    this.$minimap.on('pointerdown', (event) => {
      console.log(event.data.getLocalPosition(this.$minimap))
    })

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
  }
}

export default Minimap
