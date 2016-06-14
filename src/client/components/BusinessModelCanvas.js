import React, { Component } from 'react'

import Card from 'material-ui/lib/card/card'
import CardText from 'material-ui/lib/card/card-text'
import Tabs from 'material-ui/lib/tabs/tabs'
import Tab from 'material-ui/lib/tabs/tab'

import { getOptionalProp } from '../utils/object'

import * as bmcCategories from '../data/bmcCategories.json'
import * as bmcDefaults  from'../data/bmcDefaults.json'

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

export default class BusinessModelCanvas extends Component {
  render () {
    const { bmc, onSetProperty } = this.props

    const onChangeType = event => {
      onSetProperty(['bmc', 'description', 'type'], event.target.value)
    }
    const onChangeProducts = event => {
      onSetProperty(['bmc', 'description', 'products'], event.target.value)
    }
    const onChangeCustomers = event => {
      onSetProperty(['bmc', 'description', 'customers'], event.target.value)
    }
    const onChangeUniqueSellingPoint = event => {
      onSetProperty(['bmc', 'description', 'uniqueSellingPoint'], event.target.value)
    }

    return <div style={styles.container} >
      <Card className="card">
        <CardText style={styles.cardText}>
          <Tabs inkBarStyle={styles.inkBar} contentContainerStyle={styles.tabContents}>
            <Tab label="Business Model Canvas">
              <table className="bmc" width="100%">
                <tbody>
                  <tr>
                    <td colSpan="10">
                      <div className="outer">
                        <div className="inner main">
                          We are a <select
                            value={bmc.description && bmc.description.type}
                            onChange={onChangeType}>
                          <option value=""/>
                          {
                              bmcCategories.types.map(c => (
                                  <option key={c.id} value={c.id}>{c.text}</option>
                              ))
                          }
                        </select> company. We make <input
                            type="text"
                            placeholder="products" 
                            value={bmc.description && bmc.description.products}
                            onChange={onChangeProducts}
                        /> for <input
                            type="text"
                            placeholder="customers"
                            value={bmc.description && bmc.description.customers}
                            onChange={onChangeCustomers }
                        />  and they like us because of <input
                            type="text"
                            placeholder="unique selling point"
                            value={bmc.description && bmc.description.uniqueSellingPoint}
                            onChange={onChangeUniqueSellingPoint }
                        />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2" rowSpan="2">
                      <div className="outer height4">
                        <div className="inner">
                          <div className="header">
                            Key partners
                          </div>
                          <div className="contents">
                            { this.renderCategories('partnerships', bmc, onSetProperty) }
                            { this.renderOther('partnerships', bmc, onSetProperty) }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td colSpan="2">
                      <div className="outer height2">
                        <div className="inner">
                          <div className="header">
                            Key activities
                          </div>
                          <div className="contents">
                            { this.renderCategories('activities', bmc, onSetProperty) }
                            { this.renderOther('activities', bmc, onSetProperty) }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td colSpan="2" rowSpan="2">
                      <div className="outer height4">
                        <div className="inner">
                          <div className="header">
                            Value propositions
                          </div>
                          <div className="contents">
                            { this.renderOther('valuePropositions', bmc, onSetProperty) }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td colSpan="2">
                      <div className="outer height2">
                        <div className="inner">
                          <div className="header">
                            Customer relations
                          </div>
                          <div className="contents">
                            { this.renderCategories('contacts', bmc, onSetProperty) }
                            { this.renderOther('contacts', bmc, onSetProperty) }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td colSpan="2" rowSpan="2">
                      <div className="outer height4">
                        <div className="inner">
                          <div className="header">
                            Customer segments
                          </div>
                          <div className="contents">
                            { this.renderCategories('customerSegments', bmc, onSetProperty) }
                            { this.renderOther('customerSegments', bmc, onSetProperty) }
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <div className="outer height2">
                        <div className="inner">
                          <div className="header">
                            Key resources
                          </div>
                          <div className="contents">
                            <b>Resources</b>
                            { this.renderCategories('resources', bmc, onSetProperty) }
                            <br />
                            <b>Investments</b>
                            { this.renderCategories('investments', bmc, onSetProperty) }
                            { this.renderOther('investments', bmc, onSetProperty) }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td colSpan="2">
                      <div className="outer height2">
                        <div className="inner">
                          <div className="header">
                            Channels
                          </div>
                          <div className="contents">
                            { this.renderCategories('channels', bmc, onSetProperty) }
                            { this.renderOther('channels', bmc, onSetProperty) }
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="5">
                      <div className="outer height1">
                        <div className="inner">
                          <div className="header">
                            Cost structure
                          </div>
                        </div>
                      </div>
                    </td>
                    <td colSpan="5">
                      <div className="outer height1">
                        <div className="inner">
                          <div className="header">
                            Revenue streams
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

            </Tab>
          </Tabs>

        </CardText>
      </Card>
    </div>
  }

  renderCategories (category, bmc, onSetProperty) {
    return bmcCategories[category].map(entry => {

      let checked = getOptionalProp(bmc, [category, 'values', entry.id, 'value'])
      if (typeof checked !== 'boolean') {
        checked = getOptionalProp(bmcDefaults, [bmc.description.type, category, 'values', entry.id, 'value'])
        if (typeof checked !== 'boolean') {
          checked = false
        }
      }

      const props = {
        type: 'checkbox',

        checked,

        onChange: (event) => {
          const newValue = {
            value: event.target.checked,
            isDefault: false
          }
          onSetProperty(['bmc', category, 'values', entry.id], newValue)
        }
      }

      return <div key={entry.id}>
        <label>
          <input {...props} /> {entry.text}
        </label>
      </div>
    })
  }

  renderOther (category, bmc, onSetProperty) {
    const value = bmc[category] && bmc[category].other || ''

    const onChange = (event) => {
      onSetProperty(['bmc', category, 'other'], event.target.value)
    }

    return <div className="textarea-container">
      <textarea placeholder="other" rows="2" value={value} onChange={onChange} />
    </div>
  }
}
