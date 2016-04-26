import React from 'react';

import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';


export default function DeleteDocDialog ({open, title, onDelete, onCancel}) {
  const actions = [
    <FlatButton
        label="Cancel"
        secondary={true}
        onTouchTap={onCancel}
    />,
    <FlatButton
        label="Delete"
        primary={true}
        keyboardFocused={true}
        onTouchTap={onDelete}
    />
  ];

  return <Dialog
      title="Delete scenario"
      actions={actions}
      modal={false}
      open={open}
      onRequestClose={onCancel} >
    <p>
      Are you sure you want to delete <b>{title}</b>?
    </p>
  </Dialog>
}