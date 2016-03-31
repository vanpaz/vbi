import React, { Component } from 'react';
import { cloneDeep, debounce } from 'lodash';
import debugFactory from 'debug/browser';

import Avatar from 'material-ui/lib/avatar';
import AppBar from 'material-ui/lib/app-bar';
import Dialog from 'material-ui/lib/dialog';
import Snackbar from 'material-ui/lib/snackbar';
import FlatButton from 'material-ui/lib/flat-button';
import IconButton from 'material-ui/lib/icon-button';
import LeftNav from 'material-ui/lib/left-nav';
import NavigationMenuIcon from 'material-ui/lib/svg-icons/navigation/menu';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import ContentEdit from 'material-ui/lib/svg-icons/image/edit';
import ContentOpen from 'material-ui/lib/svg-icons/file/folder-open';
import ContentSave from 'material-ui/lib/svg-icons/content/save';
import ContentCreate from 'material-ui/lib/svg-icons/content/add';
import ContentClear from 'material-ui/lib/svg-icons/content/clear';

import Scenario from './Scenario';
import InputForm from './InputForm';
import ProfitAndLoss from './ProfitAndLoss';
import { request } from './request';

const debug = debugFactory('vbi:app');

const MAX_DOCS = 10;  // maximum number of visible docs in the left navigation menu

const AUTO_SAVE_DELAY = 5000; // milliseconds

const APP_BAR_STYLE = {
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 999,
  background: '#f3742c'
};


// expose the debug library to window, so we can enable and disable it
if (typeof window !== 'undefined') {
  console.info('To enable debugging, enter debug.enable(\'vbi:*\') in this console, then refresh the page');
  console.info('To disable debugging, enter debug.disable() in this console, then refresh the page');
  window.debug = debugFactory;
}


export default class App extends Component {
  constructor (props) {
    super(props);

    this.scenario = new Scenario();
    this.scenario.on('change', (doc) => {
      this.setState({doc, changed: false});
      this.handleAutoSave.cancel();
    });
    this.scenario.on('notification', (notification) => {
      debug('notification', notification);
      this.setState({notification});
    });
    this.scenario.on('error', (err) => this.handleError(err));

    this.handleSave = this.handleSave.bind(this);
    this.handleAutoSave = debounce(this.handleSave, AUTO_SAVE_DELAY);

    // update the redirectTo url when the url changes
    window.addEventListener('hashchange', () => this.setState({
      redirectTo: encodeURIComponent(location.href)
    }));

    this.state = {
      user: {},

      changed: false,
      doc: this.scenario.get(),   // The current doc
      docs: [],                   // list with all docs of the user
      docsLimit: true,            // limit the number of visible docs

      showLeftNav: false,
      showTitleDialog: false,
      newTitle: null,

      showSignInDialog: false,
      showAskToSignIn: false,
      deleteDocDialog: null, // null or { title: string, id: string, rev: string }

      notification: null, // null or { message: string, closeable: boolean, duration: number | null}

      redirectTo: encodeURIComponent(location.href)
    };
  }

  render() {
    return (
      <div>
        { this.renderAppBar() }
        { this.renderLefNav() }
        { this.renderTitleDialog() }
        { this.renderSignInDialog() }
        { this.renderAskToSignInDialog() }
        { this.renderDeleteDocDialog() }
        { this.renderNotification() }

        <div>
          <div className="container input-form">
            <InputForm data={this.state.doc.data} onChange={data => this.handleChange(data)} />
          </div>

          <div className="container profit-and-loss">
            <ProfitAndLoss data={this.state.doc.data} />
          </div>
        </div>

        <div className="footer">
          Copyright &copy; 2016 <a href="http://vanpaz.com">VanPaz</a>
        </div>
      </div>
    );
  }

  renderAppBar () {
    let docTitle = this.state.doc
        ? <span className="title" onTouchTap={(event) => {
            event.stopPropagation();
            event.preventDefault();

            this.setState({showLeftNav: false});
            this.handleRename()
          }}>[{this.state.doc.title}]</span>
        : '';
    let handleSave = (event) => {
      event.preventDefault();
      this.handleSave();
    };
    let changed = this.state.doc && this.state.doc._id && this.state.changed
        ? <span>
            <span className="changed">changed (</span>
            <a className="changed" href="#" onClick={handleSave}>save now</a>
            <span className="changed">)</span>
          </span>
        : null;
    let title = <div>VanPaz Business Intelligence {docTitle} {changed}</div>;

    return <AppBar
        style={APP_BAR_STYLE}
        title={title}
        iconElementLeft={
              <IconButton onTouchTap={(event) => this.handleToggleLeftNav() }>
                <NavigationMenuIcon />
              </IconButton> }
        iconElementRight={ this.renderUser() } />
  }

  renderLefNav () {
    const docsList = this.state.docs.map(doc => {
      const rightIcon = <ContentClear onTouchTap={ (event) => {
        event.stopPropagation();
        this.setState({
          deleteDocDialog: {
            id: doc.id,
            rev: doc.rev,
            title: doc.title
          }
        });
      }} />;

      return <ListItem
          key={doc.id}
          primaryText={doc.title || doc.id}
          rightIcon={rightIcon}
          onTouchTap={(event) => {
            this.setState({showLeftNav: false});
            this.handleOpen(doc.id)
          }}
      />;
    });

    // show a "none" entry when there are no documents
    if (docsList.length === 0) {
      let none = <ListItem
          key={'none'}
          primaryText={<span style={{color: 'gray'}}>(no documents)</span>}
      />;
      docsList.push(none);
    }

    // limit the number of displayed documents
    if (this.state.docsLimit) {
      if (docsList.length > MAX_DOCS) {
        let more = <ListItem
            key={'more'}
            primaryText={'more...'}
            onTouchTap={(event) => {
              this.setState({docsLimit: false});
            }}
        />;

        docsList.splice(MAX_DOCS);
        docsList.push(more);
      }
    }

    return <LeftNav docked={false}
             open={this.state.showLeftNav}
             onRequestChange={(show) => this.setState({showLeftNav: show}) } >
      <AppBar title="Menu"
              style={{background: APP_BAR_STYLE.background}}
              iconElementLeft={
                    <IconButton onTouchTap={(event) => this.handleToggleLeftNav() }>
                      <NavigationMenuIcon />
                    </IconButton>
                  } />

      <List subheader="Manage scenarios">
        <ListItem
            primaryText="New"
            leftIcon={<ContentCreate />}
            onTouchTap={(event) => {
              this.setState({showLeftNav: false});
              this.handleNew()
            }} />
        <ListItem
            primaryText="Rename"
            leftIcon={<ContentEdit />}
            onTouchTap={(event) => {
              this.setState({showLeftNav: false});
              this.handleRename()
            }} />
        <ListItem
            primaryText="Open"
            leftIcon={<ContentOpen />}
            initiallyOpen={true}
            primaryTogglesNestedList={true}
            nestedItems={docsList} />
        <ListItem
            primaryText="Save"
            leftIcon={<ContentSave />}
            onTouchTap={(event) => {
              this.setState({showLeftNav: false});
              this.handleSave()
            }} />
        <ListItem
            primaryText="Save as..."
            leftIcon={<ContentSave />}
            onTouchTap={(event) => alert('Sorry, not yet implemented...') } />
      </List>

    </LeftNav>
  }

  // render "sign in" or "signed in as"
  renderUser () {
    if (this.isSignedIn()) {
      let source = this.state.user.email || this.state.user.provider;
      let title = `Logged in as ${this.state.user.displayName} (${source})`;
      let buttonContents = <div title={title} >
        <span style={{color: '#FFFFFF', marginRight: 10}}>Sign out</span>
        <Avatar src={this.state.user.photo} style={{verticalAlign: 'bottom'}} />
      </div>;

      return <span>
        <FlatButton children={ buttonContents } onTouchTap={(event) => this.handleSignOut()} />
      </span>;
    }
    else {
      return <FlatButton label="Sign in" onTouchTap={(event) => this.setState({showSignInDialog: true})} />
    }
  }

  isSignedIn () {
    return this.state.user && this.state.user.id;
  }

  renderSignInDialog () {
    const signInActions = [
      <FlatButton
          label="Cancel"
          onTouchTap={ (event) => this.setState({ showSignInDialog: false}) }
      />
    ];

    return <Dialog
        title="Sign in"
        actions={signInActions}
        modal={false}
        open={this.state.showSignInDialog}
        onRequestClose={ (event) => this.setState({showSignInDialog: false}) }
        contentStyle={{maxWidth: 500}} >
      <p>
        Sign in with your Google or Facebook account:
      </p>

      <div>
        <a href={`/api/v1/auth/google/signin?redirectTo=${this.state.redirectTo || ''}`} className="sign-in" >
          <img src="images/sign_in_google.png" />
        </a>
      </div>
      <div>
        <a href={`/api/v1/auth/facebook/signin?redirectTo=${this.state.redirectTo || ''}`} className="sign-in" >
          <img src="images/sign_in_facebook.png" />
        </a>
      </div>
    </Dialog>
  }

  renderAskToSignInDialog () {
    let cancel = (event) => this.setState({
      showAskToSignIn: false
    });
    let ok = (event) => this.setState({
      showAskToSignIn: false,
      showSignInDialog: true
    });
    
    const actions = [
      <FlatButton
          label="No"
          secondary={true}
          onTouchTap={cancel}
      />,
      <FlatButton
          label="Yes"
          primary={true}
          keyboardFocused={true}
          onTouchTap={ok}
      />
    ];
    
    return <Dialog
        title="Not signed in"
        actions={actions}
        modal={false}
        open={this.state.showAskToSignIn}
        onRequestClose={cancel} >
      <p>
        To open, save, or delete scenarios you have to sign in first.
      </p>
      <p>
        Do you want to sign in now?
      </p>
    </Dialog>
  }

  renderDeleteDocDialog () {
    const cancel = (event) => {
      this.setState({ deleteDocDialog: null });
    };
    const ok = (event) => {
      this.setState({ deleteDocDialog: null });

      this.handleDelete(this.state.deleteDocDialog);
    };

    const actions = [
      <FlatButton
          label="Cancel"
          secondary={true}
          onTouchTap={cancel}
      />,
      <FlatButton
          label="Delete"
          primary={true}
          keyboardFocused={true}
          onTouchTap={ok}
      />
    ];

    const title = this.state.deleteDocDialog &&
        (this.state.deleteDocDialog.title || this.state.deleteDocDialog.id);

    return <Dialog
        title="Delete scenario"
        actions={actions}
        modal={false}
        open={this.state.deleteDocDialog ? true : false}
        onRequestClose={cancel} >
      <p>
        Are you sure you want to delete <b>{title}</b>?
      </p>
    </Dialog>
  }

  renderTitleDialog () {
    const cancel = (event) => {
      this.setState({ showTitleDialog: false });
    };
    const ok = (event) => {
      event.preventDefault();
      event.stopPropagation();

      this.setState({ showTitleDialog: false });

      let doc = cloneDeep(this.state.doc);
      doc.title = this.state.newTitle;
      this.changeDoc(doc);
    };

    const actions = [
      <FlatButton
          label="Cancel"
          secondary={true}
          onTouchTap={cancel}
      />,
      <FlatButton
          label="Ok"
          primary={true}
          keyboardFocused={true}
          onTouchTap={ok}
      />
    ];

    return <Dialog
        title="Rename"
        actions={actions}
        modal={false}
        open={this.state.showTitleDialog}
        onRequestClose={cancel} >
      <p>
        Enter a title for the scenario:
      </p>
      <form onSubmit={ok}>
        <input
            className="title"
            ref="title"
            value={this.state.newTitle}
            onChange={(event) => this.setState({newTitle: event.target.value}) } />
      </form>
    </Dialog>
  }

  renderNotification () {
    let notification = this.state.notification || {};
    let isError = notification.type === 'error';
    let closeable = this.state.closeable !== undefined
      ? notification.closeable
      : !isError;
    let close = () => this.setState({notification: null});
    let ignore = () => null;  // just ignore request to close
    let onRequestClose = closeable ? close : ignore;

    return <div>
      <Snackbar
          className={`snackbar${isError ? ' error' : ''}`}
          open={notification.message ? true : false}
          message={notification.message || ''}
          autoHideDuration={notification.duration}
          onRequestClose={onRequestClose}
          action={isError ? 'Close' : null}
          onActionTouchTap={close}
      />
    </div>;
  }

  componentDidMount () {
    this.fetchUser()
        .then(user => this.setState({ user }))
        .catch(err => this.handleError(err));

    this.fetchDocs();
  }

  handleNew () {
    this.scenario.createNew();
    this.setState({
      doc: this.scenario.get()
    });
  }

  handleRename () {
    this.setState({
      showTitleDialog: true,
      newTitle: this.state.doc.title
    });

    // select the contents of the input field on opening the dialog
    setTimeout( () => this.refs.title.select(), 0);
  }

  handleOpen (id) {
    debug('handleOpen', id);
    
    if (this.isSignedIn()) {
      this.scenario.open(id)
          .then(doc => this.setState({ doc }))
          .catch((err) => this.handleError(err));
    }
    else {
      this.setState({showAskToSignIn: true});
    }
  }

  handleSave () {
    debug('handleSave');

    if (this.isSignedIn()) {
      this.handleAutoSave.cancel();

      this.scenario.save()
          .then((doc) => {
            this.setState({doc, changed: false});
            this.fetchDocs();
          })
          .catch((err) => this.handleError(err));
    } else {
      this.setState({showAskToSignIn: true});
    }
  }

  /**
   * Delete a document
   * @param {{id: string, rev: string, title: string}} what
   */
  handleDelete (what) {
    debug('handleDelete');

    if (this.isSignedIn()) {
      this.scenario.del(what.id, what.rev, what.title)
          .then(() => this.fetchDocs())
          .catch(err => this.handleError(err));
    } else {
      this.setState({showAskToSignIn: true});
    }
  }

  handleError (err) {
    this.setState({
      notification: {
        type: 'error',
        message: err.toString()
      }
    });
  }

  handleToggleLeftNav () {
    this.setState({
      showLeftNav: !this.state.showLeftNav
    })
  }

  handleChange (data) {
    debug('handleChange', data);

    let updatedDoc = cloneDeep(this.state.doc);
    updatedDoc.data = data;

    this.changeDoc(updatedDoc);
  }

  handleSignOut () {
    window.open(`/api/v1/auth/signout?redirectTo=${this.state.redirectTo || ''}`, '_self');
  }

  changeDoc (doc) {
    this.scenario.set(doc);

    this.setState({
      doc,
      changed: true
    });

    // auto save after a delay
    this.handleAutoSave();
  }

  fetchUser () {
    debug('fetching user...');
    return request('GET', '/user');
  }

  fetchDocs () {
    debug('fetching docs...');
    this.scenario.list()
        .then(docs => {
          // sort by updated field, from newest to oldest document
          docs.sort( this.compareUpdated  );
          debug('docs', docs);

          this.setState({ docs })
        })
        .catch(err => this.handleError(err));
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
    return a.updated > b.updated ? -1 : a.updated < b.updated ? 1 : 0;
  }
}

