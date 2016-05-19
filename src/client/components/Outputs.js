import React, { Component } from 'react'
import debugFactory from 'debug/browser'

import { cloneDeep } from 'lodash'

import Card from 'material-ui/lib/card/card'
import CardText from 'material-ui/lib/card/card-text'
import Tabs from 'material-ui/lib/tabs/tabs'
import Tab from 'material-ui/lib/tabs/tab'

import ProfitAndLoss from './ProfitAndLoss'


const debug = debugFactory('vbi:outputs')

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
              <p>(not yet implemented...)</p>
            </Tab>
            <Tab label="Cashflow">
              <p>(not yet implemented...)</p>
            </Tab>
          </Tabs>
        </CardText>
      </Card>
    </div>
  }

}
