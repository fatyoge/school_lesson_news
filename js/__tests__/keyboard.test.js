import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keyToTarget } from '../keyboard.js';

test('keyToTarget: "1" jumps to first story (horizontal index 2)', () => {
  assert.deepEqual(keyToTarget('1', 9), { type: 'story', horizontalIndex: 2 });
});

test('keyToTarget: "9" jumps to ninth story (horizontal index 10)', () => {
  assert.deepEqual(keyToTarget('9', 9), { type: 'story', horizontalIndex: 10 });
});

test('keyToTarget: "0" jumps to catalog (horizontal index 1)', () => {
  assert.deepEqual(keyToTarget('0', 9), { type: 'catalog', horizontalIndex: 1 });
});

test('keyToTarget: out-of-bounds digits return null', () => {
  assert.equal(keyToTarget('9', 5), null);
  assert.equal(keyToTarget('6', 5), null);
});

test('keyToTarget: valid digit within storyCount', () => {
  assert.deepEqual(keyToTarget('5', 5), { type: 'story', horizontalIndex: 6 });
});

test('keyToTarget: non-digit keys return null', () => {
  assert.equal(keyToTarget('a', 9), null);
  assert.equal(keyToTarget('Enter', 9), null);
  assert.equal(keyToTarget('', 9), null);
  assert.equal(keyToTarget(undefined, 9), null);
});

test('keyToTarget: invalid storyCount returns null', () => {
  assert.equal(keyToTarget('1', 0), null);
  assert.equal(keyToTarget('1', -1), null);
});
