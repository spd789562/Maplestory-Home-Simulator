/* store */
import { useStore } from '@store'
import { ENTER_EDIT, EXIT_EDIT } from '@store/meta'

/* i18n */
import { useTranslation } from 'next-i18next'

/* components */
import { Switch, Form } from 'antd'

const Setting = () => {
  const { t } = useTranslation('index')
  const [{ edit }, dispatch] = useStore('meta')

  const handleChangeEdit = (checked) => {
    dispatch({ type: checked ? ENTER_EDIT : EXIT_EDIT })
  }

  return (
    <div>
      <Form.Item label={t('setting_edit')}>
        ：
        <Switch
          checkedChildren={t('setting_edit_open')}
          unCheckedChildren={t('setting_edit_close')}
          checked={edit}
          onChange={handleChangeEdit}
        />
      </Form.Item>
    </div>
  )
}
export default Setting
