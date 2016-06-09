
const DEFAULT_PRICE = {
  type: 'constant',
  value: '10k',
  change: '+3%'
}

const DEFAULT_QUANTITIES = {}

/**
 * Set a view
 * @param {'finance' | 'model'} view
 * @return {{type: string, view: string}}
 */
export function setView (view) {
  return { type: 'SET_VIEW', view }
}

/**
 * Set a user profile
 * @param {{provider:string, id: string, displayName: string, email: string, photo: string}} user
 * @return {{type: string, user: {provider:string, id: string, displayName: string, email: string, photo: string}}}
 */
export function setUser (user) {
  return { type: 'USER_SET', user }
}

export function listDocs (docs) {
  return { type: 'DOCS_LIST', docs }
}

export function setDoc (doc) {
  return { type: 'DOC_SET', doc }
}

export function renameDoc (title) {
  return { type: 'DOC_RENAME', title }
}

export function addCategory (section, group, name, price = DEFAULT_PRICE, quantities = DEFAULT_QUANTITIES) {
  return { type: 'DOC_ADD_CATEGORY', section, group, name, price, quantities }
}

export function renameCategory (section, group, categoryId, name) {
  return { type: 'DOC_RENAME_CATEGORY', section, group, categoryId, name }
}

export function moveCategoryUp (section, group, categoryId) {
  return { type: 'DOC_MOVE_CATEGORY_UP', section, group, categoryId }
}

export function moveCategoryDown (section, group, categoryId) {
  return { type: 'DOC_MOVE_CATEGORY_DOWN', section, group, categoryId }
}

export function deleteCategory (section, group, categoryId) {
  return { type: 'DOC_DELETE_CATEGORY', section, group, categoryId }
}

export function setParameter (parameter, value) {
  return { type: 'DOC_SET_PARAMETER', parameter, value }
}

export function setProperty (path, value) {
  return { type: 'DOC_SET_PROPERTY', path, value }
}

export function setPrice (section, group, categoryId, price) {
  return { type: 'DOC_SET_PRICE', section, group, categoryId, price }
}

export function setQuantity (section, group, categoryId, year, quantity) {
  return { type: 'DOC_SET_QUANTITY', section, group, categoryId, year, quantity }
}
