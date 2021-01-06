import { replace, mergeAll } from 'ramda'

const req = require.context('./', false, /^\.\/(?!_).*\.img\.json$/)

const getMapObjectType = replace(/\.\/([A-z0-9_\-]+)\.img\.json$/, '$1')

const objects = req.keys().map((path) => {
  const objectType = getMapObjectType(path)
  return { [objectType]: req(path) }
})

export default mergeAll(objects)
