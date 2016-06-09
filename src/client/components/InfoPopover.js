import React, { Component } from 'react'

import Popover from 'material-ui/Popover'

const styles = {
  popover: {
    backgroundColor: '#4d4d4d',
    color: '#e5e5e5',
    padding: 10,
    maxWidth: 400,
    marginLeft: 10
  }
}

/**
 * Usage:
 *
 *     <InfoPopover ref="infoPopover" />
 *
 *     infoPopover.show(event.currentTarget, 'hello world')
 */
export default class InfoPopover extends Component {
  constructor (props) {
    super(props)

    this.state = {
      open: false,
      text: '(no info)',
      anchorEl: null
    }

    this.opening = false

    // bind the event handlers to this instance
    this.handleClosePopover = this.handleClosePopover.bind(this)
  }

  render () {
    return <Popover
        open={this.state.open}
        anchorEl={this.state.anchorEl}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        onRequestClose={this.handleClosePopover}
        useLayerForClickAway={false}
        style={styles.popover}
        className="info-popover" >
      {
        this.state.text
            .split('\n')
            .map((line, index) => <p key={index}>{line}</p>)
      }
    </Popover>
  }


  handleClosePopover () {
    if (!this.opening) {
      this.setState({ open: false })

      setTimeout(() => {
        this.props.onChanged()
      }, 0)
    }
  }

  show(anchorEl, text) {
    this.setState({
      open: true,
      text,
      anchorEl
    })

    // this.opening is used to prevent closing the popup when clicking an other
    // category whilst the popup is visible
    this.opening = true
    setTimeout(() => {
      this.opening = false
      this.props.onChanged()
    }, 0)
  }

  isDisplaying (text) {
    return this.state.open && this.state.text === text
  }
}