import React, { Component } from 'react';
import debugFactory from 'debug/browser';

import { cloneDeep } from 'lodash';
import { getCategories, getPeriods, findQuantity, clearIfZero } from './utils';
import Price from './Price';

import Card from 'material-ui/lib/card/card';
import CardTitle from 'material-ui/lib/card/card-title';
import CardText from 'material-ui/lib/card/card-text';

const debug = debugFactory('vbi:input-form');

export default class InputForm extends Component {
  render () {
    return <div style={{width: '100%'}}>
      <Card className="card costs">
        <CardTitle title="Costs" subtitle="Enter prices and quantities of your costs" />
        <CardText>
          {this.renderCosts()}
        </CardText>
      </Card>
      <Card className="card revenues">
        <CardTitle title="Revenues" subtitle="Enter prices and quantities of your revenues" />
        <CardText>
          {this.renderRevenues()}
        </CardText>
      </Card>
    </div>
  }

  renderCosts () {
    let items = this.props.data.costs;
    let categories = getCategories(items);
    let periods = getPeriods(items);

    debug('costs categories', categories);
    debug('costs periods', periods);

    return <div>
      {
        categories.map(category => {
          let filteredItems = items.filter(item => item.category === category);
          return this.renderCategory('costs', category, periods, filteredItems);
        })
      }
    </div>
  }

  renderRevenues () {
    let items = this.props.data.revenues;
    let categories = getCategories(items);
    let periods = getPeriods(items);

    debug('revenues categories', categories);
    debug('revenues periods', periods);

    return <div>
      {
        categories.map(category => {
          let filteredItems = items.filter(item => item.category === category);
          return this.renderCategory('revenues', category, periods, filteredItems);
        })
      }
    </div>
  }

  renderCategory (section, category, periods, items) {
    return <div key={category}>
      <h1>{category}</h1>

      <table>
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
            {periods.map(period => <th key={period}>{period}</th>)}
            <th></th>
          </tr>
          {
            items.map(item => <tr key={category + ':' + item.name}>
              <td className="read-only">{item.name}</td>
              {
                periods.map(period => (<td key={period} className="quantity">
                  <input value={clearIfZero(findQuantity(item, period))}
                         onChange={(event) => {
                           let quantity = event.target.value;
                           this.updateQuantity(section, category, item.name, period, quantity);
                         }}
                         onFocus={(event) => event.target.select()} />
                </td>))
              }
              <td>
                <Price entry={item.prices[0]}
                       onChange={(entry) => {
                         this.updatePrice(section, category, item.name, entry);
                       }} />
              </td>
            </tr>)
          }
        </tbody>
      </table>
    </div>
  }

  /**
   * Update the price of one entry
   * @param {'costs' | 'revenues'} section
   * @param {string} category
   * @param {string} name
   * @param {{price: string, change: string}} entry
   */
  updatePrice (section, category, name, entry) {
    debug('updatePrice', section, category, name, entry);

    let data = cloneDeep(this.props.data);
    let item = data[section].find(item => item.category === category && item.name === name);
    if (item) {
      item.prices[0] = entry;
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
   * @param {string} name
   * @param {string} category
   * @param {string} period
   * @param {string} quantity
   */
  updateQuantity (section, category, name, period, quantity) {
    debug('updateQuantity', section, category, name, period, quantity);

    let data = cloneDeep(this.props.data);
    let item = data[section].find(item => item.category === category && item.name === name);
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

}
