import React, { Component } from 'react';
import debugFactory from 'debug/browser';

import { getCategories, getPeriods, findQuantity } from './utils';

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
    let categories = getCategories(items);
    let periods = getPeriods(items);

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
    let categories = getCategories(items);
    let periods = getPeriods(items);

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
            <th className="main" colSpan={periods.length}>Quantity</th>
            <th className="main" colSpan={2}>Price</th>
          </tr>
          <tr>
            <th />
            {periods.map(period => <th key={period}>{period}</th>)}
            <th>Price</th>
            <th>Change</th>
          </tr>
          {
            items.map(item => <tr key={category + ':' + item.name}>
              <td className="read-only">{item.name}</td>
              {
                periods.map(period => (<td key={period} className="quantity">
                  <input value={findQuantity(item, period).quantity}
                         onFocus={(event) => event.target.select()} />
                </td>))
              }
              <td className="price">
                <input value={item.prices[0].price.split(' ')[0]} 
                       onFocus={(event) => event.target.select()} />
              </td>
              <td className="price">
                <input value={item.prices[0].change} 
                       onFocus={(event) => event.target.select()} />
              </td>
            </tr>)
          }
        </tbody>
      </table>
    </div>
  }
}