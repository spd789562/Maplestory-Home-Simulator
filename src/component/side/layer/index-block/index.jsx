import { memo, useEffect } from 'react'

/* components */
import { Droppable, Draggable } from 'react-beautiful-dnd'
import Item from '../item'

/* utils */
import { isPoster } from '@utils/furniture'

/* mapping */
import { filteredFurniture as FurnitureMapping } from '@mapping/furniture'
import StringMapping from '@mapping/furniture-string'

import styles from './index-block.module.scss'

const IndexBlock = ({ index, furnitures }) => {
  return (
    <div className={styles.block}>
      <h4>{index}</h4>
      <Droppable droppableId={`drop-block-${index}`} isCombineEnabled={false}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {furnitures.map(({ id, furnitureID }, mapIndex) => {
              const _isPoster = isPoster(FurnitureMapping[furnitureID] || {})
              return <Item id={id} index={mapIndex} furnitureID={furnitureID} />
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

export default memo(IndexBlock)
