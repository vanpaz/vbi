import Immutable from 'seamless-immutable'

const docs = (state = Immutable([]), action) => {
  switch (action.type) {
    case 'DOCS_LIST':
      return Immutable(action.docs)

    default:
      return state
  }
}

export default docs
