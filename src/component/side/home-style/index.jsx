import { useEffect, useState } from 'react'

/* store */
import { useStore } from '@store'
import { HOUSE_UPDATE } from '@store/house'

/* i18n */
import { withTranslation } from '@i18n'

/* components */
import { Select, Form } from 'antd'
import ChangeObject from './change-object'
import ChangeMap from './change-map'

/* utils */
import { entries } from '@utils/ramda'
import getInitTheme from '@utils/get-init-theme'
import { getTheme } from '@mapping/map-theme/name'
import { assoc, assocPath, evolve, keys, pipe, values } from 'ramda'
import Home from '@modules/home'

/* mapping */
import { ParsedTheme } from '@mapping/map-theme'

const selectOptions = keys(ParsedTheme).map((value) => ({
  label: `home_theme_${value}`,
  value,
}))

const HomeStyle = ({ t }) => {
  const [currentIndex, dispatch] = useStore('house.current')
  const [currentHomeData = {}] = useStore(`house.houses.${currentIndex}`)
  const theme = getTheme(currentHomeData.selectId)
  const [currentTheme, setCurrentTheme] = useState('christmax')
  useEffect(() => {
    theme && setCurrentTheme(theme)
  }, [theme])

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
    if (selectTheme !== theme) {
      dispatch({
        type: HOUSE_UPDATE,
        payload: new Home(id),
      })
    } else {
      dispatch({
        type: HOUSE_UPDATE,
        payload: pipe(
          assoc('selectId', id),
          assoc('furnitures', [])
        )(currentHomeData),
      })
    }
  }
  const mapList = ParsedTheme[currentTheme]

  return (
    <div>
      <Form.Item label={t('home_theme')}>
        <Select
          options={selectOptions.map(evolve({ label: t }))}
          value={currentTheme}
          onChange={setCurrentTheme}
        />
      </Form.Item>
      <ChangeMap
        mapList={mapList}
        currentId={currentHomeData.selectId}
        handleChange={handleChangeMap}
      />
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

HomeStyle.getInitialProps = async () => ({
  namespacesRequired: ['index'],
})

export default withTranslation('index')(HomeStyle)
