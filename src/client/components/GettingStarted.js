import React, { Component } from 'react'

import Card from 'material-ui/lib/card/card'
import CardText from 'material-ui/lib/card/card-text'
import RaisedButton from 'material-ui/lib/raised-button'

import DashboardIcon from 'material-ui/lib/svg-icons/action/dashboard'
import TimelineIcon from 'material-ui/lib/svg-icons/action/timeline'

import bindMethods from '../utils/bindMethods'

const styles = {
  cardText: {
    padding: '16px 48px 48px 48px'
  },
  centered: {
    textAlign: 'center'
  }
}

export default class GettingStarted extends Component {
  constructor (props) {
    super(props)

    bindMethods(this)
  }

  render () {
    return <div className="getting-started">
      <Card className="card">
        <CardText style={styles.cardText}>
          <h1>Introduction</h1>
          <p>
            VBI is a business intelligence tool aimed at startups and small companies who want to get a grip on their business model and financials.
          </p>

          <h1>Getting started</h1>
          <p>
            The first step is to fill in a <a href="https://www.wikiwand.com/en/Business_Model_Canvas" target="_blank">business model canvas</a> to get a clear view on what your company does, for who, and how. This will give you a high level overview of your company. Filling out a business model canvas will likely spark discussion on what the core value of your business is and how you want to achieve your goals. That's a good thing.
          </p>

          <RaisedButton
              label="Model"
              icon={<DashboardIcon />}
              secondary={true}
              onTouchTap={this.viewModel} />

          <p>
            Once you have a clear idea about the place of your company in the market, it's time to start making things more concrete by attaching quantities and prices to all categories of costs and revenues relevant for your company. Don't be overwhelmed by the amount of options, just start simple and refine your categories when needed.
          </p>

          <RaisedButton
              label="Finance"
              icon={<TimelineIcon/>}
              secondary={true}
              onTouchTap={this.viewFinance} />

          <p>
            From the costs and revenues, VBI will generate three financial reports: profit and loss, balance sheet, and cashflow. These reports show whether you're plan is financially sound. Just play around with prices and quantities to see what the effects are on your finance. See whether you need external investment and when your company will start making profit.
          </p>

          <h1>About</h1>
          <p>
            VBI is developed by <a href="http://vanpaz.com" target="_blank">VanPaz</a>, a company bridging research and market. VanPaz makes sure that ideas become sound technology and that the technology becomes a product. The company combines strong expertise in business and finance with cutting-edge knowledge in R&D.
          </p>

          <h1>Questions?</h1>
          <p>
            If you have any questions or need advice, please don't hesitate to contact VanPaz. We're happy to help you! Just send an email to <a href="email:info@vanpaz.com">info@vanpaz.com</a> or fill out the contact form on the <a href="http://vanpaz.com" target="_blank">website</a>.
          </p>

          <p style={styles.centered}>
            <a href="http://vanpaz.com" target="_blank"><img src="images/vanpaz_logo_transparent.png" width="250" height="78.5" /></a>
          </p>

        </CardText>
      </Card>
    </div>
  }

  viewModel () {
    this.props.onSetPage('model')
  }

  viewFinance () {
    this.props.onSetPage('finance')
  }
}
