/**
 * app.js — 应用入口；把 stories.json 注入 reveal.js。
 */
import { loadStories } from './storyData.js';
import { renderCatalog } from './renderCatalog.js';
import { renderAllStories } from './renderStory.js';
import { setupKeyboardShortcuts } from './keyboard.js';

async function bootstrap() {
  const stories = await loadStories('./data/stories.json');

  const catalogContainer = document.querySelector('#catalog-grid');
  const slidesContainer = document.querySelector('.reveal .slides');
  if (!catalogContainer || !slidesContainer) {
    throw new Error('required containers not found');
  }

  // 1. 先把 story sections 注入 DOM（必须在 reveal.initialize 之前）
  renderAllStories(stories, slidesContainer);

  // 2. 初始化 reveal.js
  const reveal = new Reveal({
    hash: false,
    slideNumber: false,
    controls: true,
    progress: true,
    transition: 'fade'
  });
  await reveal.initialize();

  // 3. 渲染目录卡片（依赖 reveal 实例做点击跳转）
  renderCatalog(stories, catalogContainer, reveal);

  // 4. "回目录" 按钮事件
  slidesContainer.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-action="back-to-catalog"]');
    if (btn) reveal.slide(1, 0);
  });

  setupKeyboardShortcuts(stories, reveal);

  window.__lessonApp = { stories, reveal };
}

bootstrap().catch((err) => {
  console.error('[bootstrap] failed:', err);
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<pre style="color:#fff;background:#900;padding:1rem">启动失败：${err.message}</pre>`
  );
});
