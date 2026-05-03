import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalogCardHTML } from '../renderCatalog.js';

const sampleStory = {
  id: '02-fire-fee',
  title: '没交75美元，消防车在我家门口看着房子烧',
  theme: '安全 / 公共服务',
  risk_level: 'medium',
  estimated_duration_min: 4,
  hook: '消防员到场后查到没交费，转身就走',
  us_data: {},
  cn_data: {},
  comparison_anchor: { us_label: '', us_value: '', cn_label: '', cn_value: '' },
  interactions: [],
  ending: '',
  filter_notes: '',
  images: []
};

test('buildCatalogCardHTML: contains data-story-id for event binding', () => {
  const html = buildCatalogCardHTML(sampleStory, 1);
  assert.match(html, /data-story-id="02-fire-fee"/);
});

test('buildCatalogCardHTML: shows number badge', () => {
  const html = buildCatalogCardHTML(sampleStory, 1);
  assert.match(html, /class="card-num"[^>]*>\s*1\s*</);
});

test('buildCatalogCardHTML: shows story title', () => {
  const html = buildCatalogCardHTML(sampleStory, 1);
  assert.ok(html.includes('没交75美元，消防车在我家门口看着房子烧'));
});

test('buildCatalogCardHTML: shows theme tag', () => {
  const html = buildCatalogCardHTML(sampleStory, 1);
  assert.ok(html.includes('安全 / 公共服务'));
});

test('buildCatalogCardHTML: shows estimated duration', () => {
  const html = buildCatalogCardHTML(sampleStory, 1);
  assert.match(html, /4\s*分钟|4\s*min/);
});

test('buildCatalogCardHTML: escapes HTML special characters in title', () => {
  const evil = { ...sampleStory, title: '<script>alert(1)</script>' };
  const html = buildCatalogCardHTML(evil, 1);
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});
