import { replace, mergeAll } from 'ramda'

const req = require.context('./', false, /^\.\/(?!_).*\.img\.json$/)

const getMapBackType = replace(/\.\/([A-z0-9_\-]+)\.img\.json$/, '$1')

const backs = req.keys().map((path) => {
  const backType = getMapBackType(path)
  return { [backType]: req(path).back }
})

export default mergeAll(backs)
