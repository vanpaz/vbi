import React, { Component } from 'react';
import { cloneDeep } from 'lodash';
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
import ContentOpen from 'material-ui/lib/svg-icons/file/folder-open';
import ContentSave from 'material-ui/lib/svg-icons/content/save';
import ContentCreate from 'material-ui/lib/svg-icons/content/add';
import ContentClear from 'material-ui/lib/svg-icons/content/clear';

import Scenario from './Scenario';
import InputForm from './InputForm';
import ProfitAndLoss from './ProfitAndLoss';
import { request } from './request';

const debug = debugFactory('vbi:app');

const APP_BAR_STYLE = {
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 999,
  background: '#f3742c'
};

// Road map:
// - create two panels: left panel for input, right panel for profit & loss
// - left panel shows excel-like tables
// - the right panel shows a profit&loss table
// - later on we could create a business model canvas input format in the left panel
// - create an option to show the numbers as a cumulative bar chart


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
    this.scenario.on('change', (doc) => this.setState({doc}));
    this.scenario.on('opening', (params) => {
      if (params.type === 'start') {
        this.setState({
          notification: `Opening ${params.title || params.id}`,
          notificationClosable: false,
          notificationDuration: null
        })
      }
      if (params.type === 'end') {
        this.setState({
          notification: `Opened ${params.title || params.id}`,
          notificationClosable: true,
          notificationDuration: 4000
        })
      }
      if (params.type === 'error') {
        this.setState({
          notification: params.error.toString(),
          notificationClosable: true,
          notificationDuration: null
        })
      }
    });
    this.scenario.on('saving', (params) => {
      if (params.type === 'start') {
        this.setState({
          notification: `Saving ${params.title || params.id}`,
          notificationClosable: false,
          notificationDuration: null
        })
      }
      if (params.type === 'end') {
        this.setState({
          notification: `Saved ${params.title || params.id}`,
          notificationClosable: true,
          notificationDuration: 4000
        })
      }
      if (params.type === 'error') {
        this.setState({
          notification: params.error.toString(),
          notificationClosable: true,
          notificationDuration: null
        })
      }
    });

    this.state = {
      user: {},
      showLeftNav: false,
      showSignInDialog: false,
      doc: this.scenario.get(),   // The current doc
      docs: [],                   // list with all docs of the user

      notification: null,
      notificationDuration: null,
      msgOpening: null,
      msgOpened: null,
      msgSaving: null,
      msgSaved: null,
      msgError: null
    };
  }

  render() {
    return (
      <div>
        { this.renderAppBar() }
        { this.renderLefNav() }
        { this.renderSignInDialog() }
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
    let title = this.state.doc && this.state.doc.title
        ? `VanPaz Business Intelligence [${this.state.doc.title}]`
        : `VanPaz Business Intelligence`;

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
    let docsList = this.state.docs.map(doc => {
      return <ListItem
          key={doc.id}
          primaryText={doc.title || doc.id}
          rightIcon={
                  <ContentClear onTouchTap={(event) => {
                    event.stopPropagation();
                    Scenario.del(doc.id, doc.rev)
                      .then(() => this.listDocs());
                  }} />
                }
          onTouchTap={(event) => {
            this.setState({showLeftNav: false});
            this.handleOpen(doc.id)
          }}
      />;
    });

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
            primaryText="Create"
            leftIcon={<ContentCreate />}
            onTouchTap={(event) => alert('Sorry, not yet implemented...') } />
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
    if (this.state.user && this.state.user.provider) {
      let source = this.state.user.email || this.state.user.provider;
      let title = `Logged in as ${this.state.user.displayName} (${source})`;
      let buttonContents = <div title={title} >
        <span style={{color: '#FFFFFF', marginRight: 10}}>Sign out</span>
        <Avatar src={this.state.user.photo} style={{verticalAlign: 'bottom'}} />
      </div>;

      return <span>
        <FlatButton children={ buttonContents } onTouchTap={() => this.handleSignOut()} />
      </span>;
    }
    else {
      return <FlatButton label="Sign in" onTouchTap={(event) => this.setState({showSignInDialog: true})} />
    }
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
        <a href="/api/v1/auth/google/signin" className="sign-in" >
          <img src="images/sign_in_google.png" />
        </a>
      </div>
      <div>
        <a href="/api/v1/auth/facebook/signin" className="sign-in" >
          <img src="images/sign_in_facebook.png" />
        </a>
      </div>
    </Dialog>
  }

  renderNotification () {
    let onRequestClose = this.state.notificationClosable
        ? () => {this.setState({notification: null})}
        : () => {};  // just ignore request to close

    let isError = this.state.notification && (this.state.notification.indexOf('Error:') !== -1);

    return <div>
      <Snackbar
          open={this.state.notification != null}
          message={this.state.notification}
          autoHideDuration={this.state.notificationDuration}
          onRequestClose={onRequestClose}
          bodyStyle={isError ? {background: '#E9573F'} : null}
      />
    </div>;
  }

  componentDidMount () {
    this.fetchUser().then(user => this.setState({user}));

    this.listDocs();
  }

  listDocs () {
    Scenario.list().then(docs => this.setState({docs}));
  }
  
  handleOpen (id) {
    debug('handleOpen', id);

    this.scenario.open(id)
        .then(doc => {
          this.setState({ doc });
        })
        .catch((err) => {
          this.setState({
            errors: this.state.errors.concat(err)
          })
        });
  }

  handleSave () {
    debug('handleSave');

    this.scenario.save()
        .then((doc) => {
          this.setState({ doc });
          this.listDocs();
        })
        .catch((err) => {
          this.setState({
            errors: this.state.errors.concat(err)
          })
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

    this.scenario.set(updatedDoc);

    this.setState({ doc: updatedDoc });
  }

  handleSignOut () {
    window.open('/api/v1/auth/signout', '_self');
  }

  fetchUser () {
    return request('GET', '/user');
  }
}

