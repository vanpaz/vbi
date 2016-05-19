import test from 'ava';

import * as formulas from '../src/client/js/formulas';

import { readFileSync } from 'fs';


// FIXME: make the unit tests independent from example_scenario.json

let data = JSON.parse(readFileSync('../data/example_scenario.json', 'utf8')).data;

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


test('parsePercentage', t => {
  t.is(formulas.parsePercentage('5%'), 0.05);
  t.is(formulas.parsePercentage('+5%'), 0.05);
  t.is(formulas.parsePercentage('2.3%'), 0.023);
  t.is(formulas.parsePercentage('-10%'), -0.1);
  t.throws(() => formulas.parsePercentage('2.3.4%'), /Invalid percentage/);
  t.throws(() => formulas.parsePercentage('hi'), /Invalid percentage/);
  t.throws(() => formulas.parsePercentage('23'), /Invalid percentage/);
});

test('parsePrice', t => {
  t.is(formulas.parsePrice('23'), 23);
  t.is(formulas.parsePrice('23.5'), 23.5);
  t.is(formulas.parsePrice('-2'), -2);
  t.is(formulas.parsePrice('23k'), 23000);
  t.is(formulas.parsePrice('+23k'), 23000);
  t.is(formulas.parsePrice('-23k'), -23000);
  t.is(formulas.parsePrice('23M'), 23e6);
  t.is(formulas.parsePrice('23B'), 23e9);
  t.is(formulas.parsePrice('23T'), 23e12);
  t.throws(() => formulas.parsePrice('hi'), /Invalid price/);
  t.throws(() => formulas.parsePrice('23q'), /Invalid price/);
  t.throws(() => formulas.parsePrice('23q'), /Invalid price/);
  t.throws(() => formulas.parsePrice('2.3.4'), /Invalid price/);
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
