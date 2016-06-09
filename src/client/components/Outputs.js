import React, { Component } from 'react'

import { cloneDeep } from 'lodash'

import {Card, CardText} from 'material-ui/Card'
import {Tabs, Tab} from 'material-ui/Tabs'

import ProfitAndLoss from './ProfitAndLoss'
import BalanceSheet from './BalanceSheet'
import Cashflow from './Cashflow'

const styles = {
  container: {
    width: '100%',
    display: 'inline-flex'
  },
  cardText: {
    padding: 0
  },
  inkBar: {
    height: 6,
    marginTop: -6
  },
  tabContents: {
    padding: 16,
    paddingBottom: 50,
    overflow: 'auto'
  }
}

export default class Outputs extends Component {
  render () {
    return <div style={styles.container} >
      <Card className="card">
        <CardText style={styles.cardText}>
          <Tabs inkBarStyle={styles.inkBar} contentContainerStyle={styles.tabContents}>
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
