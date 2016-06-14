import test from 'ava';

import { parseValue, formatValueWithUnit, normalize, denormalize } from '../../src/client/utils/number';

test('parseValue', t => {
  t.is(parseValue('23'), 23);
  t.is(parseValue('23.5'), 23.5);
  t.is(parseValue('-2'), -2);
  t.is(parseValue('23k'), 23000);
  t.is(parseValue('+23k'), 23000);
  t.is(parseValue('-23k'), -23000);
  t.is(parseValue('23M'), 23e6);
  t.is(parseValue('23B'), 23e9);
  t.is(parseValue('23T'), 23e12);

  t.is(parseValue('5%'), 0.05);
  t.is(parseValue('+5%'), 0.05);
  t.is(parseValue('2.3%'), 0.023);
  t.is(parseValue('-10%'), -0.1);

  t.is(parseValue('hi'), 0);
});

test('formatValueWithUnit', t => {
  t.is(formatValueWithUnit(12.05), '12');
  t.is(formatValueWithUnit(12.75), '13');
  t.is(formatValueWithUnit(-12.75), '-13');
  t.is(formatValueWithUnit(2300), '2.3k');
  t.is(formatValueWithUnit(15000), '15k');
  t.is(formatValueWithUnit(150000), '150k');
  t.is(formatValueWithUnit(2300000), '2.3M');
  t.is(formatValueWithUnit(23000000), '23M');
  t.is(formatValueWithUnit(600000000000), '600B');
  t.is(formatValueWithUnit(600000000000000), '600T');
});

test('normalize', t => {
  t.is(normalize('10', 1000), '10000')
  t.is(normalize('10.', 1000), '10000.')
  t.is(normalize('10.2', 1000), '10200')
})

test('denormalize', t => {
  t.is(denormalize('10000', 1000), '10')
  t.is(denormalize('10000.', 1000), '10.')
  t.is(denormalize('10200', 1000), '10.2')
})
