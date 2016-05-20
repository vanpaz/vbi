import React from 'react'

import IconButton from 'material-ui/lib/icon-button'
import EditIcon from 'material-ui/lib/svg-icons/image/edit'
import ClearIcon from 'material-ui/lib/svg-icons/content/clear'
import DownIcon from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-down'
import UpIcon from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-up'

import theme from '../theme'

import shouldComponentUpdate from '../js/shouldComponentUpdate'

const styles = {
  actionButton: {
    width: 24,
    height: 24,
    padding: 0,
    display: 'inline-block'
  }
}

export default class ActionMenu extends React.Component {
  constructor (props) {
    super(props)

    // update only when props or state are changed
    this.shouldComponentUpdate = shouldComponentUpdate
  }

  render () {
    return <div className="action-menu-root">
      {this.props.name}
      <div className="action-menu">
        <table className="action-menu-contents">
          <tbody>
          <tr>
            <td>
              <IconButton
                  key="rename"
                  title="Rename category"
                  onTouchTap={ (event) => this.props.onRename(this.props.section, this.props.group, this.props.categoryId) }
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
                  onTouchTap={(event) => this.props.onDelete(this.props.section, this.props.group, this.props.categoryId) }
                  style={styles.actionButton}>
                <ClearIcon color="white" hoverColor={theme.palette.accent1Color} />
              </IconButton>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  }

}