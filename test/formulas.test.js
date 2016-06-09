import test from 'ava';

import * as formulas from '../src/client/formulas';


test('getYears', t => {
  const years = formulas.getYears({parameters: {startingYear: '2016', numberOfYears: '5'}})
  t.deepEqual(years, [2016, 2017, 2018, 2019, 2020])
})

test('findQuantity', t => {
  t.deepEqual(formulas.findQuantity({
    name: 'foo',
    category: 'personnel',
    prices: {},
    quantities: {
      '2015': '4',
      '2016': '2',
      '2017': '8'
    }
  }, '2016'), '2');

  t.deepEqual(formulas.findQuantity({
    name: 'foo',
    category: 'personnel',
    prices: {},
    quantities: {
      '2015': '4',
      '2016': '2',
      '2017': '8'
    }
  }, '2019'), '0');
});

test('calculatePrices', t => {
  let categories = [{
    "name": "media",
    "price": {
      "type": "constant",
      "value": "10",
      "change": "+10%"
    },
    "quantities": {
      "2016": "1",
      "2017": "2",
      "2018": "3"
    }
  }]
  let periods = ['2015', '2016', '2017', '2018'];
  // note that there is no quantity provided for 2015

  t.deepEqual(formulas.calculatePxQ(categories, periods), {
    '2015': 0,
    '2016': 11,
    '2017': 24.200000000000003,
    '2018': 39.930000000000014
  });
});
