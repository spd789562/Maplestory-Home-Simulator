import { useEffect, createRef } from 'react'

/* components */
import {
  Application,
  Container,
  AnimatedSprite,
  Sprite,
  Graphics,
} from 'pixi.js-legacy'

/* utils */
import isClient from '@utils/is-client'
import {
  add,
  clone,
  evolve,
  flatten,
  keys,
  map,
  pickBy,
  pipe,
  prop,
  toPairs,
  values,
} from 'ramda'

/* mapping */
import MapTheme from '@mapping/map-theme'
import MapObject from '@mapping/map-object'
import Maps from '@mapping/map'

const canvasRef = createRef()

const MAP_SELECTION = '017'

const getMapObjects = pipe(
  // filter non obj or null obj
  pickBy((val, key) => !Number.isNaN(+key) && val && val.obj),
  toPairs,
  // flatten obj
  map(([layer, data]) =>
    pipe(prop('obj'), values, map(evolve({ z: add(100 * +layer) })))(data)
  ),
  values,
  flatten
)
const getImageName = ({
  wzType,
  homeType,
  objectType,
  objectIndex,
  theme,
  frame,
}) =>
  `/home-object/Map2-Obj-${wzType}.img-${homeType}-${objectType}-${objectIndex}${
    +theme !== 0 ? '-' + theme : ''
  }-${frame}.png`

const Home = () => {
  useEffect(() => {
    let app
    if (canvasRef.current) {
      const selectedMapTheme = MapTheme[MAP_SELECTION]
      const mapId = selectedMapTheme.templateMapID
      const MapData = Maps[mapId]
      const defaultTheme = '0'
      const fakeTheme = 's1'
      const {
        info: { VRTop, VRRight, VRBottom, VRLeft },
      } = MapData
      const origin = {
        x: +VRLeft,
        y: +VRTop,
      }
      app = new Application({
        width: Math.abs(+VRLeft) + Math.abs(+VRRight),
        height: Math.abs(+VRTop) + Math.abs(+VRBottom),
        transparent: true,
        resolution: window.devicePixelRatio || 1,
        view: canvasRef.current,
      })
      app.stage.x = Math.abs(+VRLeft)
      app.stage.y = Math.abs(+VRTop)
      const objectContainer = new Container()
      objectContainer.sortableChildren = true
      const objectList = getMapObjects(MapData).map(
        ({
          x,
          y,
          z,
          oS: wzType,
          l0: homeType,
          l1: objectType,
          l2: objectIndex,
        }) => {
          let objs = MapObject[wzType][homeType][objectType][objectIndex]

          const defaultFrames = pipe(
            pickBy((_, key) => !Number.isNaN(+key)),
            map(clone)
          )(objs)
          objs[0] = defaultFrames
          const classifiedObj = pickBy(
            (_, key) => key === '0' || Number.isNaN(+key),
            objs
          )
          const themedObj = classifiedObj[fakeTheme]
          const currentObj = themedObj || classifiedObj[defaultTheme]
          return pipe(
            toPairs,
            map(
              ([frame, { origin = {}, _imageData = {}, delay = 0 } = {}]) => ({
                frame,
                x: +origin.x * -1 + +x,
                y: +origin.y * -1 + +y,
                z: +z,
                size: _imageData,
                src: getImageName({
                  wzType,
                  homeType,
                  objectType,
                  objectIndex,
                  theme: themedObj ? fakeTheme : defaultTheme,
                  frame,
                }),
                delay,
              })
            )
          )(currentObj)
        }
      )
      app.loader.add(flatten(objectList).map(prop('src'))).load(() => {
        objectList.map((frames) => {
          if (frames.length > 1) {
            const obj = new AnimatedSprite(
              frames
                .map(prop('src'))
                .map((src) => app.loader.resources[src].texture)
            )
            obj.width = +frames[0].size.width
            obj.height = +frames[0].size.height
            obj.x = frames[0].x
            obj.y = frames[0].y
            obj.zIndex = frames[0].z
            obj.animationSpeed = 0.3
            obj.play()
            objectContainer.addChild(obj)
            const objTicker = (delta) => {
              const data = frames[obj.currentFrame]
              obj.width = data.size.width
              obj.height = data.size.height
              obj.x = data.x
              obj.y = data.y
            }
            app.ticker.add(objTicker)
          } else {
            const { x, y, z, src, size } = frames[0]
            const obj = new Sprite(app.loader.resources[src].texture)
            obj.width = +size.width
            obj.height = +size.height
            obj.x = x
            obj.y = y
            obj.zIndex = z
            objectContainer.addChild(obj)
          }
        })
        const line = new Graphics()
        line.lineStyle(2, 0x000000, 1)
        line.moveTo(VRLeft, 0)
        line.lineTo(app.screen.width, 0)
        line.moveTo(0, VRTop)
        line.lineTo(0, app.screen.height)
        line.zIndex = 999
        objectContainer.addChild(line)
        app.stage.addChild(objectContainer)
        // const scaleRatio = window.innerWidth / app.stage.width
        // app.stage.scale.set(scaleRatio, scaleRatio)
      })

      return () => {
        if (app) {
          app.stop()
          app.destroy()
        }
      }
    }
  }, [])

  return <canvas ref={canvasRef} />
}

export default Home
