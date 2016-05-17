const unchangedDoc = (state = null, action) => {
  switch (action.type) {
    case 'SET_DOC':
      return action.doc

    default:
      return state
  }
}

export default unchangedDoc
