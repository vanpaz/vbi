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

export function addCategory (section, group, label, price = {}, quantities = DEFAULT_QUANTITIES) {
  return { type: 'DOC_ADD_CATEGORY', section, group, label, price, quantities }
}

/**
 * @param {string} bmcGroup
 * @param {Array.<{id: string, label: string}>} categories
 * @return {{type: string, bmcGroup: *, categories: *}}
 */
export function updateCustomCategories (bmcGroup, categories) {
  return { type: 'DOC_UPDATE_CUSTOM_CATEGORIES', bmcGroup, categories }
}

export function setCompanyType (companyType) {
  return { type: 'DOC_SET_COMPANY_TYPE', companyType }
}

export function setUniqueSellingPoint (uniqueSellingPoint) {
  return { type: 'DOC_SET_UNIQUE_SELLING_POINT', uniqueSellingPoint }
}

/**
 * Check or uncheck a BMC category
 * @param {String} bmcId
 * @param {boolean} bmcChecked
 */
export function checkCategory (bmcId, bmcChecked) {
  return { type: 'DOC_CHECK_CATEGORY', bmcId, bmcChecked }
}

export function renameCategory (categoryId, label) {
  return { type: 'DOC_RENAME_CATEGORY', categoryId, label }
}

export function moveCategoryUp (categoryId) {
  return { type: 'DOC_MOVE_CATEGORY_UP', categoryId }
}

export function moveCategoryDown (categoryId) {
  return { type: 'DOC_MOVE_CATEGORY_DOWN', categoryId }
}

/**
 * Move a category to another group
 * @param {string} categoryId
 * @param {string} groupId
 * @return {{type: string, categoryId: string, groupId: string}}
 */
export function moveCategory (categoryId, groupId) {
  return { type: 'DOC_MOVE_CATEGORY', categoryId, groupId }
}

export function deleteCategory (categoryId) {
  return { type: 'DOC_DELETE_CATEGORY', categoryId }
}

export function setParameter (parameter, value) {
  return { type: 'DOC_SET_PARAMETER', parameter, value }
}

export function setProperty (path, value) {
  return { type: 'DOC_SET_PROPERTY', path, value }
}

export function setPrice (categoryId, price) {
  return { type: 'DOC_SET_PRICE', categoryId, price }
}

export function setQuantity (categoryId, year, quantity) {
  return { type: 'DOC_SET_QUANTITY', categoryId, year, quantity }
}

/**
 * Replace the list with products
 * @param {Array.<TextItem>} products
 * @return {{type: string, products: Array.<TextItem>}}
 */
export function setProducts (products) {
  return { type: 'DOC_SET_PRODUCTS', products }
}

/**
 * Replace the list with customers
 * @param {Array.<TextItem>} customers
 * @return {{type: string, customers: Array.<TextItem>}}
 */
export function setCustomers (customers) {
  return { type: 'DOC_SET_CUSTOMERS', customers}
}
