import debugFactory from 'debug/browser';

const debug = debugFactory('vbi:rest');

export const BASE_URL = '/api/v1';

export function listDocs () {
  return fetchIt('GET', BASE_URL + '/docs');
}

export function getDoc (id) {
  return fetchIt('GET', BASE_URL + '/docs/' + id);
}

export function createDoc (doc) {
  return fetchIt('POST', BASE_URL + '/docs', doc);
}

export function updateDoc (doc) {
  return fetchIt('PUT', BASE_URL + '/docs/' + doc._id, doc);
}

export function deleteDoc (id, rev) {
  return fetchIt('DELETE', BASE_URL + '/docs/' + id + '/' + rev);
}

/**
 * Get the users profile
 * @return {Promise.<Object, Error>} Resolves with the retrieved user profile, or with an empty object when not logged in
 */
export function getUser () {
  return fetchIt('GET', BASE_URL + '/auth/user');
}

/**
 * Fetch a url
 * @param {string} method    A string 'GET', 'POST', etc
 * @param {string} url
 * @param {Object} [body]   JSON object
 * @return {Promise.<Object, Error>}
 */
export function fetchIt (method, url, body) {
  debug('fetch', method, url, body);
  return fetch(url, {
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
      debug('Error fetching user profile', response.status, response);
      throw new Error(`Error fetching ${method} ${url}`);
    }

    // Parse response body
    return response.json().then(data => {
      debug('fetch response', data);
      return data;
    });
  });
}
