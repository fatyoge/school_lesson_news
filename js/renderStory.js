/**
 * renderStory.js — 单个 story → reveal.js horizontal section（含 vertical slides）
 * 每个 slide 类型由一个 pure function 构造 HTML 字符串。
 */

function escapeHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDuration(min) {
  if (Array.isArray(min)) return min.join('-');
  const n = Number(min);
  return Number.isFinite(n) ? n : 0;
}

function bulletsHTML(items = []) {
  if (!Array.isArray(items) || items.length === 0) return '';
  return `<ul class="facts">${items.map((b) => `<li>${escapeHTML(b)}</li>`).join('')}</ul>`;
}

export function buildStoryCoverHTML(story) {
  const minutes = formatDuration(story.estimated_duration_min);
  return `
    <section class="story-cover">
      <div class="story-tag">${escapeHTML(story.theme)}</div>
      <h2 class="story-title">${escapeHTML(story.title)}</h2>
      <p class="story-duration">⏱ 约 ${minutes} 分钟</p>
    </section>
  `.trim();
}

export function buildHookSlideHTML(story) {
  const cover = (story.images && story.images[0]) || null;
  const img = cover
    ? `<img class="hook-image" src="images/${escapeHTML(cover.file || cover.filename || '')}" alt="${escapeHTML(cover.alt || cover.purpose || '')}">`
    : '';
  return `
    <section class="slide-narrative">
      ${img}
      <p class="hook-text">${escapeHTML(story.hook)}</p>
    </section>
  `.trim();
}

export function buildUSDataSlideHTML(story) {
  const us = story.us_data || {};
  const items = us.bullets || us.facts || [];
  const headline = us.headline || us.source || '';
  return `
    <section class="slide-reveal">
      <h3 class="us-headline">${escapeHTML(headline)}</h3>
      ${bulletsHTML(items)}
    </section>
  `.trim();
}

export function buildComparisonSlideHTML(story) {
  const a = story.comparison_anchor;

  // Object form (test fixture / future format)
  if (a && typeof a === 'object') {
    return `
      <section class="slide-comparison">
        <div class="comparison-grid">
          <div class="comparison-side us">
            <h2>${escapeHTML(a.us_label || '美国')}</h2>
            ${bulletsHTML([a.us_value || ''])}
          </div>
          <div class="comparison-side cn">
            <h2>${escapeHTML(a.cn_label || '中国')}</h2>
            ${bulletsHTML([a.cn_value || ''])}
          </div>
        </div>
      </section>
    `.trim();
  }

  // String form (current real data) — try split on " vs "
  const text = String(a || '');
  const parts = text.split(/\s+vs\s+/i);
  if (parts.length === 2) {
    return `
      <section class="slide-comparison">
        <div class="comparison-grid">
          <div class="comparison-side us">
            <h2>美国</h2>
            ${bulletsHTML([parts[0].trim()])}
          </div>
          <div class="comparison-side cn">
            <h2>中国</h2>
            ${bulletsHTML([parts[1].trim()])}
          </div>
        </div>
      </section>
    `.trim();
  }

  // Fallback
  return `
    <section class="slide-comparison">
      <p class="aftermath-text">${escapeHTML(text)}</p>
    </section>
  `.trim();
}

export function buildInteractionSlideHTML(interaction) {
  const opts = Array.isArray(interaction.options) ? interaction.options : [];
  const list = opts.length
    ? `<ul class="think-options">${opts.map((o) => `<li>${escapeHTML(o)}</li>`).join('')}</ul>`
    : '';
  return `
    <section class="slide-think">
      <div class="think-label">想一想</div>
      <h3 class="think-question">${escapeHTML(interaction.question || '')}</h3>
      ${list}
    </section>
  `.trim();
}

export function buildEndingSlideHTML(story) {
  return `
    <section class="slide-aftermath">
      <p class="aftermath-text">${escapeHTML(story.ending || '')}</p>
      <button type="button" class="back-to-catalog" data-action="back-to-catalog">⬅ 回目录</button>
    </section>
  `.trim();
}

export function buildStorySectionHTML(story) {
  const interactions = Array.isArray(story.interactions) ? story.interactions : [];
  const interactionSlides = interactions.map((i) => buildInteractionSlideHTML(i)).join('\n');

  return `<section data-story-id="${escapeHTML(story.id)}">
${buildStoryCoverHTML(story)}
${buildHookSlideHTML(story)}
${buildUSDataSlideHTML(story)}
${buildComparisonSlideHTML(story)}
${interactionSlides}
${buildEndingSlideHTML(story)}
</section>`;
}

export function renderAllStories(stories, slidesContainer) {
  const html = stories.map((s) => buildStorySectionHTML(s)).join('\n');
  slidesContainer.insertAdjacentHTML('beforeend', html);
}
