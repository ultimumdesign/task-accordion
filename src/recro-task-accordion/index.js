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
import '@servicenow/now-modal'
import '@servicenow/now-rich-text'
import '@servicenow/now-textarea'
import '@servicenow/now-typeahead'

function isObjectEqual (obj, source) {
  return Object.keys(source).every(key => key in obj && obj[key].value === source[key].value)
}

function isObjectValid (obj) {
  if (obj.status.value !== 'Exception Approved') {
    const required = ['url']
    return required.every(key => (obj[key].value !== '' && obj[key].value !== null))
  } else {
    const required = ['justification', 'exception_approval_date', 'exception_approvers']
    return required.every(key => (obj[key].value !== '' && obj[key].value !== null))
  }
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

  // function getToday () {
  //   let today = new Date()
  //   let dd = today.getDate()
  //   let mm = today.getMonth() + 1 // January is 0!
  //   const yyyy = today.getFullYear()

  //   if (dd < 10) {
  //     dd = '0' + dd
  //   }

  //   if (mm < 10) {
  //     mm = '0' + mm
  //   }

  //   today = yyyy + '-' + mm + '-' + dd
  //   return today
  // }

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
    const approverItems = properties.approverItems.items
    const justifySection = state.selectedTask.status && state.selectedTask.status.value === 'Exception Approved'
      ? (
        <div>
          <div className='recro-form-wrapper'>
            <input
              className='form-control' name='exception_approval_date'
              type='date' required={state.selectedTask.status && state.selectedTask.status.value === 'Exception Approved'}
              invalid={state.selectedTask.exception_approval_date && !(state.selectedTask.exception_approval_date.value)}
              on-input={(e) => { inputChanged('selectedTask.exception_approval_date.value', e.target.value, task) }}
            />
            <label for='exception_approval_date'>{task.exception_approval_date.label} <now-icon icon='asterisk-fill' size='sm' /></label>
          </div>
          <now-textarea
            className='recro-task-form' name='justification'
            label={state.selectedTask.justification.label} value={task.justification.value}
            required={state.selectedTask.status && state.selectedTask.status.value === 'Exception Approved'}
            invalid={state.selectedTask.justification && !(state.selectedTask.justification.value)}
            disabled={!task.justification.canWrite}
            rows={properties.textAreaRows}
          />
          <now-typeahead-multi
            manage-selected-items items={approverItems}
            selected-items={state.selectedTask.exception_approvers.value
              ? state.selectedTask.exception_approvers.value.split(',')
                  .map(function (sysID, index) { return { id: sysID, label: state.selectedTask.exception_approvers.displayValue.split(',')[index] } })
              : []}
            className='recro-task-form' name='exception_approvers'
            label={task.exception_approvers.label} search='initial'
            required={state.selectedTask.status && state.selectedTask.status.value === 'Exception Approved'}
            invalid={state.selectedTask.exception_approvers && !(state.selectedTask.exception_approvers.value)}
            disabled={!task.exception_approvers.canWrite}
          ><now-button on-click={() => updateState({ isModalOpen: true })} slot='end' icon='magnifying-glass-plus-outline' size='sm' className='inputBtnIcon' tooltip-content='Search record' />
          </now-typeahead-multi>
        </div>
        )
      : (
        <now-input-url
          className='recro-task-form'
          value={task.url.value} label={task.url.label} placeholder='https://'
          name='url' required={(state.selectedTask.status && state.selectedTask.status.value !== 'Exception Approved')}
        />
        )
    return (
      <now-accordion-item
        className='recro-accordion-item'
        on-click={(e) => taskItemClicked(task)} header={{ label: task.task_catalog_ref.displayValue, variant: 'secondary', size: 'sm' }}
        key={task.sys_id.value} caption={{ label: task.is_required.value ? 'Required' : 'Optional', variant: 'secondary', style: 'italic' }}
      >
        <now-highlighted-value
          slot='metadata' label={task.status.value} variant='tertiary'
        />
        <div slot='content'>
          <div className='recro-task-description'>
            <now-rich-text html={task.task_catalog_ref._reference ? task.task_catalog_ref._reference.task_description.value : '<h5>Test Description</h5>'} />
          </div>
          <div className='recro-form-wrapper'>
            <select
              className='form-control' name='status' value={state.selectedTask.status ? state.selectedTask.status.value : task.status.value}
              on-change={(e) => inputChanged('selectedTask.status.value', e.target.value, task)}
            >
              {statusItems}
            </select>
            <label for='status'>{task.status.label}</label>
          </div>
          {justifySection}
          <div className='taskBtnBar'>
            <now-button
              on-click={() => taskSaveButtonClicked()} className='taskBtn'
              label='Save' variant='primary' size='md' icon='' config-aria={{}}
              tooltip-content='' disabled={state.isTaskObjectEqual || (state.isTaskValid === false)}
            />
            {state.isAlertOpen ? <now-alert status='positive' icon='exclamation-triangle-fill' header='Success:' content='Task was updated.' /> : <span />}
          </div>
        </div>
      </now-accordion-item>
    )
  })
  return (
    <div className='rero-accordion-main'>
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

createCustomElement('recro-task-accordion', {
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
    TASK_BUTTON_SAVE_SUCCESS: ({ action, dispatch, updateState, state, properties }) => {
      console.info('SAVE SUCCESS')
      dispatch('TASK_ACCORDION_REFRESH')
      updateState({ isTaskObjectEqual: true })
      updateState({ isAlertOpen: true })
    },
    TASK_ACCORDION_STATUS_REFRESH: ({ action, dispatch, updateProperties, state, properties }) => {
      updateProperties({ statusItems: { items: [...properties.statusItems.items] } })
    },
    'NOW_ACCORDION_ITEM#CLICKED': ({ action, dispatch, updateState, state, properties }) => {
      // console.debug('payload', action.payload)
      if (!state.selectedTask.sys_id) {
        const taskData = { ...action.payload }
        updateState({ selectedTask: taskData })
        updateState({ selectedTaskClean: taskData })
      }
      if (state.selectedTask.sys_id && state.selectedTask.sys_id.value !== action.payload.sys_id.value) {
        const taskData = { ...action.payload }
        updateState({ selectedTask: taskData })
        updateState({ selectedTaskClean: taskData })
        dispatch('TASK_ACCORDION_STATUS_REFRESH')
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
      const newApproverItem = { id: item.sys_id, label: item.row.displayValue.value }
      if (properties.debugMode) {
        console.debug('approver item:', newApproverItem)
      }
      const valueAsArray = state.selectedTask.exception_approvers.value.split(',')
        .map(function (sysID, index) { return { id: sysID, label: state.selectedTask.exception_approvers.displayValue.split(',')[index] } })
      dispatch('NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET', { name: 'exception_approvers', value: [...valueAsArray, newApproverItem] })
      updateState({
        path: 'isModalOpen',
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
      default: [
        // {
        //   sys_id: { value: 1 },
        //   title: { value: 'Report Generation' },
        //   description: { value: 'This is a task to enable the report generation.' },
        //   status: { value: 'Not Started' },
        //   status_color: { value: 'info' },
        //   url: { value: 'https://service-now.com' }
        // },
        // {
        //   sys_id: { value: 2 },
        //   title: { value: 'Task Analysis' },
        //   description: { value: 'This is a task that requires the analysis of task items.' },
        //   status: { value: 'Completed' },
        //   status_color: { value: 'positive' },
        //   url: { value: 'https://service-now.com' }
        // }
      ]
    },
    statusItems: {
      default: [
        // { id: 'not_started', label: 'Not Started' },
        // { id: 'in_progress', label: 'In Progress' },
        // { id: 'completed', label: 'Completed' },
        // { id: 'delayed'', label: 'Delayed' },
        // { id: 'exception_approved', label: 'Exception Approved' }
      ]
    },
    approverItems: {
      default: [
        // { id: 'sys_id', label: 'John Doe' },
      ]
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
