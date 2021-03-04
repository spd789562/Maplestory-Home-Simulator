import { Container, Rectangle } from 'pixi.js-legacy'
import IconButton from './icon-button'
import {
  faArrowsAlt,
  faAngleUp,
  faAngleDown,
  faAngleDoubleUp,
  faAngleDoubleDown,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons'

class FurniturePlacement extends Container {
  constructor() {
    super()
    this.$move = new IconButton(faArrowsAlt)
    this.$indexUp = new IconButton(faAngleUp)
    this.$indexDown = new IconButton(faAngleDown)
    this.$indexTop = new IconButton(faAngleDoubleUp)
    this.$indexBottom = new IconButton(faAngleDoubleDown)
    this.$delete = new IconButton(faTrashAlt)
    this.interactive = true
    // this.buttonMode = true
    const elements = [
      this.$move,
      this.$indexUp,
      this.$indexDown,
      this.$indexTop,
      this.$indexBottom,
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
