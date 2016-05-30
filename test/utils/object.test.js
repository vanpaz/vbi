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
