import React, { Component } from 'react';
import debugFactory from 'debug/browser';

import Card from 'material-ui/lib/card/card';
import CardTitle from 'material-ui/lib/card/card-title';
import CardText from 'material-ui/lib/card/card-text';

const debug = debugFactory('vbi:input');

export default class InputForm extends Component {
  render () {
    return <Card className="card">
      <CardTitle title="Input form" subtitle="Specify prices and quantities of costs and revenues" />
      <CardText>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
        Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
        Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
      </CardText>
    </Card>
  }
}