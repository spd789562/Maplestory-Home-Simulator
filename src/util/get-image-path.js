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
