import { request } from './request'
import debugFactory from 'debug/browser'

const debug = debugFactory('vbi:rest:docs')

const NOTIFICATION_AUTO_HIDE_DURATION = 4000

/**
 * Open a document by it's id
 * @param {string} id
 * @param {string} [title]
 * @param {function} onNotification
 * @return {Promise.<Object, Error>}
 */
export function open (id, title, onNotification) {
  debug ('open document', id)

  onNotification({
    closeable: false,
    message: `Opening ${title || id}...`
  })

  return request('GET', `/docs/${id}`)
      .then(doc => {
        debug ('document opened', doc)

        onNotification({
          message: `Opened ${title || doc.title || id}`,
          duration: 4000
        })

        return doc
      })
}

/**
 * Save a document in the database. Creates a new document or updates the
 * existing document.
 * @param {Object} doc
 * @param {function} onNotification
 * @return {Promise.<Object, Error>}
 */
export function save (doc, onNotification) {
  debug ('saving document...', doc)

  onNotification({
    closeable: false,
    message: `Saving ${doc.title || doc._id}...`
  })

  let promise = doc._id
      ? request('PUT', `/docs/${doc._id}`, doc)   // update existing
      : request('POST', '/docs', doc);                 // create new

  return promise
      .then(response => {
        debug ('document saved', response)

        onNotification({
          message: `Saved ${doc.title || doc._id}`,
          duration: NOTIFICATION_AUTO_HIDE_DURATION
        })

        return response
      })
}

/**
 * Delete a document
 * @param {string} id
 * @param {string} rev
 * @param {string} [title]
 * @param {function} onNotification
 * @return {*}
 */
export function del (id, rev, title, onNotification) {
  debug('delete document', id, rev)

  onNotification({
    message: `Deleting ${title || id}`
  })

  return request('DELETE', `/docs/${id}/${rev}`)
      .then(() => {
        onNotification({
          message: `Deleted ${title || id}`
        })
      })
}

/**
 * Get a list with all documents of the current user
 * @return {Array.<{id: string, rev: string, title: string, updated: string}>}
 */
export function list () {
  debug('list documents')

  return request('GET', '/docs').then(response => {
    let list = response.rows.map(row => row.value)
    debug('documents', list)
    return list
  })
}
