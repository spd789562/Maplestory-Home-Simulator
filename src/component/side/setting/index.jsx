/* store */
import { useStore } from '@store'
import { ENTER_EDIT, EXIT_EDIT } from '@store/meta'

/* i18n */
import { withTranslation } from '@i18n'

/* components */
import { Switch, Form } from 'antd'

const Setting = ({ t }) => {
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

Setting.getInitialProps = async () => ({
  namespacesRequired: ['index'],
})

export default withTranslation('index')(Setting)
