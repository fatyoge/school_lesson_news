import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStoryCoverHTML,
  buildHookSlideHTML,
  buildUSDataSlideHTML,
  buildComparisonSlideHTML,
  buildInteractionSlideHTML,
  buildEndingSlideHTML,
  buildStorySectionHTML,
} from '../renderStory.js';

const story = {
  id: '02-fire-fee',
  title: '没交75美元，消防车在我家门口看着房子烧',
  theme: '安全 / 公共服务',
  risk_level: 'medium',
  estimated_duration_min: [3, 5],
  hook: '消防员到场后查到没交费，转身就走',
  us_data: {
    headline: '田纳西州 South Fulton, 2010',
    bullets: [
      '消防订阅费：75 美元 / 年',
      '老人当场补交，消防员仍拒绝',
      '只保护邻居家，眼睁睁看房子和宠物烧毁'
    ]
  },
  cn_data: {
    headline: '中国消防由公共财政支付',
    bullets: ['居民不需要单独购买消防服务', '119 报警免费']
  },
  comparison_anchor: {
    us_label: '美国部分小镇',
    us_value: '75 美元 / 年订阅',
    cn_label: '中国',
    cn_value: '0 元（公共财政）'
  },
  interactions: [
    { question: '如果你是那位消防员，你会怎么做？', options: ['坚持按规定办', '先救火再说', '其他想法'] }
  ],
  ending: '这件事推动了多少改变？答案是几乎没有 —— 直到今天，订阅制消防仍存在于美国一些小镇。',
  filter_notes: '',
  images: [{ filename: '02-fire-fee-house.jpg', alt: '燃烧中的房屋' }]
};

test('buildStoryCoverHTML: renders title + theme', () => {
  const html = buildStoryCoverHTML(story);
  assert.ok(html.includes(story.title));
  assert.ok(html.includes(story.theme));
});

test('buildHookSlideHTML: renders hook text', () => {
  const html = buildHookSlideHTML(story);
  assert.ok(html.includes('消防员到场后查到没交费'));
});

test('buildUSDataSlideHTML: renders headline and all bullets', () => {
  const html = buildUSDataSlideHTML(story);
  assert.ok(html.includes('田纳西州 South Fulton, 2010'));
  assert.ok(html.includes('75 美元 / 年'));
  assert.ok(html.includes('眼睁睁看房子和宠物烧毁'));
});

test('buildUSDataSlideHTML: renders source citation when different from headline', () => {
  const withSource = {
    ...story,
    us_data: { ...story.us_data, source: 'NBC News 2010', source_url: 'https://example.com' }
  };
  const html = buildUSDataSlideHTML(withSource);
  assert.ok(html.includes('NBC News 2010'));
  assert.ok(html.includes('class="source"'));
});

test('buildComparisonSlideHTML: renders both US and CN sides', () => {
  const html = buildComparisonSlideHTML(story);
  assert.ok(html.includes('美国部分小镇'));
  assert.ok(html.includes('75 美元 / 年订阅'));
  assert.ok(html.includes('中国'));
  assert.ok(html.includes('0 元（公共财政）'));
  assert.match(html, /comparison-side[^"]*us/);
  assert.match(html, /comparison-side[^"]*cn/);
});

test('buildComparisonSlideHTML: handles string comparison_anchor', () => {
  const s = { ...story, comparison_anchor: '美国 $75/年 vs 中国 免费' };
  const html = buildComparisonSlideHTML(s);
  assert.ok(html.includes('美国 $75/年'));
  assert.ok(html.includes('中国 免费'));
});

test('buildInteractionSlideHTML: renders question and all options', () => {
  const html = buildInteractionSlideHTML(story.interactions[0]);
  assert.ok(html.includes('如果你是那位消防员'));
  assert.ok(html.includes('坚持按规定办'));
  assert.ok(html.includes('先救火再说'));
  assert.ok(html.includes('其他想法'));
});

test('buildInteractionSlideHTML: no options renders question only', () => {
  const html = buildInteractionSlideHTML({ question: '你怎么想？' });
  assert.ok(html.includes('你怎么想？'));
  assert.doesNotMatch(html, /<ul[\s\S]*?<\/ul>/);
});

test('buildEndingSlideHTML: renders ending text', () => {
  const html = buildEndingSlideHTML(story);
  assert.ok(html.includes('几乎没有'));
});

test('buildStorySectionHTML: nested structure starts/ends with <section>', () => {
  const html = buildStorySectionHTML(story);
  assert.match(html, /^<section[^>]*data-story-id="02-fire-fee"/);
  assert.ok(html.trimEnd().endsWith('</section>'));
  const innerSections = html.match(/<section/g) || [];
  assert.equal(innerSections.length, 7); // outer 1 + inner 6
});

test('buildStorySectionHTML: escapes malicious title', () => {
  const evil = { ...story, title: '<img onerror="x">' };
  const html = buildStorySectionHTML(evil);
  assert.ok(!html.includes('<img onerror="x">'));
  assert.ok(html.includes('&lt;img'));
});
