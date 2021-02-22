import { useEffect, createRef, useRef } from 'react'

/* store */
import { useStore } from '@store'
import { CLEAR_ACTIVE_FURNITURE } from '@store/active-furniture'

/* components */
import PixiAPP from '../../pixi-app'

const canvasRef = createRef()
const appRef = createRef()

const ESC_KEY_CODE = 27

const Home = () => {
  const [currentIndex, dispatch] = useStore('house.current')
  const [edit] = useStore('meta.edit')
  const [currentHomeData] = useStore(`house.houses.${currentIndex}`)
  const [activeFurnitureID] = useStore('active-furniture')
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
  useEffect(() => {
    if (canvasRef.current) {
      appRef.current = new PixiAPP(canvasRef.current)
      appRef.current.cancelPlaceFurniture = onCancelFurniture
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
      app.isEdit = true
      app.placeNewFurniture(activeFurnitureID)
    }
  }, [appRef.current, activeFurnitureID])

  return <canvas ref={canvasRef} style={{ userSelect: 'none' }} />
}

export default Home
