import React, { Component } from 'react'

import TextField from 'material-ui/lib/text-field'
import List from 'material-ui/lib/lists/list'
import ListItem from 'material-ui/lib/lists/list-item'

const styles = {
  button: {
    width: '100%'
  },
  container: {
    margin: '0 30px'
  }
}

class Parameters extends Component {

  render () {
    return <div>
      <List>
        <ListItem
            primaryText="General"
            initiallyOpen={true}
            primaryTogglesNestedList={true}
            nestedItems={[ this.renderGeneralParameters() ]} />
        <ListItem
            primaryText="Interest"
            initiallyOpen={false}
            primaryTogglesNestedList={true}
            nestedItems={[ this.renderInterestParameters() ]} />
        <ListItem
            primaryText="Tax"
            initiallyOpen={false}
            primaryTogglesNestedList={true}
            nestedItems={[ this.renderTaxParameters() ]} />
        <ListItem
            primaryText="Working capital"
            initiallyOpen={false}
            primaryTogglesNestedList={true}
            nestedItems={[ this.renderWorkingCapitalParameters() ]} />
        <ListItem
            primaryText="Provisions"
            initiallyOpen={false}K
            primaryTogglesNestedList={true}
            nestedItems={[ this.renderProvisionsParameters() ]} />
      </List>
    </div>
  }

  renderGeneralParameters () {
    return <div key="general" style={styles.container}>
      { this.renderParameter({ parameter: 'startingYear', text: 'Starting year', hint: 'yyyy' }) }
      { this.renderParameter({ parameter: 'numberOfYears', text: 'Number of years', hint: '5' }) }
      { this.renderParameter({ parameter: 'startingCapital', text: 'Starting capital', hint: '10k' }) }
    </div>
  }

  renderInterestParameters () {
    return <div key="interest" style={styles.container}>
      { this.renderParameter({ parameter: 'interestPayableOnOverdraft', text: 'Interest payable on overdraft (%/year)', hint: 'percentage per year' }) }
      { this.renderParameter({ parameter: 'interestPayableOnLoans', text: 'Interest payable on loans (%/year)', hint: 'percentage per year' }) }
      { this.renderParameter({ parameter: 'interestReceivableOnCredit', text: 'Interest receivable on credit (%/year)', hint: 'percentage per year' }) }
    </div>
  }

  renderTaxParameters () {
    return <div key="interest" style={styles.container}>
      { this.renderParameter({ parameter: 'VATRate', text: 'VAT rate (%)', hint: 'percentage' }) }
      { this.renderParameter({ parameter: 'VATPaidAfter', text: 'VAT paid after (months)', hint: 'number of months' }) }
      { this.renderParameter({ parameter: 'corporateTaxRate', text: 'Corporate tax rate (%)', hint: 'percentage' }) }
      { this.renderParameter({ parameter: 'corporateTaxPaidAfter', text: 'Corporate tax paid after (months)', hint: 'number of months' }) }
      { this.renderParameter({ parameter: 'incomeTaxPaidAfter', text: 'Income tax paid after (months)', hint: 'number of months'  }) }
      { this.renderParameter({ parameter: 'socialSecurityContributionsPaidAfter', text: 'Social security contributions paid after (months)', hint: 'number of months' }) }
    </div>
  }

  renderWorkingCapitalParameters () {
    return <div key="workingCapital" style={styles.container}>
      { this.renderParameter({ parameter: 'daysInStockOfInventory', text: 'Days in stock of inventory (sold after)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysAccountsReceivablesOutstanding', text: 'Days accounts receivables outstanding (received after)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysPrepaymentOfExpenditure', text: 'Days prepayment of expenditure (goods received)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysAccrualOfIncomeInvoice', text: 'Days accrual of income invoice (invoice sent after)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysAccountsPayableOutstanding', text: 'Days accounts payable outstanding (invoice paid after)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysAccrualOfCost', text: 'Days accrual of cost (invoice received)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysDeferredIncome', text: 'Days deferred income (service delivered)', hint: 'number of days' }) }
    </div>
  }

  renderProvisionsParameters () {
    return <div key="provisions" style={styles.container}>
      { this.renderParameter({ parameter: 'monthOfHolidayPayment', text: 'Month of holiday payment (number)', hint: 'number of month' }) }
    </div>
  }

  renderParameter ({parameter, text, hint}) {
    return <TextField
        key={parameter}
        value={this.props.parameters[parameter]}
        floatingLabelText={text}
        hintText={hint}
        style={styles.button}
        onChange={(event) => this.props.onChange(parameter, event.target.value)} />
  }

  shouldComponentUpdate (nextProps, nextState) {
    return this.props.parameters !== nextProps.parameters
  }

}

export default Parameters
