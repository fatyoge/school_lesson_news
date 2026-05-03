/**
 * renderCatalog.js
 * 目录页卡片渲染 — pure function 部分独立可测，DOM 应用部分单独导出。
 */

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 构造一张目录卡片的 HTML 字符串。
 * @param {object} story  完整故事对象（来自 stories.json）
 * @param {number} index  从 1 开始的序号；用于显示和数字键导航
 * @returns {string}
 */
function formatDuration(min) {
  if (Array.isArray(min)) return min.join('-');
  const n = Number(min);
  return Number.isFinite(n) ? n : 0;
}

export function buildCatalogCardHTML(story, index) {
  const id = escapeHTML(story.id);
  const title = escapeHTML(story.title);
  const theme = escapeHTML(story.theme);
  const minutes = formatDuration(story.estimated_duration_min);
  const hook = escapeHTML(story.hook || '');

  return `
    <button type="button" class="catalog-card" data-story-id="${id}">
      <div class="card-num">${index}</div>
      <div class="card-thumb"></div>
      <h3 class="card-title">${title}</h3>
      <p class="card-hook">${hook}</p>
      <div class="card-meta">
        <span>${theme}</span>
        <span>⏱ ${minutes} 分钟</span>
      </div>
    </button>
  `.trim();
}

/**
 * 把整组卡片渲染到 container 内，并绑定点击 → 跳转 reveal section 的事件。
 * @param {Array<object>} stories
 * @param {HTMLElement} container
 * @param {object} reveal  reveal.js 实例（供 slide 跳转）
 */
export function renderCatalog(stories, container, reveal) {
  container.innerHTML = stories
    .map((story, idx) => buildCatalogCardHTML(story, idx + 1))
    .join('\n');

  if (container.dataset.catalogBound) return;
  container.dataset.catalogBound = 'true';

  container.addEventListener('click', (event) => {
    const card = event.target.closest('.catalog-card');
    if (!card) return;
    const storyId = card.dataset.storyId;
    const targetIndex = stories.findIndex((s) => s.id === storyId);
    if (targetIndex < 0) return;
    // 目录是 horizontal slide 1；故事从 horizontal slide 2 开始
    reveal.slide(targetIndex + 2, 0);
  });
}
