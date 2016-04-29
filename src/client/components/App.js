import React, { Component } from 'react'
import { connect } from 'react-redux'
import { clone, cloneDeep, debounce } from 'lodash'
import Immutable from 'immutable'
import debugFactory from 'debug/browser'

import Avatar from 'material-ui/lib/avatar'
import AppBar from 'material-ui/lib/app-bar'
import FlatButton from 'material-ui/lib/flat-button'
import IconButton from 'material-ui/lib/icon-button'
import NavigationMenuIcon from 'material-ui/lib/svg-icons/navigation/menu'
import ThemeManager from 'material-ui/lib/styles/theme-manager'

import theme from '../theme'
import Notification from './dialogs/Notification'
import Prompt from './dialogs/Prompt'
import { setUser } from '../actions'
import Menu from './Menu'
import Scenario from './Scenario'
import Inputs from './Inputs'
import Outputs from './Outputs'
import { request } from '../js/request'

const debug = debugFactory('vbi:app')

const MAX_DOCS = 10;  // maximum number of visible docs in the left navigation menu

const AUTO_SAVE_DELAY = 5000; // milliseconds

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

    // TODO: replace Scenario with react-router-redux
    this.scenario = new Scenario()
    this.scenario.on('change', (doc) => {
      this.setState({doc, changed: false})
      this.handleAutoSave.cancel()
    })
    this.scenario.on('notification', (notification) => {
      debug('notification', notification)
      this.refs.notification.show(notification)
    })
    this.scenario.on('error', (err) => this.handleError(err))

    this.handleSaveDoc = this.handleSaveDoc.bind(this)
    this.handleAutoSave = debounce(this.handleSaveDoc, AUTO_SAVE_DELAY)

    // FIXME: remove this state
    this.state = {
      changed: false,
      doc: this.scenario.get(),   // The current doc
      docs: [],                   // list with all docs of the user
      docsLimit: true,            // limit the number of visible docs
    }
  }

  render() {
    return (
      <div>
        { this.renderAppBar() }

        <Menu
            ref="menu"
            docs={this.state.docs} // TODO: read docs from props (redux store) instead
            title={this.state.doc.title}
            signedIn={this.isSignedIn()}
            onNewDoc={() => this.handleNewDoc()}
            onOpenDoc={id => this.handleOpenDoc(id)}
            onRenameDoc={newTitle => this.handleRenameDoc(newTitle)}
            onSaveDoc={() => this.handleSaveDoc()}
            onDeleteDoc={doc => this.handleDeleteDoc(doc)}
        />

        <Prompt ref="prompt" />
        <Notification ref="notification" />

        <div>
          <div className="container">
            <Inputs
                data={this.state.doc.data}
                onChange={data => this.handleChange(data)}
                onEditPeriods={() => this.handleEditPeriods()}
            />
          </div>

          <div className="container">
            <Outputs data={this.state.doc.data} />
          </div>
        </div>

        <div className="footer">
          Copyright &copy; 2016 <a href="http://vanpaz.com">VanPaz</a>
        </div>
      </div>
    )
  }

  renderAppBar () {
    let docTitle = this.state.doc
        ? <span className="title" onTouchTap={(event) => {
            event.stopPropagation()
            event.preventDefault()

            // open dialog where the user can enter a new name
            this.refs.menu.renameDoc()
          }}>[{this.state.doc.title}]</span>
        : ''

    let handleSaveDoc = (event) => {
      event.preventDefault()
      this.handleSaveDoc()
    }

    let changed = this.state.doc && this.state.doc._id && this.state.changed
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
        iconElementRight={ this.renderUser() } />
  }

  // render "sign in" or "signed in as"
  renderUser () {
    if (this.isSignedIn()) {
      let source = this.props.user.get('email') || this.props.user.get('provider')
      let title = `Logged in as ${this.props.user.get('displayName')} (${source})`
      let buttonContents = <div title={title} >
        <span style={{color: '#FFFFFF', marginRight: 10}}>Sign out</span>
        <Avatar src={this.props.user.get('photo')} style={{verticalAlign: 'bottom'}} />
      </div>

      return <span>
        <FlatButton children={ buttonContents } onTouchTap={(event) => refs.menu.signOut()} />
      </span>
    }
    else {
      return <FlatButton label="Sign in" onTouchTap={(event) => this.refs.menu.signIn()} />
    }
  }

  isSignedIn () {
    return this.props.user && this.props.user.get('id')
  }

  componentDidMount () {
    this.fetchUser()
    // FIXME: setUser should throw an error when setting a regular JSON object instead of immutable, test this
        .then(user => this.props.dispatch(setUser(Immutable.fromJS(user))))
        .catch(err => this.handleError(err))

    this.fetchDocs()
  }

  handleNewDoc () {
    // FIXME: refactor
    this.scenario.createNew()
    this.setState({
      doc: this.scenario.get()
    })
  }

  handleRenameDoc (newTitle) {
    debug('handleRenameDoc', newTitle)

    // TODO: replace cloneDeep
    let doc = cloneDeep(this.state.doc)
    doc.title = newTitle
    this.changeDoc(doc)
  }

  handleOpenDoc (id) {
    debug('handleOpenDoc', id)

    this.scenario.open(id)
        .then(doc => this.setState({ doc }))
        .catch((err) => this.handleError(err))
  }

  handleSaveDoc () {
    debug('handleSaveDoc')

    this.handleAutoSave.cancel()

    this.scenario.save()
        .then((doc) => {
          this.setState({doc, changed: false})
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

    this.scenario.del(doc.id, doc.rev, doc.title)
        .then(() => this.fetchDocs())
        .catch(err => this.handleError(err))
  }

  handleEditPeriods () {
    const parameters = this.state.doc &&
        this.state.doc.data &&
        this.state.doc.data.parameters

    const periods = (parameters && parameters.periods)
        ? parameters.periods.join(', ')
        : ''

    const options = {
      title: 'Periods',
      description: 'Enter a comma separated list with periods:',
      hintText: comingYears().join(', '),
      value: periods
    }

    this.refs.prompt.show(options).then(newPeriods => {
      if (newPeriods !== null) {
        this.setPeriods(newPeriods)
      }
    })
  }

  /**
   * Apply a new series of periods
   * @param {string | Array.<string>} periods   A comma separated string or
   *                                            an array with strings.
   */
  setPeriods (periods) {
    debug('setPeriods', periods)

    if (Array.isArray(periods)) {
      let updatedDoc = cloneDeep(this.state.doc)
      if (!updatedDoc.data.parameters) {
        updatedDoc.data.parameters = {}
      }
      updatedDoc.data.parameters.periods = clone(periods)

      this.changeDoc(updatedDoc)
    }
    else {
      // periods is a string
      const array = periods.split(',').map(trim)
      this.setPeriods(array)
    }
  }

  handleError (err) {
    this.refs.notification.show({
      type: 'error',
      message: err.toString()
    })
  }

  handleChange (data) {
    debug('handleChange', data)

    let updatedDoc = cloneDeep(this.state.doc)
    updatedDoc.data = data

    this.changeDoc(updatedDoc)
  }

  changeDoc (doc) {
    this.scenario.set(doc)

    this.setState({
      doc,
      changed: true
    })

    // auto save after a delay
    if (doc._id) {
      this.handleAutoSave()
    }
  }

  fetchUser () {
    debug('fetching user...')
    return request('GET', '/user')
  }

  fetchDocs () {
    debug('fetching docs...')
    this.scenario.list()
        .then(docs => {
          // sort by updated field, from newest to oldest document
          docs.sort( this.compareUpdated  )
          debug('docs', docs)

          this.setState({ docs })
        })
        .catch(err => this.handleError(err))
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

function trim (str) {
  return str.trim()
}

function comingYears (count = 5) {
  const years = []
  let year = new Date().getFullYear()

  for (let i = 0; i < count; i++) {
    years.push(year + i)
  }

  return years
}

// getChildContext and childContextTypes are needed to set a custom material-ui theme
// the key passed through context must be called "muiTheme"
App.childContextTypes = {
  muiTheme: React.PropTypes.object
}

App = connect((state, ownProps) => {
  return {
    components: state.get('components'),
    user: state.get('user'),
    doc: state.get('doc')
  }
})(App)


export default App