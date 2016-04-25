import Emitter from 'emitter-component';
import { cloneDeep } from 'lodash';
import debugFactory from 'debug/browser';
import { request } from '../js/request';
import { hash } from '../js/hash'

const debug = debugFactory('vbi:scenario');

const EXAMPLE_DOC = require('../../../data/example_scenario.json');

const NOTIFICATION_AUTO_HIDE_DURATION = 4000;

const EMPTY_DOC = {
  title: 'New Scenario',
  data: {
    costs: [],
    revenues: []
  }
};

/**
 * Manage a scenario.
 * The scenario can be get/set, and can be saved/opened from the server.
 * The Scenario listens for changes in the hash of the browser location and
 * reflects the id of the current document there.
 *
 * The following events are emitted:
 *
 * - emit('change', doc)    Emitted when the document has been changed.
 *                          Not emitted when the document is changed via
 *                          the method scenario.set(doc).
 * - emit('error', err)     Emitted when loading of a document on a changed
 *                          url hash failed.
 * - emit('notification', {message: string, duration: number | null})
 *                          Emitted when saving, saved, deleting, deleted.
 *
 */
export default class Scenario {
  constructor () {
    // turn this class into an event emitter
    Emitter(this);

    this.dirty = false;
    this.doc = EXAMPLE_DOC;

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
      this.open(id)
          .then(doc => this.emit('change', doc))
          .catch(err => this.emit('error', err));
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

    debug('create new document');

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

    this.emit('notification', {
      closeable: false,
      message: `Saving ${this.doc.title || this.doc._id}`
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

          this.emit('notification', {
            message: `Saved ${this.doc.title || this.doc._id}`,
            duration: NOTIFICATION_AUTO_HIDE_DURATION
          });

          return this.get();
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

    this.emit('notification', {
      closeable: false,
      message: `Opening ${title || id}`
    });

    if (this.dirty) {
      return Promise.reject(new Error('Cannot open document, current document has unsaved changes'));
    }

    return request('GET', `/docs/${id}`)
        .then(doc => {
          debug ('document opened', doc);

          this._set(doc);

          this.emit('notification', {
            message: `Opened ${title || doc.title || id}`,
            duration: 4000
          });

          return this.get();
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
   * @param {string} [title]
   * @return {*}
   */
  del (id, rev, title) {
    debug('delete document', id, rev);

    this.emit('notification', {
      message: `Deleting ${title || id}`
    });

    return request('DELETE', `/docs/${id}/${rev}`)
        .then(() => {
          this.emit('notification', {
            message: `Deleted ${title || id}`
          });
        });
  }

  /**
   * Get a list with all documents of the current user
   * @return {Array.<{id: string, rev: string, title: string, updated: string}>}
   */
  list () {
    debug('list documents');

    return request('GET', '/docs').then(response => {
      let list = response.rows.map(row => row.value);
      debug('documents', list);
      return list;
    });
  }
}
