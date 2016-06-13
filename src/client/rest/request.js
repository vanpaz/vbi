import debugFactory from 'debug/browser'

// load HTML5 fetch polyfill
import 'isomorphic-fetch'

const debug = debugFactory('vbi:rest')

export const BASE_URL = '/api/v1'

/**
 * Fetch a url, where request and response bodies are always JSON.
 * All url's are prepended by the configured BASE_URL
 * @param {string} method    A string 'GET', 'POST', etc
 * @param {string} url
 * @param {Object} [body=undefined]   JSON object
 * @return {Promise.<Object, Error>}
 */
export function request (method, url, body) {
  debug('fetch', method, url, body)

  return fetch(BASE_URL + url, {
    method: method,
    headers: body
        ? new Headers({
            'Content-Type': 'application/json'
          })
        : undefined,
    body: body
        ? JSON.stringify(body)
        : undefined,
    credentials: 'include'
  }).then((response) => {
    if (response.status < 200 || response.status >= 300) {
      debug('Error fetching user profile', response.status, response)
      throw new Error(`Error fetching ${method} ${url}`)
    }

    // Parse response body
    return response.json().then(data => {
      debug('fetch response', data)
      return data
    })
  })
}
