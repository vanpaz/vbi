import Emitter from 'emitter-component';
import { cloneDeep } from 'lodash';
import debugFactory from 'debug/browser';
import { request } from './request';
import { hash } from './hash'
const debug = debugFactory('vbi:scenario');

const EXAMPLE_DOC = require('../../../data/example_company.json');

// TODO: allow empty doc
// const EMPTY_DOC = {
//   title: 'New Scenario',
//   data: {
//     costs: [],
//     revenues: []
//   }
// };
const EMPTY_DOC = EXAMPLE_DOC;

/**
 * Manage a scenario.
 * The scenario can be get/set, and can be saved/opened from the server.
 * The Scenario listens for changes in the hash of the browser location and
 * reflects the id of the current document there.
 */
export default class Scenario {
  constructor () {
    // turn this class into an event emitter
    Emitter(this);

    this.dirty = false;
    this.doc = EMPTY_DOC;

    let id = hash.get('id');
    if (id) {
      this._handleChangedId(id);
    }

    // listen for changes in the hash
    hash.onChange('id', (id) => this._handleChangedId(id));
  }

  _handleChangedId (id, oldId) {
    debug('hash changed, new id:', id, ', old id:', oldId);

    if (id) {
      if (this.dirty) {
        // TODO: what to do when there are changes?
      }
      this.open(id).then(doc => this.emit('change', doc));
    }
    else {
      this._set(EMPTY_DOC);
      this.emit('change', this.get());
    }
  }

  /**
   * Create a new, empty document
   */
  createNew () {
    if (this.dirty) {
      return Promise.reject(new Error('Cannot create new document, current document has unsaved changes'));
    }

    this._set(EMPTY_DOC);
  }

  /**
   * Retrieve the current document. Returns a clone of the document
   * @return {{title: string, data: {costs: Array, revenues: Array}}}
   */
  get () {
    return cloneDeep(this.doc);
  }

  /**
   * Update the current document. Will mark the document as dirty, as it needs
   * to be saved.
   * @param {Object} doc
   */
  set (doc) {
    this._set(doc);
    this.dirty = doc._id ? true : false;
  }

  /**
   * Internal method to set a document and update the hash.
   * Document will be marked as NOT dirty
   * @param {Object} doc
   * @private
   */
  _set (doc) {
    this.dirty = false;
    this.doc = cloneDeep(doc);

    if (this.doc._id) {
      hash.set('id', this.doc._id);
    }
    else {
      hash.remove('id');
    }
  }

  /**
   * Save a document in the database. Creates a new document or updates the
   * existing document.
   * @return {Promise.<Object, Error>}
   */
  save () {
    debug ('saving document...');

    this.emit('saving', {
      type: 'start',
      title: this.doc.title,
      id: this.doc._id
    });

    let promise = this.doc._id
        ? request('PUT', `/docs/${this.doc._id}`, this.doc)   // update existing
        : request('POST', '/docs', this.doc);                 // create new

    return promise
        .then(response => {
          debug ('document saved', this.doc);

          this.doc._id = response.id;
          this.doc._rev = response.rev;
          this._set(this.doc);

          this.emit('saving', {
            type: 'end',
            title: this.doc.title,
            id: this.doc._id
          });

          return this.get();
        })
        .catch ((err) => {
          this.emit('saving', {
            type: 'error',
            title: this.doc.title,
            id: this.doc._id,
            error: err
          });

          throw err; // rethrow
        });
  }

  /**
   * Open a document by it's id
   * @param {string} id
   * @param {string} [title]
   * @return {Promise.<Object, Error>}
   */
  open (id, title) {
    debug ('open document', id);

    this.emit('opening', {
      type: 'start',
      title,
      id
    });

    if (this.dirty) {
      return Promise.reject(new Error('Cannot open document, current document has unsaved changes'));
    }

    return request('GET', `/docs/${id}`)
        .then(doc => {
          debug ('document opened', doc);

          this._set(doc);

          this.emit('opening', {
            type: 'end',
            title: title || doc.title,
            id
          });

          return this.get();
        })
        .catch((err) => {
          this.emit('opening', {
            type: 'error',
            id,
            title,
            error: err
          });

          throw err; // rethrow
        });
  }

  /**
   * Open the example document
   */
  openExample () {
    if (this.dirty) {
      return Promise.reject(new Error('Cannot open example document, current document has unsaved changes'));
    }

    debug ('open example document');

    this._set(EXAMPLE_DOC);
  }

  /**
   * Delete a document
   * @param {string} id
   * @param {string} rev
   * @return {*}
   */
  static del (id, rev) {
    debug('delete document', id, rev);

    return request('DELETE', `/docs/${id}/${rev}`);
  }

  /**
   * Get a list with all documents of the current user
   * @return {Array.<{id: string, rev: string, title: string, updated: string}>}
   */
  static list () {
    debug('list documents');

    return request('GET', '/docs').then(response => {
      let list = response.rows.map(row => row.value);
      debug('documents', list);
      return list;
    });
  }
}
