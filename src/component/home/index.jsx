import { useEffect, createRef, useRef } from 'react'

/* store */
import { useStore } from '@store'

/* components */
import PixiAPP from '../../pixi-app'

const canvasRef = createRef()
const appRef = createRef()

const Home = () => {
  const [currentIndex] = useStore('house.current')
  const [edit] = useStore('meta.edit')
  const [currentHomeData] = useStore(`house.houses.${currentIndex}`)

  useEffect(() => {
    if (canvasRef.current) {
      appRef.current = new PixiAPP(canvasRef.current)
    }
    return () => {
      appRef.current && appRef.current.destory()
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

  return <canvas ref={canvasRef} style={{ userSelect: 'none' }} />
}

export default Home
