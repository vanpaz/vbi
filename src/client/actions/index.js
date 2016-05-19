
const DEFAULT_PRICE = {
  type: 'constant',
  value: '10k',
  change: '+3%'
}

const DEFAULT_QUANTITIES = {}

/**
 * Set a user profile
 * @param {{provider:string, id: string, displayName: string, email: string, photo: string}} user
 * @return {{type: string, user: {provider:string, id: string, displayName: string, email: string, photo: string}}}
 */
export function setUser (user) {
  return { type: 'SET_USER', user }
}

export function listDocs (docs) {
  return { type: 'LIST_DOCS', docs }
}

export function setDoc (doc) {
  return { type: 'SET_DOC', doc }
}

export function newDoc () {
  return { type: 'NEW_DOC' }
}

export function renameDoc (title) {
  return { type: 'RENAME_DOC', title }
}

export function addCategory (section, groupId, name, price = DEFAULT_PRICE, quantities = DEFAULT_QUANTITIES) {
  return { type: 'ADD_CATEGORY', section, groupId, name, price, quantities }
}

export function renameCategory (section, groupId, categoryId, name) {
  return { type: 'RENAME_CATEGORY', section, groupId, categoryId, name }
}

export function deleteCategory (section, groupId, categoryId) {
  return { type: 'DELETE_CATEGORY', section, groupId, categoryId }
}

export function setPeriods (periods) {
  return { type: 'SET_PERIODS', periods }
}

export function setPrice (section, groupId, categoryId, price) {
  return { type: 'SET_PRICE', section, groupId, categoryId, price }
}

export function setQuantity (section, groupId, categoryId, period, quantity) {
  return { type: 'SET_QUANTITY', section, groupId, categoryId, period, quantity }
}
