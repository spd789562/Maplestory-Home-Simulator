import { useCallback } from 'react'
import { useTranslation } from 'next-i18next'

/* components */
import { Select, Form } from 'antd'

/* utils */
import {
  __,
  assoc,
  equals,
  identity,
  pipe,
  keys,
  filter,
  path,
  values,
  includes,
  length,
  difference,
  gt,
  startsWith,
  indexBy,
  prop,
} from 'ramda'

const isType = (type) => filter(pipe(path(['info', 'type']), equals(type)))

const hasTag = (tags = []) =>
  filter(
    pipe(
      path(['info', 'tag']),
      values,
      difference(tags),
      length,
      gt(tags.length)
    )
  )

const filterOptions = [
  {
    title: 'furniture_filter_all',
    value: identity,
  },
  {
    title: 'furniture_filter_ground',
    value: pipe(keys, filter(startsWith('02672'))),
  },
  {
    title: 'furniture_filter_wall',
    value: pipe(keys, filter(startsWith('02671'))),
  },
  {
    title: 'furniture_filter_poster',
    value: hasTag(['poster', 'frame']),
  },
  {
    title: 'furniture_filter_boss',
    value: hasTag(['boss']),
  },
  {
    title: 'furniture_filter_plant',
    value: hasTag(['plants']),
  },
  {
    title: 'furniture_filter_light',
    value: isType('light'),
  },
  {
    title: 'furniture_filter_rest',
    value: isType('rest'),
  },
  {
    title: 'furniture_filter_interable',
    value: filter(path(['info', 'interact'])),
  },
]

const options = indexBy(prop('title'), filterOptions)

const FilterSelect = ({ onChange }) => {
  const { t } = useTranslation('index')
  return (
    <Form.Item label={t('furniture_filter')}>
      <Select
        onChange={(key) => {
          onChange(() => options[key].value)
        }}
        defaultValue={filterOptions[0].title}
        options={filterOptions.map(({ title }) => ({
          label: t(title),
          value: title,
        }))}
      />
    </Form.Item>
  )
}

export default FilterSelect
