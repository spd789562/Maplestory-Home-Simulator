import { memo, useCallback } from 'react'

/* store */
import { useDispatch } from '@store'
import { DELETE_APP_FURNITURE } from '@store/app'

/* components */
import { CloseOutlined } from '@ant-design/icons'

const Delete = ({ id }) => {
  const dispatch = useDispatch()
  const handleDelete = useCallback(
    (e) => {
      e.preventDefault()
      dispatch({ type: DELETE_APP_FURNITURE, payload: id })
    },
    [id]
  )
  const handlePrevent = useCallback((e) => {
    e.preventDefault()
  }, [])
  return (
    <>
      <div className="button">
        <CloseOutlined
          onMouseOver={handlePrevent}
          onClick={handleDelete}
          style={{ fontSize: 18 }}
        />
      </div>
      <style jsx>{`
        .button {
          color: #999;
        }
        .button:hover {
          color: #f55;
        }
      `}</style>
    </>
  )
}

export default memo(Delete)
