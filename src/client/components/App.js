import React, { Component } from 'react'
import { connect } from 'react-redux'
import Immutable from 'seamless-immutable'
import { debounce } from 'lodash'
import debugFactory from 'debug/browser'

// enable performance profiling
// see https://facebook.github.io/react/docs/perf.html
// import Perf from 'react-addons-perf'
// window.Perf = Perf

import AppBar from 'material-ui/lib/app-bar'
import FlatButton from 'material-ui/lib/flat-button'
import IconButton from 'material-ui/lib/icon-button'
import DashboardIcon from 'material-ui/lib/svg-icons/action/dashboard'
import TimelineIcon from 'material-ui/lib/svg-icons/action/timeline'
import NavigationMenuIcon from 'material-ui/lib/svg-icons/navigation/menu'
import ThemeManager from 'material-ui/lib/styles/theme-manager'

import theme from '../theme'
import Notification from './dialogs/Notification'
import {
    setUser, listDocs, renameDoc, setDoc, viewPage, setProperty, checkCategory,
    viewInputs, viewOutputs
} from '../actions'
import Menu from './Menu'
import BusinessModelCanvas from './BusinessModelCanvas'
import Inputs from './Inputs'
import Outputs from './Outputs'
import { request } from '../rest/request'
import { list, open, save, del } from '../rest/docs'
import { hash } from '../utils/hash'
import * as constants from '../constants'

import * as newScenarioJSON from '../data/newScenario.json'
import * as demoScenarioJSON from '../data/demoScenario.json'

const newScenario  = Immutable(newScenarioJSON)
const demoScenario = Immutable(demoScenarioJSON)

const debug = debugFactory('vbi:app')

const AUTO_SAVE_DELAY = 5000 // milliseconds

const APP_BAR_STYLE = {
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 999
}


// expose the debug library to window, so we can enable and disable it
if (typeof window !== 'undefined') {
  console.info('To enable debugging, enter debug.enable(\'vbi:*\') in this console, then refresh the page')
  console.info('To disable debugging, enter debug.disable() in this console, then refresh the page')
  window.debug = debugFactory
}


class App extends Component {
  constructor (props) {
    super(props)

    // bind all methods to current instance so we don't have to create wrapper functions to use them
    this.handleNewDoc = this.handleNewDoc.bind(this)
    this.handleDemoDoc = this.handleDemoDoc.bind(this)
    this.handleOpenDoc = this.handleOpenDoc.bind(this)
    this.handleRenameDoc = this.handleRenameDoc.bind(this)
    this.handleSaveDoc = this.handleSaveDoc.bind(this)
    this.handleSaveDocAs = this.handleSaveDocAs.bind(this)
    this.handleDeleteDoc = this.handleDeleteDoc.bind(this)

    this.handleSetProperty = this.handleSetProperty.bind(this)
    this.handleCheckCategory = this.handleCheckCategory.bind(this)
    this.handleSetPage = this.handleSetPage.bind(this)
    this.handleSetOutputsTab = this.handleSetOutputsTab.bind(this)
    this.handleSetInputsTab = this.handleSetInputsTab.bind(this)

    this.handleAutoSave = debounce(this.handleSaveDoc, AUTO_SAVE_DELAY)
  }

  render() {
    return (
      <div>
        { this.renderAppBar() }

        <Menu
            ref="menu"
            user={this.props.user}
            docs={this.props.docs}
            title={this.props.doc.title}
            id={this.props.doc._id}
            signedIn={this.isSignedIn()}
            onNewDoc={this.handleNewDoc}
            onDemoDoc={this.handleDemoDoc}
            onOpenDoc={this.handleOpenDoc}
            onRenameDoc={this.handleRenameDoc}
            onSaveDoc={this.handleSaveDoc}
            onSaveDocAs={this.handleSaveDocAs}
            onDeleteDoc={this.handleDeleteDoc}
        />

        <Notification ref="notification" />

        {
          this.props.view.page === 'model'
              ? this.renderModel()
              : this.renderFinance()
        }

        <div className="footer">
          Copyright &copy; 2016 <a href="http://vanpaz.com">VanPaz</a>
        </div>
      </div>
    )
  }

  renderAppBar () {
    let docTitle = this.props.doc
        ? <span className="title" onTouchTap={(event) => {
            event.stopPropagation()
            event.preventDefault()

            // open dialog where the user can enter a new name
            this.refs.menu.renameDoc()
          }}>[{this.props.doc.title}]</span>
        : ''

    let handleSaveDoc = (event) => {
      event.preventDefault()
      this.handleSaveDoc()
    }

    let changed = this.saveNeeded()
        ? <span>
            <span className="changed">changed (</span>
            <a className="changed" href="#" onClick={handleSaveDoc}>save now</a>
            <span className="changed">)</span>
          </span>
        : null
    let title = <div>VanPaz Business Intelligence {docTitle} {changed}</div>

    return <AppBar
        style={APP_BAR_STYLE}
        title={title}
        iconElementLeft={
              <IconButton onTouchTap={(event) => this.refs.menu.show() }>
                <NavigationMenuIcon />
              </IconButton> }
        iconElementRight={ this.renderAppbarMenu() } />
  }

  renderAppbarMenu () {
    return <div className="appbar-menu">
      <FlatButton
          label="Model"
          icon={<DashboardIcon />}
          className={this.props.view.page === 'model' ? 'selected' : ''}
          onTouchTap={(event) => this.handleSetPage('model')} />
      <FlatButton
          label="Finance"
          icon={<TimelineIcon />}
          className={this.props.view.page === 'finance' ? 'selected' : ''}
          onTouchTap={(event) => this.handleSetPage('finance')} />
    </div>
  }

  renderModel () {
    return <div>
      <div className="container whole">
        <BusinessModelCanvas
            data={this.props.doc.data}
            onSetProperty={this.handleSetProperty}
            onCheckCategory={this.handleCheckCategory}
        />
      </div>
    </div>
  }

  renderFinance () {
    return <div>
      <div className="container half">
        <Inputs
            tab={this.props.view.inputs}
            onChangeTab={this.handleSetInputsTab}
        />
      </div>

      <div className="container half">
        <Outputs
            tab={this.props.view.outputs}
            onChangeTab={this.handleSetOutputsTab}
            data={this.props.doc.data} />
      </div>
    </div>
  }

  isSignedIn () {
    return this.props.user && this.props.user.id
  }

  componentDidMount () {
    // TODO: use react-router-redux instead of handling hash changes ourselves

    // read the hash
    let id = hash.get('id')
    if (id) {
      this.handleOpenDoc(id)
    }

    // listen for changes in the hash
    hash.onChange('id', (id, oldId) => {
      debug('hash changed, new id:', id, ', old id:', oldId)

      if (id) {
        this.handleOpenDoc(id)
      }
      else {
        this.props.dispatch(setDoc(newScenario))
      }
    })

    hash.onChange('page', (page) => this.props.dispatch(viewPage(page || constants.defaultPage)))
    hash.onChange('inputs', (tab) => this.props.dispatch(viewInputs(tab || constants.defaultInputs)))
    hash.onChange('outputs', (tab) => this.props.dispatch(viewOutputs(tab || constants.defaultOutputs)))

    // listen for the unload event, check whether there are unsaved changes
    window.addEventListener('beforeunload', (event) => {
      if (this.saveNeeded()) {
        this.handleSaveDoc()
        event.returnValue = 'Are you sure you want to leave?\n\nThere are unsaved changes.'
      }
    })

    this.fetchUser()
    // FIXME: setUser should throw an error when setting a regular JSON object instead of immutable, test this
        .then(user => this.props.dispatch(setUser(user)))
        .catch(err => this.handleError(err))

    this.fetchDocs()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.saveNeeded()) {
      this.handleAutoSave()
    }
  }

  handleSetPage (page) {
    this.props.dispatch(viewPage(page))
    hash.set('page', page)
  }

  handleSetOutputsTab (tab) {
    this.props.dispatch(viewOutputs(tab))
    hash.set('outputs', tab)
  }

  handleSetInputsTab (tab) {
    this.props.dispatch(viewInputs(tab))
    hash.set('inputs', tab)
  }

  handleNotification (notification) {
    debug('notification', notification)
    this.refs.notification.show(notification)
  }

  handleNewDoc () {
    debug('handleNewDoc')

    if (this.saveNeeded()) {
      return this.handleError(new Error('Cannot open new document, current document has unsaved changes'))
    }

    this.props.dispatch(setDoc(newScenario))
    hash.remove('id')
  }

  handleDemoDoc () {
    debug('handleDemoDoc')

    if (this.saveNeeded()) {
      return this.handleError(new Error('Cannot open demo document, current document has unsaved changes'))
    }

    this.props.dispatch(setDoc(demoScenario))
    hash.remove('id')
  }

  handleRenameDoc (newTitle) {
    debug('handleRenameDoc', newTitle)

    this.props.dispatch(renameDoc(newTitle))
  }

  handleOpenDoc (id, title) {
    debug('handleOpenDoc', id, title)

    if (this.saveNeeded()) {
      return this.handleError(new Error('Cannot open document, current document has unsaved changes'))
    }

    open(id, title, n => this.handleNotification(n) )
        .then(doc => {
          const immutableDoc = Immutable(doc)
          this.props.dispatch(setDoc(immutableDoc))

          hash.set('id', doc._id)
        })
        .catch((err) => this.handleError(err))
  }

  handleSaveDoc () {
    debug('handleSaveDoc')

    this.handleAutoSave.cancel()

    save(this.props.doc, n => this.handleNotification(n))
        .then((response) => {

          const updatedDoc = this.props.doc
              .set('_id', response.id)
              .set('_rev', response.rev)
          
          this.props.dispatch(setDoc(updatedDoc))

          hash.set('id', updatedDoc._id)
          this.fetchDocs()
        })
        .catch((err) => this.handleError(err))
  }

  handleSaveDocAs (newTitle) {
    debug('handleSaveDocAs')

    this.handleAutoSave.cancel()

    const copyOfDoc = this.props.doc
        .without(['_id', '_rev'])
        .set('title', newTitle)

    save(copyOfDoc, n => this.handleNotification(n))
        .then((response) => {

          const updatedDoc = copyOfDoc
              .set('_id', response.id)
              .set('_rev', response.rev)

          this.props.dispatch(setDoc(updatedDoc))

          hash.set('id', updatedDoc._id)
          this.fetchDocs()
        })
        .catch((err) => this.handleError(err))
  }

  /**
   * Delete a document
   * @param {{id: string, rev: string, title: string}} doc
   */
  handleDeleteDoc (doc) {
    debug('deleteDoc')

    if (hash.get('id') === doc.id) {
      this.handleAutoSave.cancel()
    }

    del(doc.id, doc.rev, doc.title, n => this.handleNotification(n))
        .then(() => {
          if (hash.get('id') === doc.id) {
            hash.remove('id')
          }
          this.fetchDocs()
        })
        .catch(err => this.handleError(err))
  }

  /**
   * Set a property in the document
   * @param {Array} path
   * @param {*} value
   */
  handleSetProperty (path, value) {
    debug('setProperty', path, value)
    this.props.dispatch(setProperty(path, value))
  }

  /**
   * Check or uncheck a BMC category
   * @param {String} bmcId
   * @param {boolean} checked
   */
  handleCheckCategory (bmcId, checked) {
    debug('checkCategory', bmcId, checked)
    this.props.dispatch(checkCategory(bmcId, checked))
  }

  handleError (err) {
    this.refs.notification.show({
      type: 'error',
      message: err.toString()
    })
  }

  fetchUser () {
    debug('fetching user...')
    return request('GET', '/user')
  }

  fetchDocs () {
    debug('fetching docs...')
    list()
        .then(docs => {
          // sort by updated field, from newest to oldest document
          docs.sort(this.compareUpdated )
          debug('docs', docs)

          this.props.dispatch(listDocs(docs))
        })
        .catch(err => this.handleError(err))
  }

  saveNeeded () {
    return (this.props.doc && this.props.doc._id && this.props.changed)
  }

  /**
   * Compare two documents by their updated value and order them with
   * newest document first.
   * @param {{updated: string}} a
   * @param {{updated: string}} b
   * @return {number} returns -1 when a is newer then b, 1 when a is older than b,
   *                  and 0 when both have the same age.
   */
  compareUpdated (a, b) {
    return a.updated > b.updated ? -1 : a.updated < b.updated ? 1 : 0
  }

  // getChildContext and childContextTypes are needed to set a custom material-ui theme
  getChildContext() {
    return {
      muiTheme: ThemeManager.getMuiTheme(theme)
    }
  }
}

// getChildContext and childContextTypes are needed to set a custom material-ui theme
// the key passed through context must be called "muiTheme"
App.childContextTypes = {
  muiTheme: React.PropTypes.object
}

App = connect((state, ownProps) => {
  return state
})(App)


export default App