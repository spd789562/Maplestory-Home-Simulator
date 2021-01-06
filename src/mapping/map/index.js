import { replace, mergeAll } from 'ramda'

const req = require.context('./', false, /^\.\/(?!_).*\.img\.json$/)

const getMapId = replace(/\.\/([A-z0-9\-]+)\.img\.json$/, '$1')

const maps = req.keys().map((path) => {
  const mapId = getMapId(path)
  return { [mapId]: req(path) }
})

export default mergeAll(maps)
