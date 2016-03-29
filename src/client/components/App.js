import React, { Component } from 'react';
import debugFactory from 'debug/browser';

import Avatar from 'material-ui/lib/avatar';
import AppBar from 'material-ui/lib/app-bar';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';
import IconButton from 'material-ui/lib/icon-button';
import LeftNav from 'material-ui/lib/left-nav';
import MenuItem from 'material-ui/lib/menus/menu-item';
import NavigationMenuIcon from 'material-ui/lib/svg-icons/navigation/menu';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import ActionGrade from 'material-ui/lib/svg-icons/action/grade';
import ContentInbox from 'material-ui/lib/svg-icons/content/inbox';
import ContentDrafts from 'material-ui/lib/svg-icons/content/drafts';
import ContentOpen from 'material-ui/lib/svg-icons/file/folder-open';
import ContentSave from 'material-ui/lib/svg-icons/content/save';
import ContentCreate from 'material-ui/lib/svg-icons/content/add';
import ContentClear from 'material-ui/lib/svg-icons/content/clear';

import InputForm from './InputForm';
import ProfitAndLoss from './ProfitAndLoss';

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

// TODO: read data from localStorage and in the end from a database
var data = require('../../../data/example_company.json');

debug('data', data);


export default class App extends Component {
  constructor (props) {
    super(props);

    this.state = {
      user: {},
      showLeftNav: false,
      showSignInDialog: false,
      data
    };
  }

  render() {
    return (
      <div>
        { this.renderAppBar() }
        { this.renderLefNav() }
        { this.renderSignInDialog() }

        <div>
          <div className="container input-form">
            <InputForm data={this.state.data} onChange={data => this.handleChangeData(data)} />
          </div>

          <div className="container profit-and-loss">
            <ProfitAndLoss data={this.state.data} />
          </div>
        </div>

        <div className="footer">
          Copyright &copy; 2016 <a href="http://vanpaz.com">VanPaz</a>
        </div>
      </div>
    );
  }

  renderAppBar () {
    return <AppBar
        style={APP_BAR_STYLE}
        title="VanPaz Business Intelligence"
        iconElementLeft={
              <IconButton onTouchTap={(event) => this.handleToggleLeftNav() }>
                <NavigationMenuIcon />
              </IconButton> }
        iconElementRight={ this.renderUser() } />
  }

  renderLefNav () {
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
        <ListItem primaryText="Create" leftIcon={<ContentCreate />} />
        <ListItem
            primaryText="Open"
            leftIcon={<ContentOpen />}
            initiallyOpen={true}
            primaryTogglesNestedList={true}
            nestedItems={[
              <ListItem
                key={1}
                primaryText="Scenario A"
                rightIcon={
                  <ContentClear onTouchTap={(event) => {
                    event.stopPropagation();
                    debug('Delete Scenario A')
                  }} />
                }
                onTouchTap={(event) => debug('Open Scenario A') } // TODO: open files
              />,
              <ListItem
                key={2}
                primaryText="Scenario B"
                rightIcon={
                  <ContentClear onTouchTap={(event) => {
                    event.stopPropagation();
                    debug('Delete Scenario B')
                  }} />
                }
                onTouchTap={(event) => debug('Open Scenario B') } // TODO: open files
              />
            ]}
        />
        <ListItem primaryText="Save" leftIcon={<ContentSave />} />
        <ListItem primaryText="Save as..." leftIcon={<ContentSave />} />
      </List>

    </LeftNav>
  }

  // render "login" or "logged in as"
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

  componentDidMount () {
    this.getUser();
  }

  handleToggleLeftNav () {
    this.setState({
      showLeftNav: !this.state.showLeftNav
    })
  }

  handleChangeData (data) {
    debug('handleChangeData', data);
    this.setState({data});
    // TODO: save changes to database
  }

  handleSignOut () {
    window.open('/api/v1/auth/signout', '_self');
  }

  /**
   * Get the users profile
   * @return {Promise.<Object, Error>} Resolves with the retrieved user profile
   */
  getUser () {
    debug('Fetching user profile...');
    return fetch('/api/v1/auth/user', { credentials: 'include' }).then((response) => {
      if (response.status < 200 || response.status >= 300) {
        debug('Error fetching user profile', response.status, response);
        return;
      }

      // Examine the text in the response
      return response.json().then((user) => {
        debug('Retrieved user profile:', user);
        this.setState({user});

        return user;
      });
    });
  }

}
