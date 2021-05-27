import { useCallback, useState } from 'react'

/* store */
import { useStore } from '@store'
import { ENTER_EDIT, EXIT_EDIT } from '@store/meta'

/* i18n */
import { withTranslation } from '@i18n'

/* components */
import IndexBlock from './index-block'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

/* utils */
import {
  append,
  ascend,
  assoc,
  toPairs,
  reduce,
  sort,
  path,
  prop,
  pipe,
} from 'ramda'

const AddMinusButton = ({ id, show }) => (
  <Droppable droppableId={`add-${id}`}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className={`button ${show ? 'button__show' : ''} ${
          snapshot.isDraggingOver ? 'button__drop' : ''
        }`}
      >
        <div>add minus</div>
        <style jsx>{`
          .button {
            border-radius: 8px;
            border: 2px dashed currentColor;
            color: #999;
            text-align: center;
            padding: 8px 0;
            display: none;
            margin-top: 8px;
          }
          .button__drop {
            color: #c1c8f1;
          }
          .button__show {
            display: block;
          }
        `}</style>
      </div>
    )}
  </Droppable>
)

const Layer = ({ t }) => {
  const [currentIndex, dispatch] = useStore('house.current')
  const [furnitures] = useStore(`house.houses.${currentIndex}.furnitures`)
  const [showAddbutton, setShowState] = useState(false)
  const aggragatedData = reduce(
    (data, furniture) => {
      const zindex = path(['position', 'z'], furniture)
      return assoc(zindex, append(furniture, data[zindex] || []), data)
    },
    {},
    furnitures || []
  )
  const handleDragEnd = useCallback((result) => {
    console.log(result)
    setShowState(false)
  }, [])
  return (
    <DragDropContext
      onDragEnd={handleDragEnd}
      onBeforeDragStart={() => {
        setShowState(true)
      }}
      onBeforeCapture={() => {
        setShowState(true)
      }}
    >
      <Droppable droppableId="outside">
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {<AddMinusButton id="minus" show={showAddbutton} />}
            {pipe(
              toPairs,
              sort(ascend(pipe(prop(0), Number)))
            )(aggragatedData).map(([index, data]) => (
              <IndexBlock
                key={`block-${index}`}
                index={index}
                furnitures={data}
              />
            ))}
            {<AddMinusButton id="positive" show={showAddbutton} />}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

Layer.getInitialProps = async () => ({
  namespacesRequired: ['index'],
})

export default withTranslation('index')(Layer)
