import React, { Component } from 'react'

import { cloneDeep } from 'lodash'

import Card from 'material-ui/lib/card/card'
import CardText from 'material-ui/lib/card/card-text'
import Tabs from 'material-ui/lib/tabs/tabs'
import Tab from 'material-ui/lib/tabs/tab'

import ProfitAndLoss from './ProfitAndLoss'
import BalanceSheet from './BalanceSheet'
import Cashflow from './Cashflow'

export default class Outputs extends Component {
  render () {
    return <div style={{width: '100%', display: 'inline-flex'}}>
      <Card className="card">
        <CardText>
          <Tabs inkBarStyle={{height: 4, marginTop: -4}}>
            <Tab label="Profit & Loss">
              <ProfitAndLoss data={this.props.data} />
            </Tab>
            <Tab label="Balance sheet">
              <BalanceSheet data={this.props.data} />
            </Tab>
            <Tab label="Cashflow">
              <Cashflow data={this.props.data} />
            </Tab>
          </Tabs>
        </CardText>
      </Card>
    </div>
  }

}
