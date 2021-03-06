import React from 'react'

import Avatar from 'material-ui/lib/avatar'
import AppBar from 'material-ui/lib/app-bar'
import RaisedButton from 'material-ui/lib/raised-button'
import IconButton from 'material-ui/lib/icon-button'
import LeftNav from 'material-ui/lib/left-nav'
import NavigationMenuIcon from 'material-ui/lib/svg-icons/navigation/menu'
import List from 'material-ui/lib/lists/list'
import Divider from 'material-ui/lib/divider'
import ListItem from 'material-ui/lib/lists/list-item'
import EditIcon from 'material-ui/lib/svg-icons/image/edit'
import OpenIcon from 'material-ui/lib/svg-icons/file/folder-open'
import SaveIcon from 'material-ui/lib/svg-icons/content/save'
import CreateIcon from 'material-ui/lib/svg-icons/content/add'
import ClearIcon from 'material-ui/lib/svg-icons/content/clear'
import ToggleStarIcon from 'material-ui/lib/svg-icons/toggle/star'
import UploadIcon from 'material-ui/lib/svg-icons/file/file-upload'
import DownloadIcon from 'material-ui/lib/svg-icons/file/file-download'

import SignInDialog from './dialogs/SignInDialog'
import DeleteDialog from './dialogs/DeleteDialog'
import Confirm from './dialogs/Confirm'
import Prompt from './dialogs/Prompt'

import bindMethods from '../utils/bindMethods'
import shouldComponentUpdate from '../utils/shouldComponentUpdate'


const MAX_DOCS = 10  // maximum number of visible docs in the left navigation menu

const styles = {
  appBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 999
  },
  user: {
    width: '100%',
    padding: 10,
    boxSizing: 'border-box'
  },
  avatar: {
    verticalAlign: 'middle',
    textAlign: 'center'
  },
  signInButton: {
    width: '100%'
  }
}


export default class Menu extends React.Component {
  constructor (props) {
    super (props)
    bindMethods(this)

    this.state = {
      open: false,
      limitDocs: true   // limit the number of displayed docs
    }

    // update only when props or state are changed
    this.shouldComponentUpdate = shouldComponentUpdate
  }

  render () {
    let docsList = this.props.docs.map(doc => {
      const rightIcon = <ClearIcon onTouchTap={ (event) => {
        event.stopPropagation()
        this.deleteDoc(doc)
      }} />

      return <ListItem
          key={doc.id}
          primaryText={doc.title || doc.id}
          rightIcon={rightIcon}
          onTouchTap={(event) => {
            this.hide()
            this.openDoc(doc.id, doc.title)
          }}
      />
    })

    // show a "none" entry when there are no documents
    if (docsList.length === 0) {
      let none = <ListItem
          key={'none'}
          primaryText={<span style={{color: 'gray'}}>(no documents)</span>}
      />
      docsList = docsList.concat([none])
    }

    // limit the number of displayed documents
    if (this.state.limitDocs) {
      if (docsList.length > MAX_DOCS) {
        let more = <ListItem
            key={'more'}
            primaryText={'more...'}
            onTouchTap={(event) => this.setState({limitDocs: false})}
        />

        docsList.splice(MAX_DOCS)
        docsList = docsList.concat([more])
      }
    }

    return <div>
      <LeftNav docked={false}
             open={this.state.open}
             onRequestChange={this.handleOpenMenu} >
        <AppBar title="Menu"
                style={{background: styles.appBar.background}}
                iconElementLeft={
                    <IconButton onTouchTap={this.hide}>
                      <NavigationMenuIcon />
                    </IconButton>
                  } />

        <List subheader="User">
          { this.renderUser() }
        </List>

        <List subheader="Manage scenarios">
          <ListItem
              primaryText="New"
              leftIcon={<CreateIcon />}
              onTouchTap={this.newDoc} />
          <ListItem
              primaryText="Demo"
              leftIcon={<ToggleStarIcon />}
              onTouchTap={this.demoDoc} />
          <ListItem
              primaryText="Rename"
              leftIcon={<EditIcon />}
              onTouchTap={this.renameDoc} />
          <ListItem
              primaryText="Open"
              leftIcon={<OpenIcon />}
              initiallyOpen={true}
              primaryTogglesNestedList={true}
              nestedItems={docsList} />
          <ListItem
              primaryText="Save"
              leftIcon={<SaveIcon />}
              onTouchTap={this.saveDoc} />
          <ListItem
              primaryText="Save as..."
              leftIcon={<SaveIcon />}
              onTouchTap={this.saveDocAs} />
        </List>

        <List subheader="Import and export">
          <ListItem
              primaryText="Open from disk"
              leftIcon={<UploadIcon />}
              onTouchTap={this.uploadDoc} />
          <ListItem
              primaryText="Save to disk"
              leftIcon={<DownloadIcon />}
              onTouchTap={this.downloadDoc} />
        </List>

      </LeftNav>

      <Prompt ref="prompt" />
      <Confirm ref="confirm" />
      <SignInDialog ref="signInDialog" />
      <DeleteDialog ref="deleteDialog" />

    </div>
  }

  renderUser () {
    if (this.isSignedIn()) {
      return <div style={styles.user}>
        <Avatar src={this.props.user.photo} style={styles.avatar} />
        { ' ' + (this.props.user.displayName || this.props.user.email) + ' '}
        <div style={{display: 'inline-block'}}>
          [<button className="sign-out" onTouchTap={this.signOut}>sign out</button>]
        </div>
      </div>
    }
    else {
      return <div style={styles.user}>
        <RaisedButton
            label="Sign in"
            style={styles.signInButton}
            onTouchTap={this.signIn} />
      </div>
    }
  }

  isSignedIn () {
    return this.props.user && this.props.user.id
  }

  show () {
    this.setState({ open: true })
  }

  hide () {
    this.setState({ open: false })
  }

  handleOpenMenu (open) {
    this.setState({open})
  }

  newDoc () {
    debug('newDoc')

    this.hide()
    this.props.onNewDoc()
  }

  demoDoc () {
    debug('demoDoc')

    this.hide()
    this.props.onDemoDoc()
  }

  renameDoc () {
    debug('renameDoc')

    this.hide()

    const options = {
      title: 'Rename',
      description: 'Enter a title for the scenario:',
      hintText: 'My Scenario',
      value: this.props.title
    }

    this.refs.prompt.show(options).then(newTitle => {
      debug('rename doc', newTitle)
      if (newTitle !== null) {
        this.props.onRenameDoc(newTitle)
      }
    })
  }

  openDoc (id, title) {
    debug('openDoc', id, title)

    if (!this.props.signedIn) {
      return this.askToSignIn()
    }

    this.props.onOpenDoc(id, title)
  }

  saveDoc () {
    debug('saveDoc')

    if (!this.props.signedIn) {
      return this.askToSignIn()
    }

    this.hide()

    if (!this.props.id) {
      // new document, open a prompt to ask for a title
      const options = {
        title: 'Save',
        description: 'Enter a title for the scenario:',
        hintText: 'My Scenario',
        value: this.props.title
      }

      this.refs.prompt.show(options).then(newTitle => {
        debug('save new doc', newTitle)
        if (newTitle !== null) {
          this.props.onSaveDocAs(newTitle)
        }
      })
    }
    else {
      // save an existing document
      this.props.onSaveDoc()
    }
  }

  saveDocAs () {
    debug('saveDocAs')

    if (!this.props.signedIn) {
      return this.askToSignIn()
    }

    this.hide()

    const options = {
      title: 'Save as...',
      description: 'Enter a title for the scenario:',
      hintText: 'My Scenario',
      value: this.props.title + ' (copy)'
    }

    this.refs.prompt.show(options).then(newTitle => {
      debug('save doc as', newTitle)
      if (newTitle !== null) {
        this.props.onSaveDocAs(newTitle)
      }
    })
  }

  uploadDoc () {
    debug('uploadDoc')

    this.hide()
    this.props.onUploadDoc()
  }

  downloadDoc () {
    debug('downloadDoc')

    this.hide()
    this.props.onDownloadDoc()
  }

  /**
   * Delete a document
   * @param {{id: string, rev: string, title: string}} doc
   */
  deleteDoc (doc) {
    debug('deleteDoc')

    if (!this.props.signedIn) {
      return this.askToSignIn()
    }

    const options = {
      title: 'Delete scenario',
      description: <span>
        Are you sure you want to delete <b>{doc.title || doc.id}</b>?
      </span>
    }

    this.refs.deleteDialog.show(options).then(doDelete => {
      if (doDelete) {
        this.props.onDeleteDoc(doc)
      }
    })
  }

  askToSignIn () {
    const options ={
      title: 'Sign in',
      description: <div>
        <p>
          To open, save, or delete scenarios you have to sign in first.
        </p>
        <p>
          Do you want to sign in now?
        </p>
      </div>
    }

    this.refs.confirm.show(options).then(ok => {
      if (ok) {
        this.signIn()
      }
    })
  }

  signIn (event) {
    this.refs.signInDialog.show()
  }

  signOut (event) {
    SignInDialog.signOut()
  }

}
