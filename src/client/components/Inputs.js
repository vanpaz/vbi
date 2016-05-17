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
import { deleteCategory, deleteGroup, setPeriods, setQuantity, setPrice } from '../actions'
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
    </div>
  }

  renderSection (section, priceTypes) {
    const periods = this.props.data.parameters.periods;
    const group = this.props.data[section];

    return <div>
      {
        group && group.map((group, groupIndex) => this.renderGroup(section, group, groupIndex, periods, priceTypes))
      }
      <p>
        <button className="add-group" title="Add a new group" onTouchTap={
            // TODO: implement action
            (event) => alert('not yet implemented')
        }>
          +
        </button>
      </p>
    </div>
  }

  renderGroup (section, group, groupIndex, periods, priceTypes) {
    const revenueCategories = this.props.data.revenues.map(g => g.name);

    return <div key={group.name}>
      <h1>{this.renderGroupActionMenu(section, group.name, groupIndex)}</h1>

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
            group.categories && group.categories.map(item => <tr key={group.name + ':' + item.name}>
              <td className="read-only">{
                this.renderCategoryActionMenu(section, group.name, item.name)
              }</td>
              {
                periods.map(period => (<td key={period} className="quantity">
                  <input className="quantity"
                         value={clearIfZero(findQuantity(item, period))}
                         onChange={(event) => {
                           const quantity = event.target.value;
                           this.props.dispatch(setQuantity(section, group.name, item.name, period, quantity));
                         }}
                         onFocus={(event) => event.target.select()} />
                </td>))
              }
              <td>
                <Price price={item.price}
                       categories={revenueCategories}
                       periods={periods}
                       priceTypes={priceTypes}
                       onChange={(price) => {
                         this.props.dispatch(setPrice (section, group.name, item.name, price))
                       }} />
              </td>
            </tr>)
          }
        <tr>
          <td className="read-only">
            <button className="add-category" title="Add a new category" onTouchTap={
              // TODO: implement action
              (event) => alert('not yet implemented')
            }>
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

  renderGroupActionMenu (section, name, groupIndex) {
    // TODO: implement actions for GroupActionMenu

    let periodActions = [
      <IconButton
          key="rename"
          title="Rename group"
          onTouchTap={
            // TODO: implement action
            (event) => alert('not yet implemented')
          }
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
          onTouchTap={(event) => this.props.dispatch(deleteGroup(section, groupIndex))}
          style={{width: 24, height: 24, padding: 0}}>
        <ClearIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>
        // TODO: add buttons to move up/down
    ];

    return <ActionMenu actions={periodActions}>
      {name}
    </ActionMenu>
  }

  // TODO: move into a separate component
  renderCategoryActionMenu (section, group, category) {
    // TODO: implement actions for CategoryActionMenu

    let periodActions = [
      <IconButton
          key="rename"
          title="Rename category"
          onTouchTap={
            // TODO: implement action
            (event) => alert('not yet implemented')
          }
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
          onTouchTap={(event) => this.props.dispatch(deleteCategory(section, group, category))}
          style={{width: 24, height: 24, padding: 0}}>
        <ClearIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>
        // TODO: add buttons to move up/down
    ];

    return <ActionMenu actions={periodActions}>
      {category}
    </ActionMenu>
  }

  /**
   * Open a prompt where the user can enter a comma separated list with periods
   */
  handleSetPeriods () {
    const parameters = this.props.data &&
        this.props.data.parameters

    const periods = (parameters && parameters.periods)
        ? parameters.periods.join(', ')
        : ''

    const options = {
      title: 'Periods',
      description: 'Enter a comma separated list with periods:',
      hintText: comingYears().join(', '),
      value: periods
    }

    this.refs.prompt.show(options).then(newPeriods => {
      if (newPeriods !== null) {
        this.setPeriods(newPeriods)
      }
    })
  }

  /**
   * Apply a new series of periods
   * @param {string | Array.<string>} periods   A comma separated string or
   *                                            an array with strings.
   */
  setPeriods (periods) {
    debug('setPeriods', periods)

    if (Array.isArray(periods)) {
      this.props.dispatch(setPeriods(periods))
    }
    else {
      // periods is a string
      const array = periods.split(',').map(trim)
      this.setPeriods(array)
    }
  }

  handleRenameCategory (section, group, categoryIndex) {

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
