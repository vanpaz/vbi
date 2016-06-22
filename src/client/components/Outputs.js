import React, { Component } from 'react'

import Card from 'material-ui/lib/card/card'
import CardText from 'material-ui/lib/card/card-text'
import Tabs from 'material-ui/lib/tabs/tabs'
import Tab from 'material-ui/lib/tabs/tab'

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
          <Tabs
              value={this.props.tab}
              onChange={tab => {
                if (typeof tab === 'string') { // filter events triggered by input fields in the tabs
                  this.props.onChangeTab(tab)
                }
              }}
              inkBarStyle={styles.inkBar}
              contentContainerStyle={styles.tabContents}>
            <Tab value="profitAndLoss" label="Profit & Loss">
              <ProfitAndLoss data={this.props.data} />
            </Tab>
            <Tab value="balanceSheet" label="Balance sheet">
              <BalanceSheet data={this.props.data} />
            </Tab>
            <Tab value="cashFlow" label="Cashflow">
              <Cashflow data={this.props.data} />
            </Tab>
          </Tabs>
        </CardText>
      </Card>
    </div>
  }

}
