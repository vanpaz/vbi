import React, { Component } from 'react';
import debugFactory from 'debug/browser';
import { assign, cloneDeep } from 'lodash';
import TextField from 'material-ui/lib/text-field';
import FlatButton from 'material-ui/lib/flat-button';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import RadioButton from 'material-ui/lib/radio-button';
import RadioButtonGroup from 'material-ui/lib/radio-button-group';

const debug = debugFactory('vbi:PriceTypePercentage');

const styles = {
  selectCategory: {width: 128},
  textPercentage: {width: 96},
  radioAll: {margin: '8px 0'}
};

export default class PriceTypePercentage extends Component {
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
              {this.renderSelectCategory(entry)}
            </td>
            <td>
              {this.renderTextPercentage(entry)}
            </td>
            <td>
              <FlatButton label="Remove" onTouchTap={this.handleRemoveEntry.bind(this, entry)} />
            </td>
          </tr>
        })}
        <tr>
          <td/>
          <td/>
          <td>
            <FlatButton label="Add" onTouchTap={this.handleAddEntry.bind(this)} />
          </td>
        </tr>
        </tbody>
      </table>
    </div>;
  }

  renderSelectCategory (entry) {
    return <SelectField
        value={entry.category}
        hintText="category"
        style={styles.selectCategory}
        onChange={(event, index, value) => {
              let newEntry = {
                category: value,
                percentage: entry.percentage
              };
              this.handleChangeEntry(entry, newEntry);
            }} >
      {this.props.categories.map(category => {
        return <MenuItem key={category} value={category} primaryText={category} />
      })}
    </SelectField>
  }

  renderTextPercentage (entry) {
    return <TextField
        value={entry.percentage}
        hintText="5%"
        style={styles.textPercentage}
        onChange={(event) => {
              let newEntry = {
                category: entry.category,
                percentage: event.target.value
              };
              this.handleChangeEntry(entry, newEntry);
            }} />
  }

  handleChangeEntry (oldEntry, newEntry) {
    debug('handleChangeEntry', oldEntry, newEntry);

    if (this.props.price.percentages) {
      var price = cloneDeep(this.props.price);
      let index = this.props.price.percentages.indexOf(oldEntry);
      if (index !== -1) {
        price.percentages[index] = newEntry;
      }

      this.props.onChange(price);
    }
  }

  handleRemoveEntry (entry) {
    debug('handleRemoveEntry', entry);

    if (this.props.price.percentages) {
      var price = cloneDeep(this.props.price);
      let index = this.props.price.percentages.indexOf(entry);
      if (index !== -1) {
        price.percentages.splice(index, 1);
      }

      this.props.onChange(price);
    }
  }

  handleAddEntry () {
    debug('handleAddEntry');

    var price = cloneDeep(this.props.price);

    if (!price.percentages) {
      price.percentages = [];
    }
    price.percentages.push({category: '', percentage: ''});

    this.props.onChange(price);
  }

  handleChangePercentage (percentage) {
    debug('handleChangePercentage', percentage);

    var price = cloneDeep(this.props.price);
    price.percentage = percentage;

    this.props.onChange(price);
  }

  handleChangeAll (all) {
    debug('handleChangeAll', all);

    var price = cloneDeep(this.props.price);
    price.all = all;

    this.props.onChange(price);
  }

  static format (price) {
    if (price.all) {
      return `${price.percentage} of revenue`
    }
    else {
      if (Array.isArray(price.percentages)) {
        return price.percentages
            .map(entry => {
              return `${entry.percentage} of ${entry.category}`
            })
            .join(', ');
      }
    }

    return '';
  }

  static label = 'Percentage of revenue';
}
