import React from 'react'

import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'

import bindMethods from '../../utils/bindMethods'

/**
 * Usage:
 *
 *     <Confirm ref="confirmDialog" />
 *
 *     this.refs.confirmDialog.show({
 *       title: 'Sign in',
 *       description: <div>
 *         <p>
 *           To open, save, or delete scenarios you have to sign in first.
 *         </p>
 *         <p>
 *          Do you want to sign in now?
 *         </p>
 *       </div>
 *     })
 *        .then(ok => {
 *          console.log('ok?', ok)  // ok is true or false
 *        })
 *
 *     this.refs.confirmDialog.hide()
 *
 */
export default class Confirm extends React.Component {
  constructor (props) {
    super (props)
    bindMethods(this)

    this.state = {
      open: false,
      title: null,
      description: null,
      handler: function () {}
    }
  }

  render () {
    const actions = [
      <FlatButton
          label="No"
          secondary={true}
          onTouchTap={this.hide}
      />,
      <FlatButton
          label="Yes"
          primary={true}
          keyboardFocused={true}
          onTouchTap={this._handleOk}
      />
    ]

    return <Dialog
        title={this.state.title}
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.hide} >
      {this.state.description}
    </Dialog>
  }

  show ({ title, description }) {
    return new Promise((resolve, reject) => {
      this.setState({
        open: true,
        title: title || 'Title',
        description: description || 'Description',
        handler: resolve
      })
    })
  }

  hide () {
    this._handle(false)
  }

  _handleOk () {
    this._handle(true)
  }
  
  _handle (ok) {
    this.state.handler(ok)
    this.setState({
      open: false,
      handler: function () {}
    })
  }

}