import { memo, useCallback } from 'react'

/* store */
import { useStore } from '@store'
import { REORDER_APP_FURNITURE } from '@store/app'
import { HOUSE_REORDER_FURNITURE } from '@store/house'

/* components */
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import Item from '../item'

/* utils */
import { isWallDeco } from '@utils/furniture'
import {
  append,
  ascend,
  assoc,
  toPairs,
  sort,
  filter,
  map,
  move,
  path,
  prop,
  pipe,
  not,
  identity,
  addIndex,
} from 'ramda'

/* mapping */
import { filteredFurniture as FurnitureMapping } from '@mapping/furniture'
import StringMapping from '@mapping/furniture-string'

import styles from './index-block.module.scss'

const TypeTab = ({ type }) => {
  const [currentIndex, dispatch] = useStore('house.current')
  const [furnitures] = useStore(`house.houses.${currentIndex}.furnitures`)
  const filteredFurnitures = pipe(
    filter(pipe(prop('furnitureID'), isWallDeco, type ? identity : not)),
    sort(ascend(path(['position', 'z'])))
  )(furnitures)

  const handleDragEnd = useCallback(
    (result) => {
      if (
        result.destination &&
        result.destination.index !== result.source.index
      ) {
        const sorted = pipe(
          move(result.source.index, result.destination.index),
          addIndex(map)(({ id }, index) => ({ id, z: index }))
        )(filteredFurnitures)

        dispatch({ type: REORDER_APP_FURNITURE, payload: sorted })
        /* store data update on pixi furniture zIndex changed */
        // dispatch({ type: HOUSE_REORDER_FURNITURE, payload: sorted })
      }
    },
    [filteredFurnitures]
  )

  return (
    <div className={styles.block}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`drop-block-${type}`} isCombineEnabled={false}>
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {filteredFurnitures.map(
                ({ id, furnitureID, position: { z } }, index) => {
                  return (
                    <Item
                      key={id}
                      id={id}
                      index={index}
                      furnitureID={furnitureID}
                    />
                  )
                }
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default memo(TypeTab)
