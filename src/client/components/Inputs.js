import React, { Component } from 'react';
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


import { findGroup, findCategory, findQuantity, clearIfZero } from './../js/formulas';
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

// TODO: refactor Inputs, split renderGroup into a separate component

export default class Inputs extends Component {
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
    </div>
  }

  renderSection (section, priceTypes) {
    const periods = this.props.data.parameters.periods;
    const groups = this.props.data[section];

    return <div>
      {
        groups && groups.map(group => this.renderGroup('costs', group, periods, priceTypes))
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

  renderGroup (section, group, periods, priceTypes) {
    const revenueCategories = this.props.data.revenues.map(g => g.name);

    return <div key={group.name}>
      <h1>{this.renderGroupActionMenu(section, group.name)}</h1>

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
                           let quantity = event.target.value;
                           this.updateQuantity(section, group.name, item.name, period, quantity);
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
                         this.updatePrice(section, group.name, item.name, price);
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
          onTouchTap={event => this.props.onEditPeriods()}
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
          onTouchTap={(event) => this.removeGroup(section, group)}
          style={{width: 24, height: 24, padding: 0}}>
        <ClearIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>
        // TODO: add buttons to move up/down
    ];

    return <ActionMenu actions={periodActions}>
      {group}
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
          onTouchTap={(event) => this.removeCategory(section, group, category)}
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
   * Update the price of one entry
   * @param {'costs' | 'revenues'} section
   * @param {string} group
   * @param {string} category
   * @param {{value: string, change: string}} price
   */
  updatePrice (section, group, category, price) {
    debug('updatePrice', section, group, category, price);

    const data = cloneDeep(this.props.data);
    const item = findCategory(data, section, group, category);
    if (item) {
      item.price = price;
    }
    else {
      // TODO: handle adding a new item
    }

    // emit a change event
    this.props.onChange(data);
  }

  /**
   * Update a quantity in one entry
   * @param {string} section
   * @param {string} group
   * @param {string} category
   * @param {string} period
   * @param {string} quantity
   */
  updateQuantity (section, group, category, period, quantity) {
    debug('updateQuantity', section, group, category, period, quantity);

    const data = cloneDeep(this.props.data);
    const item = findCategory(data, section, group, category);
    if (item) {
      // replace the quantity with the new value
      item.quantities[period] = quantity;
    }
    else {
      // TODO: handle adding a new item
    }

    // emit a change event
    this.props.onChange(data);
  }

  removeCategory(section, group, category) {
    debug('removeCategory', section, group, category);

    // TODO: ask confirmation before deleting the category

    const data = cloneDeep(this.props.data);
    const g = findGroup(data, section, group);
    if (g && g.categories) {
      const index = g.categories.findIndex(item => item.name === category);
      if (index !== -1) {
        g.categories.splice(index, 1);

        // emit a change event
        this.props.onChange(data);
      }
    }
  }

  removeGroup(section, group) {
    debug('removeGroup', section, group);

    // TODO: ask confirmation before deleting the group

    const data = cloneDeep(this.props.data);
    const groups = data[section];
    if (groups) {
      const index = groups.findIndex(g => g.name === group);
      if (index !== -1) {
        groups.splice(index, 1);

        // emit a change event
        this.props.onChange(data);
      }
    }
  }

}
