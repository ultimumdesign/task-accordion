import { createCustomElement } from '@servicenow/ui-core'
import snabbdom from '@servicenow/ui-renderer-snabbdom'
import { createHttpEffect } from '@servicenow/ui-effect-http'

import styles from './styles.scss'

import '@servicenow/now-accordion'
import '@servicenow/now-button'
import '@servicenow/now-highlighted-value'
import '@servicenow/now-input'

function isObjectEqual (obj, source) {
  return Object.keys(source).every(key => key in obj && obj[key].value === source[key].value)
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
          key={item.id}
          selected={task.status.value === item.id} value={item.id}
        >{item.label}
        </option>
      )
    })
    const justifySection = state.selectedTask.status && state.selectedTask.status.value === 'Exception Approved'
      ? (
        <div>
          <div className='control-label'>Justification</div>
          <div className='recro-task-form'>
            <textarea
              value={task.justification.value}
              className='form-control'
              required
              rows={properties.textAreaRows}
              on-input={(e) => { inputChanged('selectedTask.justification.value', e.target.value, task) }}
            />
          </div>
          <div className='control-label'>Exception Approval Date</div>
          <div className='recro-task-form'>
            <input
              className='form-control' required='required' type='date' aria-required='true' value={task.exception_approval_date.value}
              on-input={(e) => { inputChanged('selectedTask.exception_approval_date.value', e.target.value, task) }}
            />
          </div>
          <div className='control-label'>Exception Approvers</div>
          <div className='recro-task-form'>
            <input
              className='form-control' required='required' type='text' aria-required='true' value={task.exception_approvers.value}
              on-input={(e) => { inputChanged('selectedTask.exception_approvers.value', e.target.value, task) }}
            />
          </div>
        </div>
        )
      : (
        <now-input-url
          className='recro-task-form'
          value={task.url.value} label={task.url.label}
          name='url' required={() => { return state.selectedTask.status.value !== 'Exception Approved' }}
        />
        )
    return (
      <now-accordion-item
        on-click={(e) => taskItemClicked(task)} header={task.task_catalog_ref.displayValue}
        key={task.sys_id.value} caption={{ label: task.description.value, variant: 'primary' }}
      >
        <now-highlighted-value
          slot='metadata' label={task.status.value} variant='tertiary'
        />
        <div slot='content'>
          <div className='control-label'>Status</div>
          <div className='recro-task-form'>
            <select className='form-control' required='true' aria-required='true' on-change={(e) => inputChanged('selectedTask.status.value', e.target.value, task)}>
              {statusItems}
            </select>
          </div>
          {justifySection}
          <div className='taskBtnBar'>
            <now-button
              on-click={() => taskSaveButtonClicked()} className='taskBtn'
              label='Save' variant='primary' size='md' icon='' config-aria={{}} tooltip-content='' disabled={!state.isTaskModified}
            />
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
        trigger-icon={{ type: 'plus-minus', position: 'start' }}
      >
        {taskItems}
        {debugBar}
      </now-accordion>
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
        updateState({ isTaskModified: false })
        dispatch('TASK_ACCORDION_REFRESH')
      }
    },
    SAVE_BUTTON_WATCHED: ({ action, dispatch, updateState, state, properties }) => {
      const objectIsEqual = isObjectEqual(state.selectedTask, state.selectedTaskClean)
      if (properties.debugMode) console.debug(objectIsEqual)
      if (objectIsEqual === false) {
        updateState({
          path: 'isTaskModified',
          value: true,
          operation: 'set'
        })
        return
      }
      updateState({
        path: 'isTaskModified',
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
    }
  },
  initialState: {
    selectedTask: {},
    isTaskModified: false
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
