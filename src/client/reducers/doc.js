
const doc = (state = {}, action) => {
  switch (action.type) {
    case 'SET_DOC':
      return action.doc

    case 'NEW_DOC':// TODO:
      return state

    case 'UPDATE_PERIODS':// TODO:
      return state

    case 'ADD_GROUP':// TODO:
      return state

    case 'RENAME_GROUP':// TODO:
      return state

    case 'DELETE_GROUP':// TODO:
      return state

    case 'ADD_CATEGORY':// TODO:
      return state

    case 'RENAME_CATEGORY':// TODO:
      return state

    case 'DELETE_CATEGORY':// TODO:
      return state

    case 'UPDATE_PRICE':// TODO:
      return state

    case 'UPDATE_QUANTITY':// TODO:
      return state

    default:
      return state
  }
}

export default doc
