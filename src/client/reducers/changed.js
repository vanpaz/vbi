/**
 * Set a boolean true
 * @param state
 * @param action
 * @return {boolean}
 */
const changed = (state = false, action) => {

  if (/^DOC_/.test(action.type)) {
    // the action starts with a prefix "DOC_"

    if (action.type === 'DOC_SET') {
      return false
    }
    else {
      return true
    }
  }
  else {
    return state
  }
}

export default changed
