import Immutable from 'seamless-immutable'

const docs = (state = Immutable([]), action) => {
  switch (action.type) {
    case 'LIST_DOCS':
      return Immutable(action.docs)

    default:
      return state
  }
}

export default docs
