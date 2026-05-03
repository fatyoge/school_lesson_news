/**
 * keyboard.js — 把按键事件映射为 reveal slide 跳转。
 */

/**
 * 把按键映射为目标 slide。
 * @param {string} key  KeyboardEvent.key
 * @param {number} storyCount  当前 stories.length
 * @returns {{type:'story'|'catalog', horizontalIndex:number} | null}
 */
export function keyToTarget(key, storyCount) {
  if (typeof key !== 'string' || key.length !== 1) return null;
  if (typeof storyCount !== 'number' || !Number.isFinite(storyCount) || storyCount <= 0) return null;
  if (!/^[0-9]$/.test(key)) return null;

  const digit = Number(key);
  if (digit === 0) {
    return { type: 'catalog', horizontalIndex: 1 };
  }
  if (digit > storyCount) return null;
  return { type: 'story', horizontalIndex: digit + 1 };
}

/**
 * 给 window 挂 keydown 监听，按数字键跳转。
 */
export function setupKeyboardShortcuts(stories, reveal) {
  window.addEventListener('keydown', (event) => {
    // 在输入框里不触发
    const tag = (event.target && event.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (event.target && event.target.isContentEditable) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const target = keyToTarget(event.key, stories.length);
    if (!target) return;
    event.preventDefault();
    reveal.slide(target.horizontalIndex, 0);
  });
}
