import React from 'react'

import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'

import bindMethods from '../../utils/bindMethods'

/**
 * Usage:
 *
 *     <Prompt ref="myPrompt" title="Name" description="Enter a name" hintText="Joe" />
 *
 *     this.refs.myPrompt.show('Sarah')
 *        .then(value => {
 *          console.log('value', value)  // value is null or the new name
 *        })
 *
 *     this.refs.myPrompt.hide()
 *
 */
export default class Prompt extends React.Component {
  constructor (props) {
    super(props)
    bindMethods(this)

    this.state = {
      open: false,
      title: 'Title',
      description: 'Description',
      hintText: null,
      value: '',
      handler: function () {}
    }
  }

  render () {
    const actions = [
      <FlatButton
          label="Cancel"
          secondary={true}
          onTouchTap={this.handleCancel}
      />,
      <FlatButton
          label="Ok"
          primary={true}
          keyboardFocused={true}
          onTouchTap={this.handleOk}
      />
    ]

    return <Dialog
        title={this.state.title}
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleCancel}>
      <p>
        {this.state.description}
      </p>
      <form onSubmit={this.handleOk}>
        <input
            className="title"
            ref="title"
            value={this.state.value}
            placeholder={this.state.hintText}
            onChange={this.handleChange}/>
      </form>
    </Dialog>
  }

  handleCancel (event) {
    this._handle(null)
  }

  handleOk (event) {
    event.stopPropagation()
    event.preventDefault()

    this._handle(this.state.value)
  }

  handleChange (event) {
    this.setState({
      value: event.target.value
    })
  }

  _handle (value) {
    this.state.handler(value)
    this.setState({
      open: false,
      handler: function () {}
    })
  }

  show ({value, title, description, hintText }) {
    return new Promise((resolve, reject) => {
      this.setState({
        open: true,
        value,
        title: title || 'Title',
        description: description || 'Description',
        hintText: hintText || null,
        handler: resolve
      })

      this.select()
    })
  }

  hide () {
    this._handle(null)
  }

  select () {
    setTimeout(() => {
      this.refs.title.select()
    }, 0)
  }
}
