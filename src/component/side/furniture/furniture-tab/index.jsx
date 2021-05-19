import { memo, useCallback, useState, useMemo } from 'react'

/* components */
import { Row, Col } from 'antd'
import Item from '../item'
import { Grid, AutoSizer } from 'react-virtualized'

/* utils */
import {
  flatten,
  identity,
  is,
  keys,
  map,
  path,
  pipe,
  tap,
  uniq,
  values,
} from 'ramda'

/* mapping */
import { filteredFurniture as FurnitureMapping } from '@mapping/furniture'

const COLUMN_COUNT = 4

const FurnitureTab = () => {
  const [filterCallback, setFilterCallback] = useState(identity)
  const filteredFurniture = useMemo(() => {
    const res = filterCallback(FurnitureMapping)
    return Array.isArray(res) ? res : keys(res)
  }, [filterCallback])
  const cellRenderer = useCallback(
    ({
      columnIndex, // Horizontal (column) index of cell
      key, // Unique key within array of cells
      rowIndex, // Vertical (row) index of cell
      style,
    }) => {
      const id = filteredFurniture[rowIndex * COLUMN_COUNT + columnIndex]
      return (
        id && (
          <div key={key} style={{ ...style, padding: 4 }}>
            <Item id={id} />
          </div>
        )
      )
    }
  )
  return (
    <div style={{ height: 'calc(100vh - 150px)', paddingRight: 6 }}>
      <AutoSizer>
        {({ height, width }) => {
          return (
            <Grid
              cellRenderer={cellRenderer}
              columnCount={COLUMN_COUNT}
              columnWidth={width / COLUMN_COUNT}
              height={height}
              rowCount={Math.ceil(filteredFurniture.length / COLUMN_COUNT)}
              rowHeight={width / COLUMN_COUNT}
              width={width}
            />
          )
        }}
      </AutoSizer>
    </div>
  )
}

export default memo(FurnitureTab)
