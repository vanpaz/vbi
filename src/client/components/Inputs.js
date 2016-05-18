import React, { Component } from 'react';
import { connect } from 'react-redux'
import debugFactory from 'debug/browser';
import { cloneDeep } from 'lodash';

import Card from 'material-ui/lib/card/card';
import CardText from 'material-ui/lib/card/card-text';
import Tabs from 'material-ui/lib/tabs/tabs';
import Tab from 'material-ui/lib/tabs/tab';
import IconButton from 'material-ui/lib/icon-button';
import FlatButton from 'material-ui/lib/flat-button';
import EditIcon from 'material-ui/lib/svg-icons/image/edit';
import AddIcon from 'material-ui/lib/svg-icons/content/add';
import ClearIcon from 'material-ui/lib/svg-icons/content/clear';
import DownIcon from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-down';
import UpIcon from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-up';

import Prompt from './dialogs/Prompt'
import Confirm from './dialogs/Confirm'
import {
    addGroup, renameGroup, deleteGroup,
    addCategory, deleteCategory, renameCategory,
    setPeriods, setQuantity, setPrice
} from '../actions'
import { findQuantity, clearIfZero } from './../js/formulas';
import Price from './Price';
import theme from '../theme';

import ActionMenu from './ActionMenu';

const debug = debugFactory('vbi:inputs');


const styles = {
  actionButton: {
    width: 24,
    height: 24,
    padding: 0,
    display: 'inline-block'
  }
};

// TODO: refactor Inputs, split renderCategory into a separate component

class Inputs extends Component {
  render () {
    return <div style={{width: '100%', display: 'inline-flex'}}>
      <Card className="card">
        <CardText>
          <Tabs inkBarStyle={{height: 4, marginTop: -4}}>
            <Tab label="Costs">
              {this.renderSection('costs', ['constant', 'manual', 'revenue'])}
            </Tab>
            <Tab label="Investments">
              {this.renderSection('investments', ['investment'])}
            </Tab>
            <Tab label="Revenues">
              {this.renderSection('revenues', ['constant', 'manual'])}
            </Tab>
          </Tabs>
        </CardText>
      </Card>

      <Prompt ref="prompt" />
      <Confirm ref="confirm" />
    </div>
  }

  renderSection (section, priceTypes) {
    const periods = this.props.data.parameters.periods;
    const group = this.props.data[section];

    return <div>
      {
        group && group.map((group) => this.renderGroup(section, group, periods, priceTypes))
      }
      <p>
        <button
            className="add-group"
            title="Add a new group"
            onTouchTap={ (event) => this.handleAddGroup(section) }>
          +
        </button>
      </p>
    </div>
  }

  renderGroup (section, group, periods, priceTypes) {
    const revenueCategories = this.props.data.revenues.map(g => g.name);

    return <div key={group.id}>
      <h1>{this.renderGroupActionMenu(section, group)}</h1>

      <table className="category-table" >
        <colgroup>
          <col width='120px'/>
        </colgroup>
        <tbody>
          <tr>
            <th />
            <th className="main" colSpan={periods.length}>Quantity</th>
            <th className="main" colSpan={1}>Price</th>
          </tr>
          <tr>
            <th />
            {
              periods.map(period => {
                return <th key={period}>
                  {this.renderPeriodsActionMenu(period)}
                </th>
              })
            }
            <th />
          </tr>
          {
            group.categories && group.categories.map(category => <tr key={group.name + ':' + category.name}>
              <td className="read-only">{
                this.renderCategoryActionMenu(section, group, category)
              }</td>
              {
                periods.map(period => (<td key={period} className="quantity">
                  <input className="quantity"
                         value={clearIfZero(findQuantity(category, period))}
                         onChange={(event) => {
                           const quantity = event.target.value;
                           this.props.dispatch(setQuantity(section, group.id, category.id, period, quantity));
                         }}
                         onFocus={(event) => event.target.select()} />
                </td>))
              }
              <td>
                <Price price={category.price}
                       categories={revenueCategories}
                       periods={periods}
                       priceTypes={priceTypes}
                       onChange={(price) => {
                         this.props.dispatch(setPrice (section, group.id, category.id, price))
                       }} />
              </td>
            </tr>)
          }
        <tr>
          <td className="read-only">
            <button
                className="add-category"
                title="Add a new category"
                onTouchTap={ (event) => this.handleAddCategory(section, group.id) }>
              +
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  }

  // TODO: move into a separate component
  renderPeriodsActionMenu (period) {
    let periodActions = [
      <IconButton
          key="edit"
          title="Edit periods"
          onTouchTap={event => this.handleSetPeriods()}
          style={{width: 24, height: 24, padding: 0}}>
        <EditIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>
    ];

    return <ActionMenu actions={periodActions}>
      {period}
    </ActionMenu>
  }

  // TODO: move into a separate component

  renderGroupActionMenu (section, group) {
    // TODO: implement actions for GroupActionMenu

    let periodActions = [
      <IconButton
          key="rename"
          title="Rename group"
          onTouchTap={ (event) => this.handleRenameGroup(section, group.id) }
          style={styles.actionButton}>
        <EditIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>,
      <IconButton
          key="up"
          title="Move group up"
          onTouchTap={
            // TODO: implement action
            (event) => alert('not yet implemented')
          }
          style={styles.actionButton}>
        <UpIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>,
      <IconButton
          key="down"
          title="Move group down"
          onTouchTap={
            // TODO: implement action
            (event) => alert('not yet implemented')
          }
          style={styles.actionButton}>
        <DownIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>,
      <IconButton
          key="delete"
          title="Delete group"
          onTouchTap={(event) => this.handleDeleteGroup(section, group.id) }
          style={{width: 24, height: 24, padding: 0}}>
        <ClearIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>
    ];

    return <ActionMenu actions={periodActions}>
      {group.name}
    </ActionMenu>
  }

  // TODO: move into a separate component
  renderCategoryActionMenu (section, group, category) {
    // TODO: implement actions for CategoryActionMenu

    let periodActions = [
      <IconButton
          key="rename"
          title="Rename category"
          onTouchTap={ (event) => this.handleRenameCategory(section, group.id, category.id) }
          style={styles.actionButton}>
        <EditIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>,
      <IconButton
          key="up"
          title="Move category up"
          onTouchTap={
            // TODO: implement action
            (event) => alert('not yet implemented')
          }
          style={styles.actionButton}>
        <UpIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>,
      <IconButton
          key="down"
          title="Move category down"
          onTouchTap={
            // TODO: implement action
            (event) => alert('not yet implemented')
          }
          style={styles.actionButton}>
        <DownIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>,
      <IconButton
          key="delete"
          title="Delete category"
          onTouchTap={(event) => this.handleDeleteCategory(section, group.id, category.id)}
          style={{width: 24, height: 24, padding: 0}}>
        <ClearIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>
    ];

    return <ActionMenu actions={periodActions}>
      {category.name}
    </ActionMenu>
  }

  /**
   * Open a prompt where the user can enter a comma separated list with periods
   */
  handleSetPeriods () {
    const parameters = this.props.data && this.props.data.parameters

    const periods = (parameters && parameters.periods)
        ? parameters.periods.join(', ')
        : ''

    const options = {
      title: 'Periods',
      description: 'Enter a comma separated list with periods:',
      hintText: comingYears().join(', '),
      value: periods
    }

    this.refs.prompt.show(options).then(value => {
      if (value !== null) {
        const newPeriods = value.split(',').map(trim)
        this.props.dispatch(setPeriods(newPeriods))
      }
    })
  }

  handleAddGroup (section) {
    const options = {
      title: 'New group',
      description: 'Enter a name for the new group:',
      hintText: 'New group',
      value: 'New group'
    }

    this.refs.prompt.show(options).then(name => {
      if (name !== null) {
        this.props.dispatch(addGroup(section, name))
      }
    })
  }

  handleRenameGroup (section, groupId) {
    const group = this.findGroup(section, groupId)

    const options = {
      title: 'Rename group',
      description: 'Enter a new name for the group:',
      hintText: 'New Group',
      value: group.name
    }

    this.refs.prompt.show(options).then(name => {
      if (name !== null) {
        this.props.dispatch(renameGroup(section, groupId, name))
      }
    })
  }

  handleDeleteGroup(section, groupId) {
    const group = this.findGroup(section, groupId)

    const options = {
      title: 'Delete group',
      description: <p>Are you sure you want to delete group "{group.name}"?</p>
    }

    this.refs.confirm.show(options).then(ok => {
      if (ok) {
        this.props.dispatch(deleteGroup(section, groupId))
      }
    })
  }

  handleAddCategory (section, groupId) {
    const options = {
      title: 'New category',
      description: 'Enter a name for the new category:',
      hintText: 'New category',
      value: 'New category'
    }

    this.refs.prompt.show(options).then(name => {
      if (name !== null) {
        this.props.dispatch(addCategory(section, groupId, name))
      }
    })
  }

  handleRenameCategory (section, groupId, categoryId) {
    const category = this.findCategory(section, groupId, categoryId)

    const options = {
      title: 'Rename category',
      description: 'Enter a new name for the category:',
      hintText: 'New category',
      value: category.name
    }

    this.refs.prompt.show(options).then(newName => {
      if (newName !== null) {
        this.props.dispatch(renameCategory(section, groupId, categoryId, newName))
      }
    })
  }

  handleDeleteCategory (section, groupId, categoryId) {
    const category = this.findCategory(section, groupId, categoryId)

    const options = {
      title: 'Delete category',
      description: <p>Are you sure you want to delete category "{category.name}"?</p>
    }

    this.refs.confirm.show(options).then(ok => {
      if (ok) {
        this.props.dispatch(deleteCategory(section, groupId, categoryId))
      }
    })
  }

  findGroup (section, groupId) {
    return this.props
        .data[section]
        .find(g => g.id === groupId)
  }

  findCategory (section, groupId, categoryId) {
    return this.findGroup(section, groupId)
        .categories
        .find(c => c.id === categoryId)
  }

}

Inputs = connect((state, ownProps) => {
  return {
    data: state.doc.data
  }
})(Inputs)

function trim (str) {
  return str.trim()
}

function comingYears (count = 5) {
  const years = []
  let year = new Date().getFullYear()

  for (let i = 0; i < count; i++) {
    years.push(year + i)
  }

  return years
}

export default Inputs
