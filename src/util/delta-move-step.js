const FRAMEMS = 1000 / 60

const deltaMoveStep = (distance, ms, delta) =>
  (distance / (ms / FRAMEMS)) * delta

export default deltaMoveStep
