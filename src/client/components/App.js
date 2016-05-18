import React, { Component } from 'react'
import { connect } from 'react-redux'
import Immutable from 'seamless-immutable'
import { debounce } from 'lodash'
import debugFactory from 'debug/browser'

import Avatar from 'material-ui/lib/avatar'
import AppBar from 'material-ui/lib/app-bar'
import FlatButton from 'material-ui/lib/flat-button'
import IconButton from 'material-ui/lib/icon-button'
import NavigationMenuIcon from 'material-ui/lib/svg-icons/navigation/menu'
import ThemeManager from 'material-ui/lib/styles/theme-manager'

import theme from '../theme'
import Notification from './dialogs/Notification'
import { setUser, listDocs, newDoc, renameDoc, setDoc } from '../actions'
import Menu from './Menu'
import Inputs from './Inputs'
import Outputs from './Outputs'
import { request } from '../rest/request'
import { list, open, save, del } from '../rest/docs'
import { hash } from '../js/hash'

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

    this.handleSaveDoc = this.handleSaveDoc.bind(this)
    this.handleAutoSave = debounce(this.handleSaveDoc, AUTO_SAVE_DELAY)
  }

  render() {
    return (
      <div>
        { this.renderAppBar() }

        <Menu
            ref="menu"
            docs={this.props.docs}
            title={this.props.doc.title}
            signedIn={this.isSignedIn()}
            onNewDoc={() => this.handleNewDoc()}
            onOpenDoc={(id, title) => this.handleOpenDoc(id, title)}
            onRenameDoc={newTitle => this.handleRenameDoc(newTitle)}
            onSaveDoc={() => this.handleSaveDoc()}
            onDeleteDoc={doc => this.handleDeleteDoc(doc)}
        />

        <Notification ref="notification" />

        <div>
          <div className="container">
            <Inputs />
          </div>

          <div className="container">
            <Outputs data={this.props.doc.data} />
          </div>
        </div>

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

    let saveNeeded = (this.props.doc && this.props.doc._id && this.isChanged())
        ? <span>
            <span className="changed">changed (</span>
            <a className="changed" href="#" onClick={handleSaveDoc}>save now</a>
            <span className="changed">)</span>
          </span>
        : null
    let title = <div>VanPaz Business Intelligence {docTitle} {saveNeeded}</div>

    return <AppBar
        style={APP_BAR_STYLE}
        title={title}
        iconElementLeft={
              <IconButton onTouchTap={(event) => this.refs.menu.show() }>
                <NavigationMenuIcon />
              </IconButton> }
        iconElementRight={ this.renderUser() } />
  }

  // render "sign in" or "signed in as"
  renderUser () {
    if (this.isSignedIn()) {
      let source = this.props.user.email || this.props.user.provider
      let title = `Logged in as ${this.props.user.displayName} (${source})`
      let buttonContents = <div title={title} >
        <span style={{color: '#FFFFFF', marginRight: 10}}>Sign out</span>
        <Avatar src={this.props.user.photo} style={{verticalAlign: 'bottom'}} />
      </div>

      return <span>
        <FlatButton children={ buttonContents } onTouchTap={(event) => this.refs.menu.signOut()} />
      </span>
    }
    else {
      return <FlatButton label="Sign in" onTouchTap={(event) => this.refs.menu.signIn()} />
    }
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
        this.props.dispatch(newDoc())
      }
    })

    this.fetchUser()
    // FIXME: setUser should throw an error when setting a regular JSON object instead of immutable, test this
        .then(user => this.props.dispatch(setUser(user)))
        .catch(err => this.handleError(err))

    this.fetchDocs()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.isChanged()) {
      this.handleAutoSave()
    }
  }

  handleNotification (notification) {
    debug('notification', notification)
    this.refs.notification.show(notification)
  }

  handleNewDoc () {
    debug('handleNewDoc')

    if (this.isChanged()) {
      return this.handleError(new Error('Cannot open new document, current document has unsaved changes'))
    }

    this.props.dispatch(newDoc())
    hash.remove('id')
  }

  handleRenameDoc (newTitle) {
    debug('handleRenameDoc', newTitle)

    this.props.dispatch(renameDoc(newTitle))
  }

  handleOpenDoc (id, title) {
    debug('handleOpenDoc', id, title)

    if (this.isChanged()) {
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

    // TODO: should mark the doc in it's current state as saved
    // TODO: better: use a changed flag

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

  /**
   * Delete a document
   * @param {{id: string, rev: string, title: string}} doc
   */
  handleDeleteDoc (doc) {
    debug('deleteDoc')

    del(doc.id, doc.rev, doc.title, n => this.handleNotification(n))
        .then(() => {
          if (hash.get('id') === doc.id) {
            hash.remove('id')
          }
          this.fetchDocs()
        })
        .catch(err => this.handleError(err))
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

  isChanged () {
    return this.props.unchangedDoc !== null && this.props.doc !== this.props.unchangedDoc
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