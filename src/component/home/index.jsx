import { useEffect, createRef } from 'react'

/* components */
import { Application, utils } from 'pixi.js-legacy'

/* utils */
import isClient from '@utils/is-client'

/* mapping */
import MapTheme from '@mapping/map-theme'
import Maps from '@mapping/map'

const canvasRef = createRef()

const MAP_SELECTION = '017'

const Home = () => {
  useEffect(() => {
    if (canvasRef.current) {
      const selectedMapTheme = MapTheme[MAP_SELECTION]
      const MAP_ID = selectedMapTheme.templateMapID
      const {
        info: { VRTop, VRRight, VRBottom, VRLeft },
      } = Maps[MAP_ID]
      const origin = {
        x: +VRLeft,
        y: +VRTop,
      }
      const app = new Application({
        width: Math.abs(+VRLeft) + Math.abs(+VRRight),
        height: Math.abs(+VRTop) + Math.abs(+VRBottom),
        backgroundColor: 0x1099bb,
        resolution: window.devicePixelRatio || 1,
        view: canvasRef.current,
      })
    }
  }, [])

  return <canvas ref={canvasRef} />
}

export default Home
