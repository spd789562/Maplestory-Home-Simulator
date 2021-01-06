import getConfig from 'next/config'
import { prop } from 'ramda'

const { API_DATA_URL } = getConfig().publicRuntimeConfig

const toJson = (d) => d.json()

export const APIGetWz = () =>
  fetch(`${API_DATA_URL}/api/wz`)
    .then(toJson)
    .then((data) =>
      data.reduce((allWz, wz) => {
        if (wz.isReady) {
          allWz[wz.region] = { region: wz.region, version: wz.mapleVersionId }
        }
        return allWz
      }, {})
    )

export const APIGetHair = ({ region, version }) =>
  fetch(
    `${API_DATA_URL}/api/${region}/${version}/item/?&categoryFilter=Character&overallCategoryFilter=Equip&subCategoryFilter=Hair`
  ).then(toJson)

export const APIGetFace = ({ region, version }) =>
  fetch(
    `${API_DATA_URL}/api/${region}/${version}/item/?&categoryFilter=Character&overallCategoryFilter=Equip&subCategoryFilter=Face`
  ).then(toJson)

export const APIGetHat = ({ region, version }) =>
  fetch(
    `${API_DATA_URL}/api/${region}/${version}/item/?&categoryFilter=Armor&overallCategoryFilter=Equip&subCategoryFilter=Hat`
  )
    .then(toJson)
    .then((data) => data.filter(prop('isCash')))

export const APIGetCloth = ({ region, version }) =>
  fetch(
    `${API_DATA_URL}/api/${region}/${version}/item/?&categoryFilter=Armor&overallCategoryFilter=Equip&subCategoryFilter=Overall`
  )
    .then(toJson)
    .then((data) => data.filter(prop('isCash')))
