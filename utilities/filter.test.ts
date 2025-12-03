import { Filter, makeInternalNode, makeLeafNode } from 'utilities/filter';
import {expect, jest, test} from '@jest/globals';

import type { FilterDomainTree } from 'utilities/filter';

const TestFilterDomain : FilterDomainTree = makeInternalNode(
  'all', 'Test Filter Options', 
  [
    makeLeafNode('opt', 1, 'Option 1', 'opt 1'),
    makeInternalNode(
      'groupA',
      'Group A',
      [
        makeLeafNode('opt', 2, 'Option 2', 'opt 2'),
        makeLeafNode('opt', 3, 'Option 3', 'opt 3'),
        makeLeafNode('opt', 4, 'Option 4', 'opt 4'),
      ],
      'grpA')
  ]
);

describe('filter', () => {
  const filter = new Filter(TestFilterDomain);
  it('toFilterString() returns empty string if nothing', () => {
    expect(filter.toFilterString(new Set([1, 2, 3, 4]))).toBe('');
  })

  it('toFilterString() uses skipped items if it is shorter than matched', () => {
    const filterString = filter.toFilterString(new Set([2, 3, 4]));
    expect(filterString[0]).toBe('-');
  })

  it('toFilterString() uses matched items if it is shorter or equal to skipped', () => {
    const filterString = filter.toFilterString(new Set([1, 2]));
    expect(filterString).not.toBe('-');
  })

  it('fromFilterString() reverses toFilterString()', () => {
    const matchedSet = new Set([1, 2]);
    const skippedSet = new Set([2, 3, 4]);
    const matchedString = filter.toFilterString(matchedSet);
    const skippedString = filter.toFilterString(skippedSet);
    expect(filter.fromFilterString(matchedString)).toStrictEqual(matchedSet);
    expect(filter.fromFilterString(skippedString)).toStrictEqual(skippedSet);
  })
});

