import test from 'ava';

import * as formulas from '../src/client/formulas';

import { readFileSync } from 'fs';


test('getYears', t => {
  const years = formulas.getYears({parameters: {startingYear: '2016', numberOfYears: '5'}})
  t.deepEqual(years, ['2016', '2017', '2018', '2019', '2020'])
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
  let item = {
    "name": "media",
    "category": "licenses",
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
  };
  let periods = ['2015', '2016', '2017', '2018'];
  // note that there is no quantity provided for 2015

  t.deepEqual(formulas.calculatePrices(item, periods), {
    '2015': 0,
    '2016': 11,
    '2017': 24.200000000000003,
    '2018': 39.930000000000014
  });
});

test('parseValue', t => {
  t.is(formulas.parseValue('23'), 23);
  t.is(formulas.parseValue('23.5'), 23.5);
  t.is(formulas.parseValue('-2'), -2);
  t.is(formulas.parseValue('23k'), 23000);
  t.is(formulas.parseValue('+23k'), 23000);
  t.is(formulas.parseValue('-23k'), -23000);
  t.is(formulas.parseValue('23M'), 23e6);
  t.is(formulas.parseValue('23B'), 23e9);
  t.is(formulas.parseValue('23T'), 23e12);

  t.is(formulas.parseValue('5%'), 0.05);
  t.is(formulas.parseValue('+5%'), 0.05);
  t.is(formulas.parseValue('2.3%'), 0.023);
  t.is(formulas.parseValue('-10%'), -0.1);

  t.is(formulas.parseValue('hi'), 0);
});

test('formatPrice', t => {
  t.is(formulas.formatPrice(12.05), '12');
  t.is(formulas.formatPrice(12.75), '13');
  t.is(formulas.formatPrice(-12.75), '-13');
  t.is(formulas.formatPrice(2300), '2.3k');
  t.is(formulas.formatPrice(15000), '15k');
  t.is(formulas.formatPrice(150000), '150k');
  t.is(formulas.formatPrice(2300000), '2.3M');
  t.is(formulas.formatPrice(23000000), '23M');
  t.is(formulas.formatPrice(600000000000), '600B');
  t.is(formulas.formatPrice(600000000000000), '600T');
});
