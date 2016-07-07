import React, { Component } from 'react'

import List from 'material-ui/lib/lists/list'
import ListItem from 'material-ui/lib/lists/list-item'

import DebouncedTextField from './controls/DebouncedTextField'
import shouldComponentUpdate from '../utils/shouldComponentUpdate'

const styles = {
  button: {
    width: 400,
    maxWidth: '100%',
    display: 'block'
  },
  container: {
    margin: '0 30px'
  }
}

class Parameters extends Component {
  constructor (props) {
    super(props)

    // update only when props or state are change
    this.shouldComponentUpdate = shouldComponentUpdate
  }

  render () {
    return <div>
      <List>
        <ListItem
            primaryText="General"
            initiallyOpen={true}
            primaryTogglesNestedList={true}
            nestedItems={[ this.renderGeneralParameters() ]} />
        <ListItem
            primaryText="Tax and social security contributions"
            initiallyOpen={false}
            primaryTogglesNestedList={true}
            nestedItems={[ this.renderTaxParameters() ]} />
        <ListItem
            primaryText="Interest"
            initiallyOpen={false}
            primaryTogglesNestedList={true}
            nestedItems={[ this.renderInterestParameters() ]} />
        <ListItem
            primaryText="Working capital"
            initiallyOpen={false}
            primaryTogglesNestedList={true}
            nestedItems={[ this.renderWorkingCapitalParameters() ]} />
        <ListItem
            primaryText="Provisions"
            initiallyOpen={false}
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
      { this.renderParameter({ parameter: 'currency', text: 'Currency', hint: '\u20ac' }) }
      { this.renderParameter({ parameter: 'currencyMagnitude', text: 'Currency magnitude (display in output sheets)', hint: '1000' }) }
      { this.renderParameter({ parameter: 'numberOfDecimals', text: 'Number of decimals (display in output sheets)', hint: '0' }) }
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
      { this.renderParameter({ parameter: 'corporateTaxRate', text: 'Corporate tax rate (%)', hint: 'percentage' }) }
      { this.renderParameter({ parameter: 'incomeTax', text: 'Income tax rate (%)', hint: 'percentage' }) }
      { this.renderParameter({ parameter: 'SSCEmployer', text: 'Social security contributions employee (%)', hint: 'percentage' }) }
      { this.renderParameter({ parameter: 'SSCEmployee', text: 'Social security contributions employer (%)', hint: 'percentage' }) }
    </div>
  }

  renderWorkingCapitalParameters () {
    return <div key="workingCapital" style={styles.container}>
      { this.renderParameter({ parameter: 'daysInStockOfInventory', text: 'Days in stock of inventory (sold after)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysAccountsReceivablesOutstanding', text: 'Days accounts receivables outstanding (received after)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysPrepaymentOfExpenditure', text: 'Days prepayment of expenditure (goods received)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysAccrualOfIncome', text: 'Days accrual of income (invoice sent after)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysAccountsPayableOutstanding', text: 'Days accounts payable outstanding (invoice paid after)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysAccrualOfCost', text: 'Days accrual of cost (invoice received)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysDeferredIncome', text: 'Days deferred income (service delivered)', hint: 'number of days' }) }

      { this.renderParameter({ parameter: 'monthsCorporateTaxPaidAfter', text: 'Months corporate tax paid after', hint: 'number of months' }) }
      { this.renderParameter({ parameter: 'monthsVATPaidAfter', text: 'Months VAT paid after', hint: 'number of months' }) }
      { this.renderParameter({ parameter: 'monthsIncomeTaxPaidAfter', text: 'Months income tax paid after', hint: 'number of months'  }) }
      { this.renderParameter({ parameter: 'monthsSSCPaidAfter', text: 'Months social security contributions paid after', hint: 'number of months' }) }
    </div>
  }

  renderProvisionsParameters () {
    return <div key="provisions" style={styles.container}>
      { this.renderParameter({ parameter: 'holidayProvision', text: 'Holiday provision (%)', hint: 'percentage' }) }
      { this.renderParameter({ parameter: 'monthOfHolidayPayment', text: 'Month of holiday payment (number)', hint: 'number of month' }) }
    </div>
  }

  renderParameter ({parameter, text, hint}) {
    const onChange = (value) => this.props.onChange(parameter, value)

    return <DebouncedTextField
        key={parameter}
        value={this.props.parameters[parameter]}
        floatingLabelText={text}
        hintText={hint}
        style={styles.button}
        onChange={onChange} />
  }

}

export default Parameters
