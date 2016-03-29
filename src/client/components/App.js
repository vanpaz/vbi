import React, { Component } from 'react';
import debugFactory from 'debug/browser';

import Avatar from 'material-ui/lib/avatar';
import AppBar from 'material-ui/lib/app-bar';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';
import LeftNav from 'material-ui/lib/left-nav';
import MenuItem from 'material-ui/lib/menus/menu-item';


import InputForm from './InputForm';
import ProfitAndLoss from './ProfitAndLoss';

const debug = debugFactory('vbi:app');

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
        <AppBar
            style={{position: 'fixed', top: 0, left: 0, zIndex: 999, background: '#f3742c'}}
            title="VanPaz Business Intelligence"
            iconElementRight={ this.renderUser() } />

        <LeftNav docked={false}
                 width={200}
                 open={this.state.showLeftNav}
                 onRequestChange={event => this.setState({showLeftNav: true})} >
          <MenuItem>Menu Item</MenuItem>
          <MenuItem>Menu Item 2</MenuItem>


        </LeftNav>

        {this.renderSignInDialog() }

        <div>
          <div className="container input-form">
            <InputForm data={this.state.data} onChange={data => this.handleChange(data)} />
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
        <FlatButton children={ buttonContents } onClick={() => this.signOut()} />
      </span>;
    }
    else {
      return <FlatButton label="Sign in" onClick={(event) => this.setState({showSignInDialog: true})} />
    }
  }

  renderSignInDialog () {
    const signInActions = [
      <FlatButton
          label="Cancel"
          onTouchTap={ (event) => this.setState({showSignInDialog: false}) }
      />
    ];

    return <Dialog
        title="Sign in"
        actions={signInActions}
        modal={false}
        open={this.state.showSignInDialog}
        onRequestClose={ (event) => this.setState({showSignInDialog: false}) } >
      <p>
        Sign in with your Google or Facebook account:
      </p>

      <div>
        <RaisedButton
            label="Google"
            linkButton={true}
            href="/api/v1/auth/google/signin"
            backgroundColor='#E9573F'
            labelColor="#FFFFFF"
            style={{width: 200, margin: 10}} />
      </div>
      <div>
        <RaisedButton
            label="Facebook"
            linkButton={true}
            href="/api/v1/auth/facebook/signin"
            backgroundColor="#3c80d9"
            labelColor="#FFFFFF"
            style={{width: 200, margin: 10}} />
      </div>
    </Dialog>
  }

  componentDidMount () {
    this.getUser();
  }

  handleChange (data) {
    debug('handleChange', data);
    this.setState({data});
    // TODO: save changes to database
  }

  signOut () {
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
