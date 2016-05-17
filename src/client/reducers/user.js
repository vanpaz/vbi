import Immutable from 'seamless-immutable'

const user = (state = Immutable({}), action) => {
  switch (action.type) {
    case 'SET_USER':
      return Immutable(action.user)

    default:
      return state
  }
}

export default user