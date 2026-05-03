/**
 * app.js — 应用入口；把 stories.json 注入 reveal.js。
 */
import { loadStories } from './storyData.js';
import { renderCatalog } from './renderCatalog.js';

async function bootstrap() {
  const stories = await loadStories('./data/stories.json');

  const catalogContainer = document.querySelector('#catalog-grid');
  if (!catalogContainer) {
    throw new Error('catalog container #catalog-grid not found');
  }

  // 初始化 reveal.js
  const reveal = new Reveal({
    hash: false,
    slideNumber: false,
    controls: true,
    progress: true,
    transition: 'fade'
  });
  await reveal.initialize();

  renderCatalog(stories, catalogContainer, reveal);

  // 暴露给后续 keyboard 模块
  window.__lessonApp = { stories, reveal };
}

bootstrap().catch((err) => {
  console.error('[bootstrap] failed:', err);
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<pre style="color:#fff;background:#900;padding:1rem">启动失败：${err.message}</pre>`
  );
});
