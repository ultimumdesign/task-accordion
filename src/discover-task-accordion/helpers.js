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

export {
  isObjectEqual,
  isObjectValid,
  transformData
}
