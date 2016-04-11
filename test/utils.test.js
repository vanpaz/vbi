import test from 'ava';

import * as utils from '../src/client/js/utils';

import { readFileSync } from 'fs';


let data = JSON.parse(readFileSync('../data/example_scenario.json', 'utf8')).data;

test('getCategories', t => {
  t.deepEqual(utils.getCategories(data.costs), ['direct', 'personnel']);
  t.deepEqual(utils.getCategories(data.revenues), ['licenses', 'projects']);
});

test('getPeriods', t => {
  t.deepEqual(utils.getPeriods(data.costs), ['2015', '2016', '2017', '2018']);
  t.deepEqual(utils.getPeriods(data.revenues), ['2016', '2017', '2018']);
});

test('findQuantity', t => {
  t.deepEqual(utils.findQuantity({
    name: 'foo',
    category: 'personnel',
    prices: {},
    quantities: {
      '2015': '4',
      '2016': '2',
      '2017': '8'
    }
  }, '2016'), '2');

  t.deepEqual(utils.findQuantity({
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
      "value": "10 euro/year",
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

  t.deepEqual(utils.calculatePrices(item, periods), {
    '2015': 0,
    '2016': 11,
    '2017': 24.200000000000003,
    '2018': 39.930000000000014
  });
});

test('calculateCategoryTotals', t => {
  t.deepEqual(utils.calculateCategoryTotals(data.costs), [
    {
      "category": "direct",
      "totals": {
        "2015": 0,
        "2016": 0,
        "2017": 0,
        "2018": 0
      }
    },
    {
      "category": "personnel",
      "totals": {
        "2015": 0,
        "2016": 301.78999999999996,
        "2017": 455.12609999999995,
        "2018": 719.0143659999998
      }
    }
  ]);

  t.deepEqual(utils.calculateCategoryTotals(data.revenues), [
    {
      "category": "licenses",
      "totals": {
        "2016": 24,
        "2017": 119.47999999999999,
        "2018": 267.34680000000003
      }
    },
    {
      "category": "projects",
      "totals": {
        "2016": 180,
        "2017": 441,
        "2018": 661.5
      }
    }
  ]);
});

test('calculateTotals', t => {
  let costsTotals = utils.calculateCategoryTotals(data.costs);
  t.deepEqual(utils.calculateTotals(costsTotals), {
    "2015": 0,
    "2016": 301.78999999999996,
    "2017": 455.12609999999995,
    "2018": 719.0143659999998
  });

  let revenuesTotals = utils.calculateCategoryTotals(data.revenues);
  t.deepEqual(utils.calculateTotals(revenuesTotals), {
    "2016":204,
    "2017":560.48,
    "2018":928.8468
  });
});
