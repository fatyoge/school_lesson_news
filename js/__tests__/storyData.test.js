import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateStories, REQUIRED_FIELDS } from '../storyData.js';

test('validateStories accepts a minimally valid story object', () => {
  const stories = [{
    id: '01-test', title: 'T', theme: '基建', risk_level: 'low',
    estimated_duration_min: [3, 5], hook: 'h',
    us_data: { facts: ['a'], source: 's', source_url: '', last_verified: '2026-05-02' },
    cn_data: { facts: ['b'], source: 's', source_url: '', last_verified: '2026-05-02' },
    comparison_anchor: 'c',
    interactions: [{ type: 'vote', question: 'q', options: ['A', 'B', 'C'] }],
    ending: 'e', filter_notes: [], images: []
  }];
  assert.deepEqual(validateStories(stories), { ok: true, errors: [] });
});

test('validateStories rejects when required field missing', () => {
  const result = validateStories([{ id: '01-test' }]);
  assert.equal(result.ok, false);
  assert.ok(result.errors.length > 0);
  assert.match(result.errors[0], /missing/i);
});

test('validateStories rejects invalid risk_level', () => {
  const stories = [{
    id: '01-test', title: 'T', theme: '基建', risk_level: 'extreme',
    estimated_duration_min: [3, 5], hook: 'h',
    us_data: { facts: ['a'], source: 's', source_url: '', last_verified: '2026-05-02' },
    cn_data: { facts: ['b'], source: 's', source_url: '', last_verified: '2026-05-02' },
    comparison_anchor: 'c', interactions: [], ending: 'e', filter_notes: [], images: []
  }];
  const result = validateStories(stories);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => /risk_level/.test(e)));
});

test('REQUIRED_FIELDS exports the expected keys', () => {
  assert.deepEqual(
    [...REQUIRED_FIELDS].sort(),
    ['cn_data', 'comparison_anchor', 'ending', 'estimated_duration_min', 'filter_notes',
     'hook', 'id', 'images', 'interactions', 'risk_level', 'theme', 'title', 'us_data'].sort()
  );
});
