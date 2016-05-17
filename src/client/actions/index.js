
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

export function setRemoteDoc (doc) {
  return { type: 'SET_REMOTE_DOC', doc }
}

export function newDoc () {
  return { type: 'NEW_DOC' }
}

export function renameDoc (title) {
  return { type: 'RENAME_DOC', title }
}

export function deleteGroup (section, groupIndex) {
  return { type: 'DELETE_GROUP', section, groupIndex}
}

export function addCategory (section, group, category, name, price = {}, quantities = {}) {
  return { type: 'RENAME_CATEGORY', section, group, category, name, price, quantities }
}

export function renameCategory (section, group, category, name) {
  return { type: 'RENAME_CATEGORY', section, group, category, name }
}

/**
 *
 * @param {string} section    Section name
 * @param {string} group      group name
 * @param {string} category   Category name
 * @return {{type: string, section: string, group: string, category: string}}
 */
export function deleteCategory (section, group, category) {
  return { type: 'DELETE_CATEGORY', section, group, category }
}

export function setPeriods (periods) {
  return { type: 'SET_PERIODS', periods }
}

export function setPrice (section, group, category, price) {
  return { type: 'SET_PRICE', section, group, category, price }
}

export function setQuantity (section, group, category, period, quantity) {
  return { type: 'SET_QUANTITY', section, group, category, period, quantity }
}
