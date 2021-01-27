/* utils */
import { map, values } from 'ramda'

const ChangeObject = ({ type, themes, handleChange }) => {
  return (
    <div>
      {type}
      <br />
      {map(
        (data) => (
          <img
            src={`/theme-ui/Item-Consume-0267.img-0${data.itemID}-info-preview.png`}
            alt=""
            onClick={handleChange(data)}
            key={`home-obj-${data.itemID}`}
          />
        ),
        values(themes)
      )}
    </div>
  )
}

export default ChangeObject
