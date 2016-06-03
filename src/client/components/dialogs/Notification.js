import React from 'react'
import debugFactory from 'debug/browser'

import Snackbar from 'material-ui/lib/snackbar'

const debug = debugFactory('vbi:notification')

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
export default class Notification extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      open: false,
      type: 'notification',   // 'notification' or 'error'
      message: '',
      duration: null,
      closable: true
    }
  }

  render () {
    let isError = this.state.type === 'error'
    let close = () => this.hide()
    let ignore = () => null  // just ignore request to close
    let onRequestClose = this.state.closeable ? close : ignore

    return <Snackbar
        className={`snackbar${isError ? ' error' : ''}`}
        open={this.state.open}
        message={this.state.message}
        autoHideDuration={this.state.duration}
        onRequestClose={onRequestClose}
        action={isError ? 'Close' : null}
        onActionTouchTap={ event => this.hide() }
    />
  }

  show ({ type = 'notification', message, duration = null, closeable = true }) {
    debug('show', {type, message, duration, closeable})

    this.setState({
      open: true,
      type,
      message,
      duration,
      closeable
    })
  }

  hide () {
    this.setState({ open: false })
  }
}
