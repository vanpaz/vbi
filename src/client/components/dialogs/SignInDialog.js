import React from 'react';

import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';


export default function SignInDialog ({open, redirectTo, onCancel}) {
  const signInActions = [
    <FlatButton
        label="Cancel"
        onTouchTap={ event => onCancel() }
    />
  ];

  return <Dialog
      title="Sign in"
      actions={signInActions}
      modal={false}
      open={open}
      onRequestClose={ onCancel }
      contentStyle={{maxWidth: 500}} >
    <p>
      Sign in with your Google or Facebook account:
    </p>

    <div>
      <a href={`/api/v1/auth/google/signin?redirectTo=${redirectTo || ''}`} className="sign-in" >
        <img src="images/sign_in_google.png" />
      </a>
    </div>
    <div>
      <a href={`/api/v1/auth/facebook/signin?redirectTo=${redirectTo || ''}`} className="sign-in" >
        <img src="images/sign_in_facebook.png" />
      </a>
    </div>
  </Dialog>

}