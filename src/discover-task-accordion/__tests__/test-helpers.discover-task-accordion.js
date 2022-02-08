import 'regenerator-runtime/runtime'
import assert from 'assert'
import sinon from 'sinon'

import { actions } from '../actions'

import {
  isObjectEqual,
  isObjectValid,
  transformData
} from '../helpers.js'

/* eslint-disable-next-line no-undef */
describe('discover-task-accordion actions', () => {
  /* eslint-disable-next-line no-undef */
  it('try TASK_BUTTON#SAVE and it should be true', () => {
    const testFn = sinon.fake(actions['TASK_BUTTON#SAVE'].effect)
    testFn()
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try TASK_USERS#SEARCH and it should be true', () => {
    const testFn = sinon.fake(actions['TASK_USERS#SEARCH'].effect)
    testFn()
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try TASK_USERS_SEARCH_REQUESTED and it should be true', () => {
    const testFn = sinon.fake(actions.TASK_USERS_SEARCH_REQUESTED)
    testFn({
      action: { payload: { value: 'test' } },
      dispatch: sinon.fake(),
      updateProperties: sinon.fake(),
      properties: {}
    })
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try TASK_BUTTON_SAVE_SUCCESS and it should be true', () => {
    const testFn = sinon.fake(actions.TASK_BUTTON_SAVE_SUCCESS)
    testFn({
      action: { value: 'test' },
      dispatch: sinon.fake(),
      updateState: sinon.fake(),
      properties: {}
    })
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try TASK_USERS_SEARCH_SUCCESS and it should be true', () => {
    const testFn = sinon.fake(actions.TASK_USERS_SEARCH_SUCCESS)
    testFn({
      action: { payload: { result: [] } },
      dispatch: sinon.fake(),
      updateState: sinon.fake(),
      properties: {}
    })
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try NOW_ACCORDION_ITEM#CLICKED and it should be true', () => {
    const testFn = sinon.fake(actions['NOW_ACCORDION_ITEM#CLICKED'])
    testFn({
      action: { result: 'test' },
      dispatch: sinon.fake(),
      updateState: sinon.fake(),
      properties: {},
      state: { selectedTask: {} }
    })
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try SAVE_BUTTON_WATCHED and it should be true', () => {
    const testFn = sinon.fake(actions.SAVE_BUTTON_WATCHED)
    testFn({
      action: { result: 'test' },
      dispatch: sinon.fake(),
      updateState: sinon.fake(),
      properties: {},
      state: { selectedTask: { status: { value: '' } }, selectedTaskClean: {} }
    })
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try SAVE_BUTTON_UPDATE_REQUEST and it should be true', () => {
    const testFn = sinon.fake(actions.SAVE_BUTTON_UPDATE_REQUEST)
    testFn({
      action: { payload: { path: 'test', value: 'test' } },
      dispatch: sinon.fake(),
      updateState: sinon.fake(),
      properties: {},
      state: { selectedTask: { status: { value: '' } }, selectedTaskClean: {} }
    })
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try NOW_INPUT_URL#INVALID_SET and it should be true', () => {
    const testFn = sinon.fake(actions['NOW_INPUT_URL#INVALID_SET'])
    testFn({
      action: { payload: { name: 'test', value: 'test', fieldValue: 'test' } },
      dispatch: sinon.fake(),
      updateState: sinon.fake(),
      properties: {},
      state: { selectedTask: { status: { value: '' } }, selectedTaskClean: {} }
    })
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try NOW_INPUT_URL#VALUE_SET and it should be true', () => {
    const testFn = sinon.fake(actions['NOW_INPUT_URL#VALUE_SET'])
    testFn({
      action: { payload: { name: 'test', value: 'test' } },
      dispatch: sinon.fake(),
      updateState: sinon.fake(),
      properties: {},
      state: { selectedTask: { status: { value: '' } }, selectedTaskClean: {} }
    })
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try NOW_TEXTAREA#INPUT and it should be true', () => {
    const testFn = sinon.fake(actions['NOW_TEXTAREA#INPUT'])
    testFn({
      action: { payload: { name: 'test', fieldValue: 'test' } },
      dispatch: sinon.fake(),
      updateState: sinon.fake(),
      properties: {},
      state: { selectedTask: { status: { value: '' } }, selectedTaskClean: {} }
    })
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try NOW_TYPEAHEAD_MULTI#INVALID_SET and it should be true', () => {
    const testFn = sinon.fake(actions['NOW_TYPEAHEAD_MULTI#INVALID_SET'])
    testFn({
      action: { payload: { name: 'test', value: 'test', fieldValue: 'test' } },
      dispatch: sinon.fake(),
      updateState: sinon.fake(),
      properties: {},
      state: { selectedTask: { status: { value: '' } }, selectedTaskClean: {} }
    })
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET and it should be true', () => {
    const testFn = sinon.fake(actions['NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET'])
    testFn({
      action: { payload: { name: 'test', value: [], fieldValue: 'test' } },
      dispatch: sinon.fake(),
      updateState: sinon.fake(),
      properties: {},
      state: { selectedTask: { status: { value: '' } }, selectedTaskClean: {} }
    })
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try NOW_TYPEAHEAD_MULTI#VALUE_SET and it should be true', () => {
    const testFn = sinon.fake(actions['NOW_TYPEAHEAD_MULTI#VALUE_SET'])
    testFn({
      action: { payload: { name: 'test', value: [], fieldValue: 'test' } },
      dispatch: sinon.fake(),
      updateState: sinon.fake(),
      properties: {},
      state: { selectedTask: { status: { value: '' } }, selectedTaskClean: {} }
    })
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try NOW_MODAL#OPENED_SET and it should be true', () => {
    const testFn = sinon.fake(actions['NOW_MODAL#OPENED_SET'])
    testFn({
      action: { payload: { name: 'test', value: [], fieldValue: 'test' } },
      dispatch: sinon.fake(),
      updateState: sinon.fake(),
      properties: {},
      state: { selectedTask: { status: { value: '' } }, selectedTaskClean: {} }
    })
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try NOW_RECORD_LIST_CONNECTED#ROW_CLICKED and it should be true', () => {
    const testFn = sinon.fake(actions['NOW_RECORD_LIST_CONNECTED#ROW_CLICKED'])
    testFn({
      action: { payload: { row: { displayValue: 'test', rowData: { value: { get: sinon.fake() } } } } },
      dispatch: sinon.fake(),
      updateState: sinon.fake(),
      properties: {},
      state: { selectedTask: { exception_approvers: { value: '' } }, selectedTaskClean: {} }
    })
    assert.equal(testFn.callCount, 1)
  })
  /* eslint-disable-next-line no-undef */
  it('try NOW_ALERT#ACTION_CLICKED and it should be true', () => {
    const testFn = sinon.fake(actions['NOW_ALERT#ACTION_CLICKED'])
    testFn({
      action: { payload: {} },
      dispatch: sinon.fake(),
      updateState: sinon.fake(),
      properties: {},
      state: { selectedTask: {}, selectedTaskClean: {} }
    })
    assert.equal(testFn.callCount, 1)
  })
})

// helpers.js

/* eslint-disable-next-line no-undef */
describe('discover-task-accordion helpers', () => {
  /* eslint-disable-next-line no-undef */
  it('try isObjectEqual() and it should be true', () => {
    const result = isObjectEqual(
      {
        name: {
          value: 'test'
        }
      },
      {
        name: {
          value: 'test'
        }
      }
    )
    assert.equal(result, true)
  })
  /* eslint-disable-next-line no-undef */
  it('try isObjectEqual() and it should be false', () => {
    const result = isObjectEqual(
      {
        name: {
          value: 'test'
        }
      },
      {
        name: {
          value: 'user'
        }
      }
    )
    assert.equal(result, false)
  })
  /* eslint-disable-next-line no-undef */
  it('try isObjectValid() with Exception Approved status and it should be true', () => {
    const result = isObjectValid(
      {
        status: {
          value: 'Exception Approved'
        },
        justification: {
          value: 'test'
        },
        exception_approval_date: {
          value: 'test'
        },
        exception_approvers: {
          value: 'test'
        }
      }
    )
    assert.equal(result, true)
  })
  it('try isObjectValid() with Exception Approved status and it should be false', () => {
    const result = isObjectValid(
      {
        status: {
          value: 'Exception Approved'
        },
        justification: {
          value: 'test'
        },
        exception_approval_date: {
          value: null
        },
        exception_approvers: {
          value: 'test'
        }
      }
    )
    assert.equal(result, false)
  })
  /* eslint-disable-next-line no-undef */
  it('try isObjectValid() with Completed status and it should be true', () => {
    const result = isObjectValid(
      {
        status: {
          value: 'Completed'
        },
        closed_at: {
          value: 'test'
        },
        url: {
          value: 'test'
        }
      }
    )
    assert.equal(result, true)
  })
  /* eslint-disable-next-line no-undef */
  it('try isObjectValid() with Completed status and it should be false', () => {
    const result = isObjectValid(
      {
        status: {
          value: 'Completed'
        },
        closed_at: {
          value: 'test'
        },
        url: {
          value: ''
        }
      }
    )
    assert.equal(result, false)
  })
  /* eslint-disable-next-line no-undef */
  it('try transformData() and it should be true', () => {
    const result = transformData(
      {
        status: {
          value: 'Not Started'
        },
        closed_at: {
          value: 'test'
        },
        url: {
          value: 'test'
        }
      }
    )
    assert.deepEqual(result, {
      status: 'Not Started',
      closed_at: 'test',
      url: 'test'
    })
  })
})
