import React from 'react'

import Popover from 'material-ui/lib/popover/popover'
import IconButton from 'material-ui/lib/icon-button'
import EditIcon from 'material-ui/lib/svg-icons/image/edit'
import ClearIcon from 'material-ui/lib/svg-icons/content/clear'
import DownIcon from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-down'
import UpIcon from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-up'
import SettingsIcon from 'material-ui/lib/svg-icons/action/settings'

import theme from '../theme'

import shouldComponentUpdate from '../utils/shouldComponentUpdate'

const styles = {
  actionButton: {
    width: 24,
    height: 24,
    padding: 0,
    display: 'inline-block'
  },
  actionMenu: {
    background: '#4d4d4d',
    color: 'pink',
    padding: 10
  },
  icon: {
    color: '#e5e5e5'
  },
  selected: {
    color: '#f3742c'
  }
}

export default class ActionMenu extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      open: false,
      anchorEl: null
    }

    // bind event handlers to this instance
    this.handleTouchTap = this.handleTouchTap.bind(this)
    this.handleRequestClose = this.handleRequestClose.bind(this)

    // update only when props or state are changed
    this.shouldComponentUpdate = shouldComponentUpdate
  }

  render () {
    return <div className="action-menu-anchor">
      <div onTouchTap={this.handleTouchTap}
           style={this.state.open ? styles.selected : null}>
        {this.props.name + ' '}
        <SettingsIcon
          style={{width: 12, height: 12}}
          color={this.state.open ? styles.selected.color : styles.icon.color }
          hoverColor={styles.selected.color}
      />
      </div>
      <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'right', vertical: 'top'}}
          targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
          onRequestClose={this.handleRequestClose}
          useLayerForClickAway={false}
          style={styles.actionMenu}
          className="action-menu" >
        <table className="action-menu-contents">
          <tbody>
          <tr>
            <td>
              <IconButton
                  key="rename"
                  title="Rename category"
                  onTouchTap={ (event) => {
                    this.handleRequestClose()
                    this.props.onRename(this.props.section, this.props.group, this.props.categoryId)
                  }}
                  style={styles.actionButton}>
                <EditIcon color="white" hoverColor={theme.palette.accent1Color} />
              </IconButton>
            </td>
            <td>
              <IconButton
                  key="up"
                  title="Move category up"
                  onTouchTap={(event) => this.props.onMoveUp(this.props.section, this.props.group, this.props.categoryId)}
                  style={styles.actionButton}>
                <UpIcon color="white" hoverColor={theme.palette.accent1Color} />
              </IconButton>
            </td>
            <td>
              <IconButton
                  key="down"
                  title="Move category down"
                  onTouchTap={ (event) => this.props.onMoveDown(this.props.section, this.props.group, this.props.categoryId) }
                  style={styles.actionButton}>
                <DownIcon color="white" hoverColor={theme.palette.accent1Color} />
              </IconButton>
            </td>
            <td>
              <IconButton
                  key="delete"
                  title="Delete category"
                  onTouchTap={(event) => {
                    this.handleRequestClose()
                    this.props.onDelete(this.props.section, this.props.group, this.props.categoryId)
                  }}
                  style={styles.actionButton}>
                <ClearIcon color="white" hoverColor={theme.palette.accent1Color} />
              </IconButton>
            </td>
          </tr>
          </tbody>
        </table>
      </Popover>
    </div>
  }

  handleTouchTap (event) {
    // prevent ghost click
    event.preventDefault()

    this.setState({
      open: true,
      anchorEl: event.currentTarget
    })
  }

  handleRequestClose () {
    this.setState({
      open: false
    })
  }

}