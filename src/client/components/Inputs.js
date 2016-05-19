import React, { Component } from 'react'
import { connect } from 'react-redux'
import debugFactory from 'debug/browser'
import { cloneDeep } from 'lodash'

import Card from 'material-ui/lib/card/card'
import CardText from 'material-ui/lib/card/card-text'
import Tabs from 'material-ui/lib/tabs/tabs'
import Tab from 'material-ui/lib/tabs/tab'
import IconButton from 'material-ui/lib/icon-button'
import EditIcon from 'material-ui/lib/svg-icons/image/edit'
import ClearIcon from 'material-ui/lib/svg-icons/content/clear'
import DownIcon from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-down'
import UpIcon from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-up'

import Prompt from './dialogs/Prompt'
import Confirm from './dialogs/Confirm'
import {
    addCategory, deleteCategory, renameCategory,
    setPeriods, setQuantity, setPrice
} from '../actions'
import { findQuantity, clearIfZero } from './../js/formulas'
import Price from './Price'
import theme from '../theme'

import ActionMenu from './ActionMenu'

const debug = debugFactory('vbi:inputs')


const styles = {
  actionButton: {
    width: 24,
    height: 24,
    padding: 0,
    display: 'inline-block'
  }
}

// TODO: refactor Inputs, split renderCategory into a separate component

class Inputs extends Component {
  render () {
    return <div style={{width: '100%', display: 'inline-flex'}}>
      <Card className="card">
        <CardText>
          <Tabs inkBarStyle={{height: 4, marginTop: -4}}>
            <Tab label="Costs">
              <h1>Direct</h1>
              {this.renderCategory('costs', 'direct', ['constant', 'manual', 'revenue'])}

              <h1>Indirect - personnel</h1>
              {this.renderCategory('costs', 'personnel', ['salary'])}

              <h1>Indirect - other</h1>
              {this.renderCategory('costs', 'indirect', ['constant', 'manual', 'revenue'])}
            </Tab>

            <Tab label="Investments">
              <h1>Tangible fixed assets</h1>
              {this.renderCategory('investments', 'tangible', ['investment'])}

              <h1>Intangible fixed assets</h1>
              {this.renderCategory('investments', 'intangible', ['investment'])}
            </Tab>

            <Tab label="Revenues">
              <h1>&nbsp;</h1>
              {this.renderCategory('revenues', 'all', ['constant', 'manual'])}
            </Tab>
          </Tabs>
        </CardText>
      </Card>

      <Prompt ref="prompt" />
      <Confirm ref="confirm" />
    </div>
  }

  renderCategory (section, group, priceTypes) {
    const periods = this.props.data.parameters.periods
    const categories = this.props.data[section][group]
    const revenueCategories = this.props.data.revenues.all

    return <table className="category-table" >
      <colgroup>
        <col width='120px'/>
      </colgroup>
      <tbody>
        <tr>
          <th />
          <th className="main" colSpan={periods.length}>Quantity</th>
          <th className="main" colSpan={1}>Price</th>
        </tr>
        <tr>
          <th />
          {
            periods.map(period => {
              return <th key={period}>
                {this.renderPeriodsActionMenu(period)}
              </th>
            })
          }
          <th />
        </tr>
        {
          categories.map(category => <tr key={category.id}>
            <td className="read-only">{
              this.renderActionMenu(section, group, category)
            }</td>
            {
              periods.map(period => (<td key={period} className="quantity">
                <input className="quantity"
                       value={clearIfZero(findQuantity(category, period))}
                       onChange={(event) => {
                         const quantity = event.target.value
                         this.props.dispatch(setQuantity(section, group, category.id, period, quantity))
                       }}
                       onFocus={(event) => event.target.select()} />
              </td>))
            }
            <td>
              <Price price={category.price}
                     categories={revenueCategories}
                     periods={periods}
                     priceTypes={priceTypes}
                     onChange={(price) => {
                       this.props.dispatch(setPrice (section, group, category.id, price))
                     }} />
            </td>
          </tr>)
        }
      <tr>
        <td className="read-only">
          <button
              className="add-category"
              title="Add a new category"
              onTouchTap={ (event) => this.handleAddCategory(section, group) }>
            +
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  }

  // TODO: move into a separate component
  renderPeriodsActionMenu (period) {
    let periodActions = [
      <IconButton
          key="edit"
          title="Edit periods"
          onTouchTap={event => this.handleSetPeriods()}
          style={{width: 24, height: 24, padding: 0}}>
        <EditIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>
    ]

    return <ActionMenu actions={periodActions}>
      {period}
    </ActionMenu>
  }

  // TODO: move into a separate component
  renderActionMenu (section, group, category) {
    // TODO: implement actions for CategoryActionMenu

    let periodActions = [
      <IconButton
          key="rename"
          title="Rename category"
          onTouchTap={ (event) => this.handleRenameCategory(section, group, category.id) }
          style={styles.actionButton}>
        <EditIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>,
      <IconButton
          key="up"
          title="Move category up"
          onTouchTap={
            // TODO: implement action
            (event) => alert('not yet implemented')
          }
          style={styles.actionButton}>
        <UpIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>,
      <IconButton
          key="down"
          title="Move category down"
          onTouchTap={
            // TODO: implement action
            (event) => alert('not yet implemented')
          }
          style={styles.actionButton}>
        <DownIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>,
      <IconButton
          key="delete"
          title="Delete category"
          onTouchTap={(event) => this.handleDeleteCategory(section, group, category.id)}
          style={{width: 24, height: 24, padding: 0}}>
        <ClearIcon color="white" hoverColor={theme.palette.accent1Color} />
      </IconButton>
    ]

    return <ActionMenu actions={periodActions}>
      {category.name}
    </ActionMenu>
  }

  /**
   * Open a prompt where the user can enter a comma separated list with periods
   */
  handleSetPeriods () {
    const parameters = this.props.data && this.props.data.parameters

    const periods = (parameters && parameters.periods)
        ? parameters.periods.join(', ')
        : ''

    const options = {
      title: 'Periods',
      description: 'Enter a comma separated list with periods:',
      hintText: comingYears().join(', '),
      value: periods
    }

    this.refs.prompt.show(options).then(value => {
      if (value !== null) {
        const newPeriods = value.split(',').map(trim)
        this.props.dispatch(setPeriods(newPeriods))
      }
    })
  }

  handleAddCategory (section, group) {
    const options = {
      title: 'New category',
      description: 'Enter a name for the new category:',
      hintText: 'New category',
      value: 'New category'
    }

    this.refs.prompt.show(options).then(name => {
      if (name !== null) {
        this.props.dispatch(addCategory(section, group, name))
      }
    })
  }

  handleRenameCategory (section, group, categoryId) {
    const category = this.findCategory(section, group, categoryId)

    const options = {
      title: 'Rename category',
      description: 'Enter a new name for the category:',
      hintText: 'New category',
      value: category.name
    }

    this.refs.prompt.show(options).then(newName => {
      if (newName !== null) {
        this.props.dispatch(renameCategory(section, group, categoryId, newName))
      }
    })
  }

  handleDeleteCategory (section, group, categoryId) {
    const category = this.findCategory(section, group, categoryId)

    const options = {
      title: 'Delete category',
      description: <p>Are you sure you want to delete category "{category.name}"?</p>
    }

    this.refs.confirm.show(options).then(ok => {
      if (ok) {
        this.props.dispatch(deleteCategory(section, group, categoryId))
      }
    })
  }

  findCategory (section, group, categoryId) {
    return this.props.data[section][group]
        .find(category => category.id === categoryId)
  }

}

Inputs = connect((state, ownProps) => {
  return {
    data: state.doc.data
  }
})(Inputs)

function trim (str) {
  return str.trim()
}

function comingYears (count = 5) {
  const years = []
  let year = new Date().getFullYear()

  for (let i = 0; i < count; i++) {
    years.push(year + i)
  }

  return years
}

export default Inputs
