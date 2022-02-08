
import { isObjectEqual, isObjectValid } from './helpers.js'
import { createHttpEffect } from '@servicenow/ui-effect-http'

const actions = {
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
  TASK_USERS_SEARCH_REQUESTED: ({ action, dispatch, updateProperties, properties }) => {
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
  TASK_BUTTON_SAVE_SUCCESS: ({ action, dispatch, updateState, properties }) => {
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
}

export { actions }
