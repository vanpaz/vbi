import test from 'ava';

import * as formulas from '../../src/client/utils/object';

test('getProp', t => {
  const object = {
    foo: {
      bar: [
        0,
        {
          baz: 42
        }
      ]
    }
  }

  t.is(formulas.getProp(object, ['foo', 'bar', 1, 'baz']), 42)
})

test('diffProps', t => {
  const object = {'2016': 5, '2017': 6, '2018': 9}

  t.deepEqual(formulas.diffProps(object), {'2016': 5, '2017': 1, '2018': 3})
})

test('accumulateProps', t => {
  const object = {'2016': 5, '2017': 6, '2018': 9}

  t.deepEqual(formulas.accumulateProps(object), {'2016': 5, '2017': 11, '2018': 20})
})
