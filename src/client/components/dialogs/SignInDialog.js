import React from 'react'

import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'

/**
 * Usage:
 *
 *     <SignInDialog ref="myDialog" />
 *
 *     this.refs.myDialog.show()
 *     this.refs.myDialog.hide()
 *     this.refs.myDialog.signOut()
 *
 */
export default class SignInDialog extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      open: false
    }
  }

  render () {
    const signInActions = [
      <FlatButton
          label="Cancel"
          onTouchTap={ event => this.hide() }
      />
    ]

    return <Dialog
        title="Sign in"
        actions={signInActions}
        modal={false}
        open={this.state.open}
        onRequestClose={ event => this.hide() }
        contentStyle={{maxWidth: 500}}>
      <p>
        Sign in with your Google or Facebook account:
      </p>

      <div>
        <a href={`/api/v1/auth/google/signin?redirectTo=${SignInDialog.redirectTo()}`}
           className="sign-in">
          <img src="images/sign_in_google.png"/>
        </a>
      </div>
      <div>
        <a href={`/api/v1/auth/facebook/signin?redirectTo=${SignInDialog.redirectTo()}`}
           className="sign-in">
          <img src="images/sign_in_facebook.png"/>
        </a>
      </div>
    </Dialog>
  }

  static signOut () {
    window.open(`/api/v1/auth/signout?redirectTo=${SignInDialog.redirectTo()}`, '_self')
  }

  show () {
    this.setState({ open: true })
  }

  hide () {
    this.setState({ open: false })
  }

  static redirectTo () {
    return encodeURIComponent(location.href)
  }
}