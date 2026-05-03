# 看世界 · 想问题（家长进课堂）

以美国「奇葩」新闻为切入点，让小学四/五年级学生学着观察社会结构问题。中立启蒙基调，可多期复用。

## 谁用这个

家长（讲师）。学生看到的只是 reveal.js 演示页面。

## 快速开始（讲师视角）

1. 下载图片（首次使用前一次性完成）
   - 打开 `images-manifest.md`
   - 按其中给出的搜索关键词 / 来源链接，把每个故事至少 1 张图片保存到 `images/` 目录
   - 文件名严格按 manifest 中第 1 候选图（如 `02-fire-fee/cover.jpg`）
2. 启动本地服务器
   ```bash
   python -m http.server 8000
   ```
3. 浏览器访问 `http://localhost:8000/`
4. 投影到教室屏幕，按 `f` 进入全屏

## 上课时的快捷键

| 键 | 行为 |
|---|---|
| → / ← | 横向翻页 |
| ↓ / ↑ | 纵向翻页（在故事内部）|
| 1-9 | 直接跳转到对应编号的故事 |
| 0 | 回目录 |
| f | 全屏切换 |
| Esc | 鸟瞰模式 |

## 怎么调整内容

- 修改某个故事的文案 / 数据 / 选项 → 编辑 `data/stories.json`
- 删除某个故事 → 从 `data/stories.json` 数组里移除
- 新增故事 → 复制一个已有故事对象，改 id / 字段，确保 risk_level 在 ['low','medium','medium-high','high'] 之内
- 改视觉 → 编辑 `css/theme.css`
- 不需要构建步骤；保存即可在浏览器刷新生效

## 多期使用

每期讲 6-7 个故事。讲师按当期听众反应选讲：
- 第一期建议讲 risk_level=low/medium 的故事，先建立信任
- 第二期可以加入 medium-high 的故事
- high 风险故事（涉及枪击演练）需家长讲师自行判断，可单独用一期专题

## 跑测试

```bash
node --test js/__tests__/
```
要求 Node 18+。无 npm 依赖。

## 项目结构

```
.
├── index.html              # reveal.js 入口
├── data/stories.json       # 故事池（9 个故事 + 中美对比数据）
├── js/
│   ├── app.js              # 应用入口
│   ├── storyData.js        # JSON 加载 + schema 校验
│   ├── renderCatalog.js    # 目录页渲染
│   ├── renderStory.js      # 故事 section 渲染
│   ├── keyboard.js         # 数字键导航
│   └── __tests__/          # 单元测试
├── css/theme.css           # 视觉主题（黑底白字红强调）
├── images/                 # 真实新闻图片（讲师本地下载）
├── images-manifest.md      # 图片下载清单
├── vendor/reveal.js/       # reveal.js v5.x（已 vendor）
└── docs/teaching-guide.md  # 讲师备课/叙事指南
```

## 设计依据

完整 spec：`docs/superpowers/specs/2026-05-02-us-news-class-design.md`
实施计划：`docs/superpowers/plans/2026-05-02-us-news-class.md`
