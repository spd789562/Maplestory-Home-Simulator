import { Container, Rectangle } from 'pixi.js-legacy'
import IconButton from './icon-button'
import {
  faArrowsAlt,
  faAngleUp,
  faAngleDown,
  faAngleDoubleUp,
  faAngleDoubleDown,
  faCopy,
  faExchangeAlt,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons'

class FurniturePlacement extends Container {
  constructor({
    handleMove,
    handleFlip,
    handleDuplicate,
    handleUpIndex,
    handleDownIndex,
    handleDelete,
  }) {
    super()
    this.$move = new IconButton(faArrowsAlt, { handleClick: handleMove })
    this.$flip = new IconButton(faExchangeAlt, { handleClick: handleFlip })
    this.$indexUp = new IconButton(faAngleUp, { handleClick: handleUpIndex })
    this.$indexDown = new IconButton(faAngleDown, {
      handleClick: handleDownIndex,
    })
    this.$dupicate = new IconButton(faCopy, { handleClick: handleDuplicate })
    // this.$indexTop = new IconButton(faAngleDoubleUp)
    // this.$indexBottom = new IconButton(faAngleDoubleDown)
    this.$delete = new IconButton(faTrashAlt, {
      handleClick: handleDelete,
      bgColor: 0xdc3545,
    })
    this.interactive = true
    // this.buttonMode = true
    const elements = [
      this.$move,
      this.$flip,
      this.$dupicate,
      this.$indexUp,
      this.$indexDown,
      // this.$indexTop,
      // this.$indexBottom,
      this.$delete,
    ]
    this.hitArea = new Rectangle(0, 0, (elements.length + 3) * 40, 45)
    elements.forEach((element, index) => {
      this.addChild(element)
      element.x = index * element.width + index * 3
    })
  }
}

export default FurniturePlacement
