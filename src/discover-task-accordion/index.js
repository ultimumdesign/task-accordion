import { createCustomElement } from '@servicenow/ui-core'
import snabbdom from '@servicenow/ui-renderer-snabbdom'
import { createHttpEffect } from '@servicenow/ui-effect-http'

import styles from './styles.scss'

import '@servicenow/now-accordion'
import '@servicenow/now-alert'
import '@servicenow/now-button'
import '@servicenow/now-highlighted-value'
import '@servicenow/now-icon'
import '@servicenow/now-input'
import '@servicenow/now-label-value'
import '@servicenow/now-modal'
import '@servicenow/now-rich-text'
import '@servicenow/now-textarea'
import '@servicenow/now-typeahead'

function isObjectEqual (obj, source) {
  return Object.keys(source).every(key => key in obj && obj[key].value === source[key].value)
}

function isObjectValid (obj) {
  let required
  if (obj.status.value === 'Exception Approved') {
    required = ['justification', 'exception_approval_date', 'exception_approvers']
  } else if (obj.status.value === 'Completed') {
    required = ['closed_at', 'url']
  } else required = []
  return required.every(key => (obj[key].value !== '' && obj[key].value !== null))
}

function transformData (obj) {
  return Object.keys(obj).reduce((prev, curr) => {
    if (obj[curr].value) prev[curr] = obj[curr].value
    return prev
  }, {})
}

const view = (state, { updateState, dispatch }) => {
  const { properties } = state
  const data = [...properties.data]

  function taskSaveButtonClicked () {
    const dataObj = transformData(state.selectedTask)
    updateState({ selectedTaskClean: { ...state.selectedTask } })
    dispatch('TASK_BUTTON#SAVE', { data: JSON.stringify(dataObj), id: dataObj.sys_id, table: properties.tableName })
  }

  function taskItemClicked (task) {
    dispatch('NOW_ACCORDION_ITEM#CLICKED', task)
  }

  function inputChanged (path, value, taskObj) {
    if (properties.debugMode) console.debug('value:', value)
    updateState({
      path,
      value,
      operation: 'set'
    })
    dispatch('SAVE_BUTTON_WATCHED')
  }

  const debugBar = properties.debugMode
    ? (
      <div>
        {JSON.stringify(state.selectedTask)}<br />
      </div>
      )
    : <div />

  const taskItems = data.map((task) => {
    const statusItems = properties.statusItems.items.map(item => {
      return (
        <option
          key={item.id} value={item.id} selected={task.status.value === item.id}
        >{item.label}
        </option>
      )
    })
    const completedSection = state.selectedTask.status && state.selectedTask.status.value === 'Completed'
      ? (
        <div className='discover-form-wrapper'>
          <input
            className='form-control' name='closed_at'
            type='date' required={state.selectedTask.status && state.selectedTask.status.value === 'Completed'}
            value={(task.closed_at.value && task.closed_at.value.split(' ').length) ? task.closed_at.value.split(' ')[0] : task.closed_at.value}
            invalid={state.selectedTask.closed_at && !(state.selectedTask.closed_at.value)}
            disabled={!task.closed_at.canWrite}
            on-input={(e) => { inputChanged('selectedTask.closed_at.value', e.target.value, task) }}
          />
          <label for='closed_at'>{task.closed_at.label} <now-icon icon='asterisk-fill' size='sm' /></label>
        </div>
        )
      : <div />
    const delayedSection = state.selectedTask.status && state.selectedTask.status.value === 'Delayed'
      ? (
        <now-textarea
          className='discover-task-form' name='additional_justification'
          label={state.selectedTask.additional_justification.label} value={task.additional_justification.value}
          disabled={!task.additional_justification.canWrite}
          rows={properties.textAreaRows}
        />
        )
      : <div />
    const exceptionSection = state.selectedTask.status && state.selectedTask.status.value === 'Exception Approved'
      ? (
        <div>
          <div className='discover-form-wrapper'>
            <input
              className='form-control' name='exception_approval_date'
              type='date' required={state.selectedTask.status && state.selectedTask.status.value === 'Exception Approved'}
              value={task.exception_approval_date.value}
              disabled={!task.exception_approval_date.canWrite}
              invalid={state.selectedTask.exception_approval_date && !(state.selectedTask.exception_approval_date.value)}
              on-input={(e) => { inputChanged('selectedTask.exception_approval_date.value', e.target.value, task) }}
            />
            <label for='exception_approval_date'>{task.exception_approval_date.label} <now-icon icon='asterisk-fill' size='sm' /></label>
          </div>
          <now-textarea
            className='discover-task-form' name='justification'
            label={task.justification.label} value={task.justification.value}
            required={state.selectedTask.status && state.selectedTask.status.value === 'Exception Approved'}
            invalid={state.selectedTask.justification && !(state.selectedTask.justification.value)}
            disabled={!task.justification.canWrite}
            rows={properties.textAreaRows}
          />
          <now-typeahead-multi
            manage-selected-items items={properties.userItems}
            selected-items={state.selectedTask.exception_approvers.value
              ? state.selectedTask.exception_approvers.value.split(',')
                  .map(function (sysID, index) { return { id: sysID, label: state.selectedTask.exception_approvers.displayValue.split(',')[index] } })
              : []}
            className='discover-task-form' name='exception_approvers'
            label={task.exception_approvers.label} search='managed'
            required={state.selectedTask.status && state.selectedTask.status.value === 'Exception Approved'}
            invalid={state.selectedTask.exception_approvers && !(state.selectedTask.exception_approvers.value)}
            disabled={!task.exception_approvers.canWrite}
          >
            <now-button
              on-click={() => updateState({ isModalOpen: true })} slot='end' icon='magnifying-glass-plus-outline'
              disabled={!task.exception_approvers.canWrite}
              size='sm' className='inputBtnIcon' tooltip-content='Search record'
            />
          </now-typeahead-multi>
        </div>
        )
      : (
        <div className='discover-form-wrapper'>
          <input
            className='form-control' name='expected_start'
            type='date'
            value={(task.expected_start.value && task.expected_start.value.split(' ').length) ? task.expected_start.value.split(' ')[0] : task.expected_start.value}
            disabled={!task.expected_start.canWrite}
            on-input={(e) => { inputChanged('selectedTask.expected_start.value', e.target.value, task) }}
          />
          <label for='expected_start'>{task.expected_start.label}</label>
        </div>
        )

    return (
      <now-accordion-item
        className='discover-accordion-item'
        on-click={(e) => taskItemClicked(task)} header={{ label: task.task_catalog_ref.displayValue, variant: 'secondary', size: 'md' }}
        key={task.sys_id.value} caption={{ label: task.is_required.value ? 'Required' : 'Optional', variant: 'secondary', style: 'italic' }}
      >
        <now-highlighted-value
          slot='metadata' label={task.status.value} variant='tertiary'
        />
        <div slot='content'>
          <div className={state.isAlertOpen ? 'discover-alert-bar' : 'discover-alert-bar hidden'}>
            <now-alert status='positive' icon='exclamation-triangle-fill' action={{ type: 'dismiss' }} header='Success:' content='Task was updated.' />
          </div>
          <div className='discover-task-description'>
            <now-rich-text html={task.task_catalog_ref._reference ? task.task_catalog_ref._reference.task_description.value : '<h5>Test Description</h5>'} />
          </div>
          <div className='discover-form-wrapper'>
            <select
              className='form-control' name='status' value={state.selectedTask.status ? state.selectedTask.status.value : task.status.value}
              on-change={(e) => inputChanged('selectedTask.status.value', e.target.value, task)}
              disabled={!task.status.canWrite}
            >
              {statusItems}
            </select>
            <label for='status'>{task.status.label}</label>
          </div>
          <div>
            {exceptionSection}
            {completedSection}
            {delayedSection}
            <now-input-url
              className='discover-task-form'
              value={task.url.value} label={task.url.label} placeholder='https://'
              name='url' required={(state.selectedTask.status && state.selectedTask.status.value === 'Completed')}
              invalid={(state.selectedTask.status && state.selectedTask.status.value === 'Completed') && !(state.selectedTask.url.value)}
              disabled={!task.url.canWrite}
            />
            <now-textarea
              className='discover-task-form' name='additional_artifacts'
              label={task.additional_artifacts.label} value={task.additional_artifacts.value}
              disabled={!task.additional_artifacts.canWrite}
              rows={properties.textAreaRows}
            />
          </div>
          <div className='taskBtnBar'>
            <now-button
              on-click={() => {
                if (!(state.isTaskObjectEqual) && state.isTaskValid) { taskSaveButtonClicked() }
              }} className='taskBtn'
              label='Save' variant='primary' size='md' icon='' config-aria={{}}
              tooltip-content='' disabled={state.isTaskObjectEqual || (state.isTaskValid === false)}
            />
            {task.last_updated_by.value
              ? <now-label-value-inline
                  label={task.last_updated_by.label + ':'}
                  value={task.last_updated_by._reference ? task.last_updated_by._reference.name.value : 'Test User'}
                />
              : <div />}
          </div>
        </div>
      </now-accordion-item>
    )
  })
  return (
    <div className='discover-accordion-main'>
      <now-accordion
        expand-single
        heading-level='2'
        trigger-icon={{ type: 'chevron', position: 'start' }}
      >
        {taskItems}
        {debugBar}
      </now-accordion>
      <now-modal
        manage-opened
        opened={state.isModalOpen}
        size='lg'
        header-label='Users'
      ><now-record-list-connected hide-header hide-row-selector hide-quick-edit hide-inline-editing limit='10' table='sys_user' columns='name, email' />
      </now-modal>
    </div>
  )
}

createCustomElement('discover-accordion', {
  actionHandlers: {
    'TASK_BUTTON#SAVE': createHttpEffect('api/now/table/:table/:id', {
      batch: false,
      method: 'PUT',
      headers: {
        Accepts: 'application/json',
        'Content-Type': 'application/json'
      },
      pathParams: ['table', 'id'],
      dataParam: 'data',
      successActionType: 'TASK_BUTTON_SAVE_SUCCESS'
    }),
    'TASK_USERS#SEARCH': createHttpEffect('api/now/table/:table', {
      batch: false,
      method: 'GET',
      headers: {
        Accepts: 'application/json',
        'Content-Type': 'application/json'
      },
      pathParams: ['table'],
      queryParams: ['sysparm_fields', 'sysparm_limit', 'sysparm_query'],
      successActionType: 'TASK_USERS_SEARCH_SUCCESS'
    }),
    TASK_USERS_SEARCH_REQUESTED: ({ action, dispatch, updateProperties, updateState, state, properties }) => {
      const { value } = action.payload
      const sysParmQuery = `nameSTARTSWITH${value}`
      const valueLength = value.length

      if (properties.debugMode) {
        console.debug('value', value)
        console.debug('sysParmQuery', sysParmQuery)
        console.debug('valueLength', valueLength)
      }
      if (valueLength === 0) {
        updateProperties({ userItems: [] })
      }
      if (valueLength >= 3) {
        dispatch('TASK_USERS#SEARCH', { sysparm_fields: 'name, sys_id, email', sysparm_query: sysParmQuery, table: 'sys_user', sysparm_limit: 50 })
      }
    },
    TASK_BUTTON_SAVE_SUCCESS: ({ action, dispatch, updateState, state, properties }) => {
      if (properties.debugMode) {
        console.debug('payload', action.payload)
      }

      dispatch('SAVE_BUTTON_WATCHED')
      dispatch('TASK_ACCORDION_REFRESH')
      updateState({ isAlertOpen: true })
    },
    TASK_USERS_SEARCH_SUCCESS: ({ action, dispatch, updateProperties, state, properties }) => {
      const { result } = action.payload
      if (properties.debugMode) {
        console.debug('result', result)
      }

      if (result.length) {
        const newUserItems = result.map(user => { return { id: user.sys_id, label: user.name, sublabel: user.email } })
        updateProperties({ userItems: newUserItems })
      }
    },
    'NOW_ACCORDION_ITEM#CLICKED': ({ action, dispatch, updateState, state, properties }) => {
      if (!state.selectedTask.sys_id) {
        const taskData = { ...action.payload }
        updateState({ selectedTask: taskData })
        updateState({ selectedTaskClean: taskData })
      }
      if (state.selectedTask.sys_id && state.selectedTask.sys_id.value !== action.payload.sys_id.value) {
        const taskData = { ...action.payload }
        updateState({ selectedTask: taskData })
        updateState({ selectedTaskClean: taskData })
        updateState({ isAlertOpen: false })
      }
    },
    SAVE_BUTTON_WATCHED: ({ action, dispatch, updateState, state, properties }) => {
      const objectIsEqual = isObjectEqual(state.selectedTask, state.selectedTaskClean)
      const objectIsValid = isObjectValid(state.selectedTask)
      if (properties.debugMode) {
        console.debug('object is the same:', objectIsEqual)
        console.debug('object is valid:', objectIsValid)
      }
      if (objectIsEqual === false) {
        dispatch('SAVE_BUTTON_UPDATE_REQUEST', { path: 'isTaskObjectEqual', value: false })
        updateState({ isAlertOpen: false })
      } else {
        dispatch('SAVE_BUTTON_UPDATE_REQUEST', { path: 'isTaskObjectEqual', value: true })
      }
      if (objectIsValid === true) {
        dispatch('SAVE_BUTTON_UPDATE_REQUEST', { path: 'isTaskValid', value: true })
      } else {
        dispatch('SAVE_BUTTON_UPDATE_REQUEST', { path: 'isTaskValid', value: false })
      }
    },
    SAVE_BUTTON_UPDATE_REQUEST: ({ action, dispatch, updateState, state, properties }) => {
      const { path, value } = action.payload
      updateState({
        path: path,
        value,
        operation: 'set'
      })
    },
    'NOW_INPUT_URL#INVALID_SET': ({ action, dispatch, updateState, state, properties }) => {
      const { name, value, fieldValue } = action.payload

      if (properties.debugMode) {
        console.debug('name:', name)
        console.debug('invalid:', value)
        console.debug('value:', fieldValue)
      }

      updateState({
        path: 'isTaskValid',
        value: false,
        operation: 'set'
      })
    },
    'NOW_INPUT_URL#VALUE_SET': ({ action, dispatch, updateState, state, properties }) => {
      const { name, value } = action.payload

      if (properties.debugMode) {
        console.debug('name:', name)
        console.debug('value:', value)
      }

      updateState({
        path: `selectedTask.${name}.value`,
        value,
        operation: 'set'
      })

      dispatch('SAVE_BUTTON_WATCHED')
    },
    'NOW_TEXTAREA#INPUT': ({ action, dispatch, updateState, state, properties }) => {
      const { name, fieldValue } = action.payload

      if (properties.debugMode) {
        console.debug('name:', name)
        console.debug('value:', fieldValue)
      }

      updateState({
        path: `selectedTask.${name}.value`,
        value: fieldValue,
        operation: 'set'
      })

      dispatch('SAVE_BUTTON_WATCHED')
    },
    'NOW_TYPEAHEAD_MULTI#INVALID_SET': ({ action, dispatch, updateState, state, properties }) => {
      const { name, value, fieldValue } = action.payload

      if (properties.debugMode) {
        console.debug('name:', name)
        console.debug('invalid:', value)
        console.debug('value:', fieldValue)
      }

      updateState({
        path: 'isTaskValid',
        value: false,
        operation: 'set'
      })
    },
    'NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET': ({ action, dispatch, updateState, state, properties }) => {
      const { name, value } = action.payload

      const newValue = value.reduce((prev, curr, index, list) => {
        if (prev === '') return `${curr.id}`
        else return `${prev},${curr.id}`
      }, '')
      const newDisplayValue = value.reduce((prev, curr, index) => {
        if (prev === '') return `${curr.label}`
        else return `${prev},${curr.label}`
      }, '')

      if (properties.debugMode) {
        console.debug('name:', name)
        console.debug('value:', value)
        console.debug('newVal:', newValue)
        console.debug('newDisplayvalue:', newDisplayValue)
      }

      updateState({
        path: `selectedTask.${name}.value`,
        value: newValue,
        operation: 'set'
      })

      updateState({
        path: `selectedTask.${name}.displayValue`,
        value: newDisplayValue,
        operation: 'set'
      })

      dispatch('SAVE_BUTTON_WATCHED')
    },
    'NOW_TYPEAHEAD_MULTI#VALUE_SET': ({ action, dispatch, updateState, state, properties }) => {
      const { name, value } = action.payload

      if (properties.debugMode) {
        console.debug('name:', name)
        console.debug('invalid:', value)
      }
      dispatch('TASK_USERS_SEARCH_REQUESTED', { value })
    },
    'NOW_MODAL#OPENED_SET': ({ action, dispatch, updateState, state, properties }) => {
      const { value } = action.payload

      if (properties.debugMode) {
        console.debug('value:', value)
      }

      updateState({
        path: 'isModalOpen',
        value: false,
        operation: 'set'
      })
    },
    'NOW_RECORD_LIST_CONNECTED#ROW_CLICKED': ({ action, dispatch, updateState, state, properties }) => {
      const item = action.payload
      const newApproverItem = { id: item.sys_id, label: item.row.displayValue.value, sublabel: item.row.rowData.value.get('email') }

      if (properties.debugMode) {
        console.debug('payload', action.payload)
        console.debug('approver item', newApproverItem)
      }

      const valueAsArray = state.selectedTask.exception_approvers.value
        ? state.selectedTask.exception_approvers.value.split(',')
            .map(function (sysID, index) { return { id: sysID, label: state.selectedTask.exception_approvers.displayValue.split(',')[index] } })
        : []

      dispatch('NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET', { name: 'exception_approvers', value: [...valueAsArray, newApproverItem] })
      updateState({
        path: 'isModalOpen',
        value: false,
        operation: 'set'
      })
    },
    'NOW_ALERT#ACTION_CLICKED': ({ action, dispatch, updateState, state, properties }) => {
      const value = action.payload

      if (properties.debugMode) {
        console.debug('value:', value)
      }

      updateState({
        path: 'isAlertOpen',
        value: false,
        operation: 'set'
      })
    }
  },
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
