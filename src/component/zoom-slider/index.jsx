import { memo } from 'react'

/* store */
import { useStore } from '@store'
import { UPDATE_ZOOM_VALUE } from '@store/meta'
import { UPDATE_APP_ZOOM } from '@store/app'

/* component */
import { Slider } from 'antd'

const sliderContainerStyle = {
  position: 'absolute',
  bottom: 0,
  right: 40,
  width: '30%',
}

const ZoomSlider = ({ setZoom }) => {
  const [{ value, min, max }, dispatch] = useStore('meta.zoom')
  const [isSideOpen] = useStore('meta.side.open')
  const marks = {
    [min]: '',
    1: '',
    [max]: '',
  }
  const handleChange = (value) => {
    setZoom(value)
    dispatch({ type: UPDATE_ZOOM_VALUE, payload: value })
    dispatch({ type: UPDATE_APP_ZOOM, payload: value })
  }
  return (
    <div style={{ ...sliderContainerStyle, right: isSideOpen ? 340 : 40 }}>
      <Slider
        min={min}
        max={max}
        marks={marks}
        step={0.01}
        value={value}
        onChange={handleChange}
        tooltip={{
          open: false,
        }}
      />
    </div>
  )
}

export default memo(ZoomSlider)
