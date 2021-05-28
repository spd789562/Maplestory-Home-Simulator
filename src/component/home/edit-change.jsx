import { useEffect, createRef, useRef, memo } from 'react'

/* store */
import { useStore } from '@store'
import { UPDATE_APP_EDIT } from '@store/app'

const EditChange = () => {
  const [isEdit, dispatch] = useStore('meta.edit')

  useEffect(() => {
    dispatch({ type: UPDATE_APP_EDIT, payload: isEdit })
  }, [isEdit])

  return null
}

export default memo(EditChange)
