import React, { Component } from 'react';
import { clone, cloneDeep, debounce } from 'lodash';
import debugFactory from 'debug/browser';

import Avatar from 'material-ui/lib/avatar';
import AppBar from 'material-ui/lib/app-bar';
import Snackbar from 'material-ui/lib/snackbar';
import FlatButton from 'material-ui/lib/flat-button';
import IconButton from 'material-ui/lib/icon-button';
import LeftNav from 'material-ui/lib/left-nav';
import NavigationMenuIcon from 'material-ui/lib/svg-icons/navigation/menu';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import EditIcon from 'material-ui/lib/svg-icons/image/edit';
import OpenIcon from 'material-ui/lib/svg-icons/file/folder-open';
import SaveIcon from 'material-ui/lib/svg-icons/content/save';
import CreateIcon from 'material-ui/lib/svg-icons/content/add';
import ClearIcon from 'material-ui/lib/svg-icons/content/clear';
import ThemeManager from 'material-ui/lib/styles/theme-manager'

import theme from '../theme'
import SignInDialog from './dialogs/SignInDialog';
import AskToSignInDialog from './dialogs/AskToSignInDialog';
import DeleteDocDialog from './dialogs/DeleteDocDialog';
import Prompt from './dialogs/Prompt';
import Scenario from './Scenario';
import Inputs from './Inputs';
import Outputs from './Outputs';
import { request } from '../js/request';

const debug = debugFactory('vbi:app');

const MAX_DOCS = 10;  // maximum number of visible docs in the left navigation menu

const AUTO_SAVE_DELAY = 5000; // milliseconds

const APP_BAR_STYLE = {
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 999
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
      showSignInDialog: false,
      showAskToSignIn: false,
      showPeriodsDialog: false,
      deleteDocDialog: null, // null or { title: string, id: string, rev: string }

      newTitle: '',
      newPeriods: '',

      notification: null, // null or { message: string, closeable: boolean, duration: number | null}

      redirectTo: encodeURIComponent(location.href)
    };
  }

  render() {
    return (
      <div>
        { this.renderAppBar() }
        { this.renderLefNav() }
        { this.renderDialogs() }
        { this.renderNotification() }

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
      const rightIcon = <ClearIcon onTouchTap={ (event) => {
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
            leftIcon={<CreateIcon />}
            onTouchTap={(event) => {
              this.setState({showLeftNav: false});
              this.handleNew()
            }} />
        <ListItem
            primaryText="Rename"
            leftIcon={<EditIcon />}
            onTouchTap={(event) => {
              this.setState({showLeftNav: false});
              this.handleRename()
            }} />
        <ListItem
            primaryText="Open"
            leftIcon={<OpenIcon />}
            initiallyOpen={true}
            primaryTogglesNestedList={true}
            nestedItems={docsList} />
        <ListItem
            primaryText="Save"
            leftIcon={<SaveIcon />}
            onTouchTap={(event) => {
              this.setState({showLeftNav: false});
              this.handleSave()
            }} />
        <ListItem
            primaryText="Save as..."
            leftIcon={<SaveIcon />}
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

  renderDialogs () {
    return <div>
      <Prompt
          open={this.state.showTitleDialog}
          title="Rename"
          description="Enter a title for the scenario:"
          value={this.state.newTitle}
          hintText="My Scenario"
          onCancel={() => {
            this.setState({ showTitleDialog: false });
          }}
          onChange={(value) => {
            this.setState({ newTitle: value });
          }}
          onOk={(value) => {
            this.setState({ showTitleDialog: false });

            let doc = cloneDeep(this.state.doc);
            doc.title = value;
            this.changeDoc(doc);
          }}
      />

      <SignInDialog
          open={this.state.showSignInDialog}
          redirectTo={this.state.redirectTo}
          onCancel={() => this.setState({
              showSignInDialog: false
            })} />

      <AskToSignInDialog
          open={this.state.showAskToSignIn}
          onCancel={() => this.setState({
              showAskToSignIn: false
            })}
          onOk={() => this.setState({
              showAskToSignIn: false,
              showSignInDialog: true
            })}
      />

      <DeleteDocDialog
          open={this.state.deleteDocDialog ? true : false}
          title={
              this.state.deleteDocDialog &&
                (this.state.deleteDocDialog.title || this.state.deleteDocDialog.id)}
          onCancel={() => {
              this.setState({ deleteDocDialog: null })
            }}
          onDelete={() => {
              const deleteDocDialog = this.state.deleteDocDialog;
              this.setState({ deleteDocDialog: null });
              this.handleDelete(deleteDocDialog);
            }}
      />

      <Prompt
          open={this.state.showPeriodsDialog}
          title="Periods"
          description="Enter a comma separated list with periods:"
          value={this.state.newPeriods}
          hintText={comingYears().join(', ')}
          onCancel={() => {
            this.setState({ showPeriodsDialog: false });
          }}
          onChange={(value) => {
            this.setState({ newPeriods: value });
          }}
          onOk={(value) => {
            this.setState({ showPeriodsDialog: false });
            this.setPeriods(value);
          }}
      />
    </div>
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

  handleEditPeriods () {
    const parameters = this.state.doc &&
        this.state.doc.data &&
        this.state.doc.data.parameters;

    this.setState({
      showPeriodsDialog: true,
      newPeriods: (parameters && parameters.periods)
          ? parameters.periods.join(', ')
          : ''
    });
  }

  /**
   * Apply a new series of periods
   * @param {string | Array.<string>} periods   A comma separated string or
   *                                            an array with strings.
   */
  setPeriods (periods) {
    debug('setPeriods', periods);

    if (Array.isArray(periods)) {
      let updatedDoc = cloneDeep(this.state.doc);
      updatedDoc.data.parameters.periods = clone(periods);

      this.changeDoc(updatedDoc);
    }
    else {
      // periods is a string
      const array = periods.split(',').map(trim);
      this.setPeriods(array);
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
    if (doc._id) {
      this.handleAutoSave();
    }
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

  // getChildContext and childContextTypes are needed to set a custom material-ui theme
  getChildContext() {
    return {
      muiTheme: ThemeManager.getMuiTheme(theme)
    }
  }
}

function trim (str) {
  return str.trim();
}

function comingYears (count = 5) {
  const years = [];
  let year = new Date().getFullYear();

  for (let i = 0; i < count; i++) {
    years.push(year + i);
  }

  return years;
}

// getChildContext and childContextTypes are needed to set a custom material-ui theme
// the key passed through context must be called "muiTheme"
App.childContextTypes = {
  muiTheme: React.PropTypes.object
};
