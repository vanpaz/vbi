import React from 'react'
import TextField from 'material-ui/lib/text-field'

import DebouncedInput from './DebouncedInput'

/**
 * Usage:
 *
 *     <DebouncedTextField
 *         value={"MyText"}
 *         onChange={function (value) { console.log('value=' + value)} }
 *         delay={300}
 *         hintText="23k"
 *         floatingLabelText="Initial price"
 *     />
 *
 * All properties of DebouncedTextField are passed to the created <input/> element.
 *
 * Methods:
 *
 *    .getInput()   // returns the input element
 *    .update()
 */
export default class DebouncedTextField extends DebouncedInput {
  
  render() {
    return (
        <TextField
            {...this.props}
            ref="input"
            value={this.state.value}
            onChange={this.handleChange}
            onInput={this.handleChange}
            onBlur={this.update}
        />
    );
  }
}
