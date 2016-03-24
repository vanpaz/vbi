import React, { Component } from 'react';
import debugFactory from 'debug/browser';

import Card from 'material-ui/lib/card/card';
import CardTitle from 'material-ui/lib/card/card-title';
import CardText from 'material-ui/lib/card/card-text';

import { getPeriods, calculateCategoryTotals, calculateTotals } from './utils';

const debug = debugFactory('vbi:profit-loss');

export default class ProfitAndLoss extends Component {
  render () {
    return <Card className="card">
      <CardTitle title="Profit and Loss" subtitle="Calculate profit and loss based on provided costs and revenues" />
      <CardText>

        <h1>costs</h1>
        {ProfitAndLoss.renderTotals(this.props.data.costs)}

        <h1>revenues</h1>
        {ProfitAndLoss.renderTotals(this.props.data.revenues)}

      </CardText>
    </Card>;
  }

  static renderTotals (items) {
    let periods = getPeriods(items);
    let categoryTotals = calculateCategoryTotals(items);
    let totals = calculateTotals(categoryTotals);

    debug ('categoryTotals', categoryTotals);
    debug ('totals', totals);

    return <table>
      <tbody>
      <tr>
        <th />
        {periods.map(period => <th key={period}>{period}</th>)}
      </tr>
      {
        categoryTotals.map(entry => <tr key={entry.category}>
          <td className="read-only">{entry.category}</td>
          {
            Object.keys(entry.totals).map(period => {
              return <td key={period} className="read-only">{entry.totals[period].toFixed()}</td>
            })
          }
        </tr>)
      }
      <tr>
        <td className="read-only total">total</td>
        {
          Object.keys(totals).map(period => <td key={period} className="read-only total">{totals[period].toFixed()}</td>)
        }
      </tr>
      </tbody>
    </table>
  }

}