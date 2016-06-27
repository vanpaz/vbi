
// TODO: different default prices based on the section and group
const DEFAULT_PRICE = {
  // type: 'constant',
  // value: '10k',
  // change: '+3%'
}

const DEFAULT_QUANTITIES = {}

/**
 * Set active page
 * @param {'model' | 'finance'} page
 * @return {{type: string, page: string}}
 */
export function viewPage (page) {
  return { type: 'VIEW_PAGE', page}
}

/**
 * Set an active inputs tab
 * @param {'parameters' | 'costs' | 'investments' | 'revenues'} tab   Tab name
 * @return {{type: string, tab: string}}
 */
export function viewInputs (tab) {
  return { type: 'VIEW_INPUTS', tab}
}

/**
 * Set an active outputs tab
 * @param {'profitAndLoss' | 'balanceSheet' | 'cashFlow'} tab   Tab name
 * @return {{type: string, tab: string}}
 */
export function viewOutputs (tab) {
  return { type: 'VIEW_OUTPUTS', tab}
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

export function addCategory (section, group, name, price = {}, quantities = DEFAULT_QUANTITIES) {
  return { type: 'DOC_ADD_CATEGORY', section, group, name, price, quantities }
}

export function setCustomCategories (bmcGroup, categories) {
  return { type: 'DOC_SET_CUSTOM_CATEGORIES', bmcGroup, categories }
}

/**
 * Check or uncheck a BMC category
 * @param {String} bmcId
 * @param {boolean} checked
 */
export function checkCategory (bmcId, bmcChecked) {
  return { type: 'DOC_CHECK_CATEGORY', bmcId, bmcChecked }
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
