import React, { Component } from 'react';
import debugFactory from 'debug/browser';

import { cloneDeep } from 'lodash';
import { getCategories, findQuantity, clearIfZero } from './formulas';
import Price from './Price';

import Card from 'material-ui/lib/card/card';
import CardText from 'material-ui/lib/card/card-text';
import Tabs from 'material-ui/lib/tabs/tabs';
import Tab from 'material-ui/lib/tabs/tab';

const debug = debugFactory('vbi:inputs');

export default class Inputs extends Component {
  render () {
    return <div style={{width: '100%', display: 'inline-flex'}}>
      <Card className="card">
        <CardText>
          <Tabs inkBarStyle={{height: 4, marginTop: -4}}>
            <Tab label="Costs">
              {this.renderCosts()}
            </Tab>
            <Tab label="Investments">
              <p>(not yet implemented...)</p>
            </Tab>
            <Tab label="Revenues">
              {this.renderRevenues()}
            </Tab>
          </Tabs>
        </CardText>
      </Card>
    </div>
  }

  renderCosts () {
    let periods = this.props.data.parameters.periods;
    let items = this.props.data.costs;
    let categories = getCategories(items);

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
    let periods = this.props.data.parameters.periods;
    let items = this.props.data.revenues;
    let categories = getCategories(items);

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
    let revenueCategories = getCategories(this.props.data.revenues);

    return <div key={category}>
      <h1>{category}</h1>

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
            {periods.map(period => <th key={period}>{period}</th>)}
            <th />
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
                <Price price={item.price}
                       categories={revenueCategories}
                       periods={periods}
                       onChange={(price) => {
                         this.updatePrice(section, category, item.name, price);
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
   * @param {{value: string, change: string}} price
   */
  updatePrice (section, category, name, price) {
    debug('updatePrice', section, category, name, price);

    let data = cloneDeep(this.props.data);
    let item = data[section].find(item => item.category === category && item.name === name);
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
