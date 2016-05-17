const remoteDoc = (state = null, action) => {
  switch (action.type) {
    case 'SET_REMOTE_DOC':
      return action.doc

    default:
      return state
  }
}

export default remoteDoc
