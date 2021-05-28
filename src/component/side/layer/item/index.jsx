import { memo } from 'react'
import ReactDOM from 'react-dom'

/* components */
import { List, Avatar, Typography } from 'antd'
import { Draggable } from 'react-beautiful-dnd'
import { CloseOutlined } from '@ant-design/icons'
import Delete from './delete'

/* utils */
import { isPoster } from '@utils/furniture'

/* mapping */
import { filteredFurniture as FurnitureMapping } from '@mapping/furniture'
import StringMapping from '@mapping/furniture-string'

import styles from './item.module.scss'

const Item = ({ id, furnitureID, index }) => {
  const _isPoster = isPoster(FurnitureMapping[furnitureID] || {})

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => {
        const name = StringMapping[+furnitureID].name
        const child = (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${styles.item} ${
              snapshot.isDragging ? styles.item__drag : ''
            }`}
          >
            <List.Item actions={[<Delete id={id} />]}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`/furniture/Item-Consume-0267.img-${furnitureID}${
                      _isPoster ? '-layer1-0' : '-info-icon'
                    }.png`}
                    shape="square"
                  />
                }
                title={
                  <Typography.Paragraph
                    ellipsis={{ tooltip: name }}
                    style={{ marginBottom: 0 }}
                  >
                    {name}
                  </Typography.Paragraph>
                }
              />
            </List.Item>
          </div>
        )
        return snapshot.isDragging
          ? ReactDOM.createPortal(child, document.body)
          : child
      }}
    </Draggable>
  )
}

export default memo(Item)
