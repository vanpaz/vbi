import React from 'react'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'

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
    const handleCancel = (event) => {
      this._handle(null)
    }

    const handleOk = (event) => {
      event.stopPropagation()
      event.preventDefault()

      this._handle(this.state.value)
    }

    const handleChange = (event) => {
      this.setState({value: event.target.value})
    }

    const actions = [
      <FlatButton
          label="Cancel"
          secondary={true}
          onTouchTap={handleCancel}
      />,
      <FlatButton
          label="Ok"
          primary={true}
          keyboardFocused={true}
          onTouchTap={handleOk}
      />
    ]

    return <Dialog
        title={this.state.title}
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={handleCancel}>
      <p>
        {this.state.description}
      </p>
      <form onSubmit={handleOk}>
        <input
            className="title"
            ref="title"
            value={this.state.value}
            placeholder={this.state.hintText}
            onChange={handleChange}/>
      </form>
    </Dialog>
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
