import Immutable from 'seamless-immutable'

const user = (state = Immutable({}), action) => {
  switch (action.type) {
    case 'USER_SET':
      return Immutable(action.user)

    default:
      return state
  }
}

export default user