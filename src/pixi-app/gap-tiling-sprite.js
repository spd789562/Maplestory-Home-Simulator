import {
  Texture,
  Rectangle,
  Sprite,
  TilingSprite,
  Graphics,
} from 'pixi.js-legacy'

/* utils */
import { flatten, isNil, times } from 'ramda'

class GapTilingSprite extends TilingSprite {
  constructor({ texture, scene, size, gap, position, mode = 3 }) {
    const gapTexture = GapTilingSprite.generateGapTexture(texture, size, gap)

    const width = mode === 2 ? size.width : scene.edge.right - scene.edge.left
    const height = mode === 1 ? size.height : scene.edge.bottom - scene.edge.top
    super(gapTexture, width, height)

    this.x = mode !== 2 ? scene.edge.left : position.x
    this.y = mode !== 1 ? scene.edge.top : position.y
    this.tilePosition.x = position.x
    this.tilePosition.y = this.type !== 2 ? 0 : position.y
  }
  static generateGapTexture(texture, size, gap) {
    const gapBox = new Graphics()
    const boxWidth = gap.x ? gap.x : size.width
    const boxHeight = gap.y ? gap.y : size.height

    /* empty box */
    gapBox.drawRect(0, 0, boxWidth, boxHeight)
    gapBox.endFill()

    const originSprite = new Sprite(texture)
    originSprite.width = size.width
    originSprite.height = size.height

    if (originSprite.width > boxWidth) {
      // cut texture
      originSprite.texture = new Texture(
        texture,
        new Rectangle((size.width - boxWidth) / 2, 0, boxWidth, size.height)
      )
      originSprite.width = boxWidth
    }
    gapBox.addChild(originSprite)

    return gapBox.generateCanvasTexture()
  }
}

export default GapTilingSprite
