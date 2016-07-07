import React from 'react'

import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'

import bindMethods from '../../utils/bindMethods'

/**
 * Usage:
 *
 *     <DeleteDialog ref="deleteDialog" />
 *
 *     this.refs.deleteDialog.show({
 *       title: 'Delete scenario',
 *       description: <span>Are you sure you want to delete <b>{title}</b>?</span>
 *     })
 *        .then(doDelete => {
 *          console.log('doDelete?', doDelete)  // doDelete is true or false
 *        })
 *
 *     this.refs.deleteDialog.hide()
 *
 */
export default class DeleteDialog extends React.Component {
  constructor (props) {
    super(props)
    bindMethods(this)

    this.state = {
      open: false,
      title: 'Delete',
      description: 'Are you sure?',
      handler: function () {}
    }
  }

  render () {
    const actions = [
      <FlatButton
          label="Cancel"
          secondary={true}
          onTouchTap={this.hide}
      />,
      <FlatButton
          label="Delete"
          primary={true}
          keyboardFocused={true}
          onTouchTap={this._handleDeleteOk}
      />
    ]

    return <Dialog
        title={this.state.title}
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.hide} >
      <p>
        {this.state.description}
      </p>
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
    this._handleDelete(false)
  }

  _handleDeleteOk () {
    this._handleDelete(true)
  }

  _handleDelete (doDelete) {
    this.state.handler(doDelete)
    this.setState({
      open: false,
      handler: function () {}
    })
  }

}