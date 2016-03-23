import React, { Component } from 'react';
import debugFactory from 'debug/browser';

import { uniq, flatMap } from 'lodash';

import Card from 'material-ui/lib/card/card';
import CardTitle from 'material-ui/lib/card/card-title';
import CardText from 'material-ui/lib/card/card-text';

const debug = debugFactory('vbi:inputform');

export default class InputForm extends Component {
  render () {
    return <div style={{width: '100%'}}>
      <Card className="card costs">
        <CardTitle title="Costs" subtitle="Specify prices and quantities of your costs" />
        <CardText>
          {InputForm.renderCosts(this.props.data.costs)}
        </CardText>
      </Card>
      <Card className="card revenues">
        <CardTitle title="Revenues" subtitle="Specify prices and quantities of your revenues" />
        <CardText>
          {InputForm.renderRevenues(this.props.data.revenues)}
        </CardText>
      </Card>
    </div>
  }

  static renderCosts (items) {
    let categories = InputForm.getCategories(items);
    let periods = InputForm.getPeriods(items);

    debug('costs categories', categories);
    debug('costs periods', periods);

    return <div>
      {
        categories.map(category => {
          let filteredItems = items.filter(item => item.category === category);
          return InputForm.renderCategory(category, periods, filteredItems);
        })
      }
    </div>
  }

  static renderRevenues (items) {
    let categories = InputForm.getCategories(items);
    let periods = InputForm.getPeriods(items);

    debug('revenues categories', categories);
    debug('revenues periods', periods);

    return <div>
      {
        categories.map(category => {
          let filteredItems = items.filter(item => item.category === category);
          return InputForm.renderCategory(category, periods, filteredItems);
        })
      }
    </div>
  }

  static renderCategory (category, periods, items) {

    return <div key={category}>
      <h1>{category}</h1>

      <table>
        <colgroup>
          <col width='120px'/>
        </colgroup>
        <tbody>
          <tr>
            <th />
            <th colSpan={periods.length}>Quantity</th>
            <th colSpan={2}>Price</th>
          </tr>
          <tr>
            <th />
            {periods.map(period => <th key={period}>{period}</th>)}
            <th>Price</th>
            <th>Change</th>
          </tr>
          {
            items.map(item => <tr key={category + ':' + item.name}>
              <td>{item.name}</td>
              {
                periods.map(period => (<td key={period} className="quantity">
                  {InputForm.findQuantity(item, period)}
                </td>))
              }
              <td className="price">{
                // TODO: make item prices more flexible and robust
                item.prices[0].price.split(' ')[0]
              }</td>
              <td className="price">{
                // TODO: make item prices more flexible and robust
                item.prices[0].change
              }</td>
            </tr>)
          }
        </tbody>
      </table>
    </div>
  }

  static getCategories (items) {
    let categories = items
        .map(item => item.category)
        .filter(category => category != undefined);  // not undefined or null

    return uniq(categories).sort(); // dedupe and sort
  }

  static getPeriods(items) {
    let periods = flatMap(items, item => {
      let pricePeriods = item.prices.map(price => price.period);
      let quantityPeriods = item.quantities.map(quantity => quantity.period);

      return pricePeriods.concat(quantityPeriods).filter(period => period != undefined)
    });

    return uniq(periods).sort();
  }

  static findQuantity (item, period) {
    let entry = item.quantities && item.quantities.find(quantity => quantity.period == period);

    return entry ? entry.quantity : null;
  }
}