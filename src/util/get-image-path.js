import { isNil } from 'ramda'

export const getMapObjectImagePath = ({
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

export const getMapBackImagePath = ({ homeType, backType, backIndex, frame }) =>
  `/home-back/${homeType}/Map2-Back-${homeType}.img-${backType}-${backIndex}${
    !isNil(frame) ? `-${frame}` : ''
  }.png`
