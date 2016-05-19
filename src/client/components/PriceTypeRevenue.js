import React, { Component } from 'react';
import debugFactory from 'debug/browser';
import Immutable from 'seamless-immutable'
import TextField from 'material-ui/lib/text-field';
import FlatButton from 'material-ui/lib/flat-button';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import RadioButton from 'material-ui/lib/radio-button';
import RadioButtonGroup from 'material-ui/lib/radio-button-group';

import { appendItem, removeItem } from '../js/immutable'

const debug = debugFactory('vbi:PriceTypeRevenue');

const styles = {
  selectCategory: {width: 128},
  textPercentage: {width: 96},
  radioAll: {margin: '8px 0'}
};

export default class PriceTypeRevenue extends Component {
  render () {
    const all = (this.props.price.all !== false);

    return <div className="price-type">
      <p className="description">
        Enter a percentage of one, multiple, or all revenue categories.
      </p>

      <RadioButtonGroup
          name="radioAll"
          valueSelected={all ? 'true' : 'false'}
          defaultSelected="true"
          onChange={(event, value) => this.handleChangeAll(value === 'true') }>
        <RadioButton
            value="true"
            label="A percentage of revenue"
            style={styles.radioAll}
        />
        <RadioButton
            value="false"
            label="A percentage per category"
            style={styles.radioAll}
        />
      </RadioButtonGroup>
      <div>
        {
          (all)
            ? this.renderOptionAll()
            : this.renderOptionPerCategory()
        }
      </div>
    </div>
  }

  renderOptionAll () {
    return <div>
      Percentage: <TextField
        value={this.props.price.percentage}
        hintText="5%"
        style={styles.textPercentage}
        onChange={(event) => {
              this.handleChangePercentage(event.target.value) ;
            }} />
    </div>;
  }

  renderOptionPerCategory () {
    return <div>
      <table>
        <tbody>
        <tr>
          <th>Category</th>
          <th>Percentage</th>
          <th />
        </tr>
        {this.props.price.percentages && this.props.price.percentages.map((entry, index) => {
          return <tr key={index}>
            <td>
              {this.renderSelectCategory(entry, index)}
            </td>
            <td>
              {this.renderTextPercentage(entry, index)}
            </td>
            <td>
              <FlatButton label="Remove" onTouchTap={(event) => this.handleRemoveEntry(index)} />
            </td>
          </tr>
        })}
        <tr>
          <td/>
          <td/>
          <td>
            <FlatButton label="Add" onTouchTap={(event) => this.handleAddEntry()} />
          </td>
        </tr>
        </tbody>
      </table>
    </div>;
  }

  renderSelectCategory (entry, entryIndex) {
    return <SelectField
        value={entry.categoryId}
        hintText="category"
        style={styles.selectCategory}
        onChange={(event, index, value) => {
          this.handleUpdateEntryCategory(entryIndex, value);
        }} >
      {this.props.categories.map(category => {
        return <MenuItem key={category.id} value={category.id} primaryText={category.name} />
      })}
    </SelectField>
  }

  renderTextPercentage (entry, entryIndex) {
    return <TextField
        value={entry.percentage}
        hintText="5%"
        style={styles.textPercentage}
        onChange={(event) => {
          this.handleUpdateEntryPercentage(entryIndex, event.target.value);
        }} />
  }

  handleUpdateEntryCategory (index, categoryId) {
    debug('handleUpdatePercentageCategory', index, categoryId);

    const price = this.props.price.setIn(['percentages', index, 'categoryId'], categoryId)

    this.props.onChange(price);
  }

  handleUpdateEntryPercentage (index, percentage) {
    debug('handleUpdateEntryPercentage', index, percentage);

    const price = this.props.price.setIn(['percentages', index, 'percentage'], percentage)

    this.props.onChange(price);
  }

  handleRemoveEntry (index) {
    debug('handleRemoveEntry', index);

    const price = this.props.price.updateIn(['percentages'],
        percentages => removeItem(percentages, index))

    this.props.onChange(price);
  }

  handleAddEntry () {
    debug('handleAddEntry');

    const item = {categoryId: '', percentage: ''}
    let price

    if (this.props.price.percentages) {
      price = this.props.price.updateIn(['percentages'],
          percentages => appendItem(percentages, Immutable(item)))
    }
    else {
      price = this.props.price.set('percentages', Immutable([item]))
    }
    
    this.props.onChange(price);
  }

  handleChangePercentage (percentage) {
    debug('handleChangePercentage', percentage);

    const price = this.props.price.set('percentage', percentage);

    this.props.onChange(price);
  }

  handleChangeAll (all) {
    debug('handleChangeAll', all);

    const price = this.props.price.set('all', all);

    this.props.onChange(price);
  }

  static format (price, categories) {
    if (price.all) {
      return `${price.percentage} of revenue`
    }
    else {
      if (Array.isArray(price.percentages)) {
        return price.percentages
            .map(entry => {
              const category = categories.find(category => category.id === entry.categoryId)

              return `${entry.percentage} of ${category && category.name || 'unknown'}`
            })
            .join(', ');
      }
    }

    return '';
  }

  static label = 'Percentage of revenue';
}
