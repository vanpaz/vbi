import React, { Component } from 'react'
import debugFactory from 'debug/browser'

import TextField from 'material-ui/lib/text-field'

const debug = debugFactory('vbi:parameters')

const style = {
  button: {
    width: '100%'
  }
}

class Parameters extends Component {
  render () {
    return <div>
      <h1>General</h1>

      { this.renderParameter({ parameter: 'startingYear', text: 'Starting year', hint: 'yyyy' }) }
      { this.renderParameter({ parameter: 'numberOfYears', text: 'Number of years', hint: '5' }) }
      { this.renderParameter({ parameter: 'startingCapital', text: 'Starting capital', hint: '10k' }) }
      { this.renderParameter({ parameter: 'VATRate', text: 'VAT rate (%)', hint: 'percentage' }) }
      { this.renderParameter({ parameter: 'corporateTaxRate', text: 'Corporate tax rate (%)', hint: 'percentage' }) }

      <h1>Interest</h1>

      { this.renderParameter({ parameter: 'interestPayableOnOverdraft', text: 'Interest payable on overdraft (%/year)', hint: 'percentage per year' }) }
      { this.renderParameter({ parameter: 'interestPayableOnLoans', text: 'Interest payable on loans (%/year)', hint: 'percentage per year' }) }
      { this.renderParameter({ parameter: 'interestReceivableOnCredit', text: 'Interest receivable on credit (%/year)', hint: 'percentage per year' }) }

      <h1>Tax</h1>

      { this.renderParameter({ parameter: 'VATPaidAfter', text: 'VAT paid after (months)', hint: 'number of months' }) }
      { this.renderParameter({ parameter: 'corporateTaxPaidAfter', text: 'Corporate tax paid after (months)', hint: 'number of months' }) }
      { this.renderParameter({ parameter: 'incomeTaxPaidAfter', text: 'Income tax paid after (months)', hint: 'number of months'  }) }
      { this.renderParameter({ parameter: 'socialSecurityContributionsPaidAfter', text: 'Social security contributions paid after (months)', hint: 'number of months' }) }

      <h1>Working capital</h1>

      { this.renderParameter({ parameter: 'daysInStockOfInventory', text: 'Days in stock of inventory (sold after)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysAccountsReceivablesOutstanding', text: 'Days accounts receivables outstanding (received after)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysPrepaymentOfExpenditure', text: 'Days prepayment of expenditure (goods received)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysAccrualOfIncomeInvoice', text: 'Days accrual of income invoice (invoice sent after)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysAccountsPayableOutstanding', text: 'Days accounts payable outstanding (invoice paid after)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysAccrualOfCost', text: 'Days accrual of cost (invoice received)', hint: 'number of days' }) }
      { this.renderParameter({ parameter: 'daysDeferredIncome', text: 'Days deferred income (service delivered)', hint: 'number of days' }) }

      <h1>Provisions</h1>

      { this.renderParameter({ parameter: 'monthOfHolidayPayment', text: 'Month of holiday payment', hint: 'number of month' }) }

    </div>
  }

  renderParameter ({parameter, text, hint}) {
    return <div>
      <TextField
        value={this.props.parameters[parameter]}
        floatingLabelText={text}
        hintText={hint}
        style={style.button}
        onChange={(event) => this.props.onChange(parameter, event.target.value)} />
    </div>
  }
}

export default Parameters
