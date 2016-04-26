import React from 'react';

import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';


export default function AskToSignInDialog ({open, onOk, onCancel}) {
  const actions = [
    <FlatButton
        label="No"
        secondary={true}
        onTouchTap={event => onCancel()}
    />,
    <FlatButton
        label="Yes"
        primary={true}
        keyboardFocused={true}
        onTouchTap={event => onOk()}
    />
  ];

  return <Dialog
      title="Not signed in"
      actions={actions}
      modal={false}
      open={open}
      onRequestClose={event => onCancel()} >
    <p>
      To open, save, or delete scenarios you have to sign in first.
    </p>
    <p>
      Do you want to sign in now?
    </p>
  </Dialog>
}