import { useEffect, createRef } from 'react'

/* components */
import PixiAPP from '../../pixi-app'

const canvasRef = createRef()

const MAP_SELECTION = '017'

const Home = () => {
  useEffect(() => {
    let app
    if (canvasRef.current) {
      app = new PixiAPP(canvasRef.current)
      app.changeHomeMap(MAP_SELECTION)
      app.changeHomeTheme('chimney', 's1')
    }

    return () => {
      app && app.destory()
    }
  }, [])

  return <canvas ref={canvasRef} />
}

export default Home
