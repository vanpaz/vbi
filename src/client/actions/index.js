
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

export function addCategory (section, group, name, price = DEFAULT_PRICE, quantities = DEFAULT_QUANTITIES) {
  return { type: 'ADD_CATEGORY', section, group, name, price, quantities }
}

export function renameCategory (section, group, categoryId, name) {
  return { type: 'RENAME_CATEGORY', section, group, categoryId, name }
}

export function deleteCategory (section, group, categoryId) {
  return { type: 'DELETE_CATEGORY', section, group, categoryId }
}

export function setParameter (parameter, value) {
  return { type: 'SET_PARAMETER', parameter, value }
}

export function setProperty (path, value) {
  return { type: 'SET_PROPERTY', path, value }
}

export function setPrice (section, group, categoryId, price) {
  return { type: 'SET_PRICE', section, group, categoryId, price }
}

export function setQuantity (section, group, categoryId, year, quantity) {
  return { type: 'SET_QUANTITY', section, group, categoryId, year, quantity }
}
