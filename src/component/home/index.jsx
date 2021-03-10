import { useEffect, createRef, useRef } from 'react'

/* store */
import { useStore } from '@store'
import { CLEAR_ACTIVE_FURNITURE } from '@store/active-furniture'
import { HOUSE_UPDATE_FURNITURE, HOUSE_DELETE_FURNITURE } from '@store/house'
import { ENTER_EDIT } from '@store/meta'

/* components */
import PixiAPP from '../../pixi-app'

/* uitls */
import { pickAll } from 'ramda'

const canvasRef = createRef()
const appRef = createRef()

const ESC_KEY_CODE = 27

const Home = () => {
  const [currentIndex, dispatch] = useStore('house.current')
  const [edit] = useStore('meta.edit')
  const [currentHomeData] = useStore(`house.houses.${currentIndex}`)
  const [activeFurnitureID] = useStore('active-furniture')
  const [sideIsOpen] = useStore('meta.side.open')
  const onEsc = ({ keyCode }) => {
    if (keyCode === ESC_KEY_CODE) {
      appRef.current &&
        appRef.current.activeFurniture &&
        appRef.current.activeFurniture.cancelDrag()
    }
  }
  const onCancelFurniture = () => {
    dispatch({ type: CLEAR_ACTIVE_FURNITURE })
  }
  const onUpdateFurniture = (furniture) => {
    dispatch({
      type: HOUSE_UPDATE_FURNITURE,
      payload: pickAll(['id', 'furnitureID', 'position', 'flip'], furniture),
    })
  }
  const onDeleteFurniture = (furniture) => {
    dispatch({ type: HOUSE_DELETE_FURNITURE, payload: furniture.id })
  }
  useEffect(() => {
    if (canvasRef.current) {
      appRef.current = new PixiAPP(canvasRef.current)
      appRef.current.cancelPlaceFurniture = onCancelFurniture
      appRef.current.event.addListener('furnitureUpdate', onUpdateFurniture)
      appRef.current.event.addListener('furnitureDelete', onDeleteFurniture)
      window.addEventListener('keydown', onEsc)
    }
    return () => {
      appRef.current && appRef.current.destory()
      window.removeEventListener('keydown', onEsc)
    }
  }, [])
  useEffect(() => {
    const app = appRef.current
    if (app) {
      app.changeHomeMap(currentHomeData.selectId)
      app.applyHomeTheme(currentHomeData.theme)
    }
  }, [appRef.current, currentHomeData])

  useEffect(() => {
    const app = appRef.current
    if (app) {
      app.isEdit = edit
    }
  }, [appRef.current, edit])
  useEffect(() => {
    const app = appRef.current
    if (app && activeFurnitureID) {
      dispatch({ type: ENTER_EDIT })
      app.placeNewFurniture(activeFurnitureID)
    }
  }, [appRef.current, activeFurnitureID])
  useEffect(() => {
    const app = appRef.current
    if (app) {
      const sideWidth = Math.min(window.innerWidth - 30, 300)
      app.updateAPPWidth(window.innerWidth - (sideIsOpen ? sideWidth : 0))
    }
  }, [appRef.current, sideIsOpen])

  return <canvas ref={canvasRef} style={{ userSelect: 'none' }} />
}

export default Home
