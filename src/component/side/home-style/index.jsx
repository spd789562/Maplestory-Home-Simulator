import { useEffect, useState } from 'react'

/* store */
import { useStore } from '@store'
import { HOUSE_UPDATE } from '@store/house'

/* components */
import { Select } from 'antd'
import ChangeObject from './change-object'

/* utils */
import { entries } from '@utils/ramda'
import getInitTheme from '@utils/get-init-theme'
import { getTheme } from '@mapping/map-theme/name'
import { assoc, assocPath, keys, pipe, values } from 'ramda'

/* mapping */
import { ParsedTheme } from '@mapping/map-theme'

const selectOptions = keys(ParsedTheme).map((value) => ({
  label: value,
  value,
}))

const HomeStyle = () => {
  const [currentIndex, dispatch] = useStore('house.current')
  const [currentHomeData] = useStore(`house.houses.${currentIndex}`)
  const theme = getTheme(currentHomeData.selectId)
  const [currentTheme, setCurrentTheme] = useState(theme)
  useEffect(() => setCurrentTheme(theme), [theme])

  const handleChange = (applyObjs) => () => {
    if (currentTheme === theme) {
      dispatch({
        type: HOUSE_UPDATE,
        payload: pipe(
          ...applyObjs.map(({ name, state }) =>
            assocPath(['theme', name], state)
          )
        )(currentHomeData),
      })
    }
  }
  const handleChangeMap = (id) => () => {
    const selectTheme = getTheme(id)
    let updateFuncs = [assoc('selectId', id)]
    selectTheme !== theme && updateFuncs.push(assoc('theme', getInitTheme(id)))
    dispatch({
      type: HOUSE_UPDATE,
      payload: pipe(...updateFuncs)(currentHomeData),
    })
  }
  const mapList = ParsedTheme[currentTheme]

  return (
    <div>
      <Select
        options={selectOptions}
        value={currentTheme}
        onChange={setCurrentTheme}
      />
      {mapList.map(({ id }) => (
        <img
          src={`/home-thumbnail/${id}.png`}
          alt=""
          onClick={handleChangeMap(id)}
        />
      ))}
      {entries(
        ([type, themes]) => (
          <ChangeObject
            key={`home-obj-type-${type}`}
            type={type}
            themes={themes}
            handleChange={handleChange}
            currentThemeData={currentHomeData.theme}
          />
        ),
        mapList[0].themeable
      )}
    </div>
  )
}

export default HomeStyle
