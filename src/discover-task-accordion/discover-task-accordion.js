import { createCustomElement } from '@servicenow/ui-core'
import snabbdom from '@servicenow/ui-renderer-snabbdom'
import { actions } from './actions'
import { view } from './view'
import styles from './styles.scss'

createCustomElement('discover-accordion', {
  actionHandlers: actions,
  initialState: {
    selectedTask: {},
    isAlertOpen: false,
    isModalOpen: false,
    isTaskObjectEqual: true,
    isTaskValid: false
  },
  properties: {
    data: {
      default: []
    },
    statusItems: {
      default: []
    },
    userItems: {
      default: []
    },
    debugMode: {
      default: false
    },
    textAreaRows: {
      default: 3
    },
    tableName: {
      default: ''
    }
  },
  renderer: { type: snabbdom },
  view,
  styles
})
