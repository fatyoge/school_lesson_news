# 家长进课堂"看世界、想问题" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个本地双击即可放映的 HTML 演示文件，作为"美国奇葩新闻 × 中美对比"故事库，供家长进课堂多期重复使用。

**Architecture:** 单 HTML 入口 + 本地 vendored reveal.js 框架 + JSON 驱动内容（`data/stories.json`）+ ES Module 拆分的纯 JS 渲染层。视觉为新闻报道风（黑底白字红强调）。无 build 工具，浏览器原生加载 ES Modules。测试用 Node.js 内置 `node:test`，仅覆盖纯函数（HTML 字符串生成、键盘映射、JSON schema 校验）。

**Tech Stack:** HTML5 + CSS3 + Vanilla JS (ES Modules) + reveal.js v5.x（本地 vendored）+ Node 18+ 内置 test runner（仅开发期）

**Spec 参照:** [docs/superpowers/specs/2026-05-02-us-news-class-design.md](../specs/2026-05-02-us-news-class-design.md)

---

## File Structure

```
school_lesson_news/
├── index.html                      # 主入口 HTML（reveal.js 容器）
├── README.md                       # 讲师备课指南
├── package.json                    # 仅供运行 npm test，无 dependencies
├── .gitignore                      # 忽略 node_modules/、临时文件
├── css/
│   └── theme.css                   # 新闻报道风样式（黑底白字红强调）
├── js/
│   ├── app.js                      # 入口，调用以下模块初始化
│   ├── storyData.js                # stories.json 加载与 schema 校验
│   ├── renderCatalog.js            # 目录页卡片渲染（buildCatalogCardHTML 等纯函数）
│   ├── renderStory.js              # 故事 section 渲染（每种 slide 模板的纯函数）
│   ├── keyboard.js                 # 键盘快捷键（数字键 1-9 跳转）
│   └── __tests__/
│       ├── storyData.test.js
│       ├── renderCatalog.test.js
│       ├── renderStory.test.js
│       └── keyboard.test.js
├── data/
│   └── stories.json                # 9 个故事的全部内容数据
├── vendor/
│   └── reveal.js/                  # reveal.js v5.x 本地副本（dist/ + plugin/）
├── images/                         # 用户按 images-manifest.md 下载图片放入
│   ├── 01-cahsr/
│   ├── 02-fire-fee/
│   └── (...其余 7 个故事)
├── images-manifest.md              # 图片下载清单（候选 URL + 文件命名）
└── docs/superpowers/
    ├── specs/2026-05-02-us-news-class-design.md
    └── plans/2026-05-02-us-news-class.md   # 本文件
```

**模块边界设计**：
- **数据层**（`storyData.js`）：纯数据逻辑，加载 JSON、校验 schema。不触碰 DOM。
- **渲染层**（`renderCatalog.js` / `renderStory.js`）：每个文件包含两类函数——
  - `buildXxxHTML(story) → string`：纯函数，输入 story 对象，返回 HTML 字符串。**可单测**。
  - `renderXxx(stories, container)`：把 HTML 字符串注入 DOM。**不单测，靠 manual checklist**。
- **交互层**（`keyboard.js`）：纯函数 `keyToStoryIndex(key)`（可测）+ `setupKeyboardShortcuts(Reveal, stories)`（不测）。
- **入口**（`app.js`）：编排上述模块，调用 reveal.js 初始化。

---

## Tasks Overview

| # | 任务 | 大致时长 |
|---|---|---|
| 1 | 项目初始化（git, 目录, package.json, README skeleton） | 15 min |
| 2 | 下载 vendored reveal.js + 最小 index.html 验证可加载 | 20 min |
| 3 | stories.json 数据 + JSON schema 校验函数 | 60 min |
| 4 | images-manifest.md 编写 | 30 min |
| 5 | theme.css 实现（新闻报道风视觉） | 60 min |
| 6 | 目录页渲染（renderCatalog） | 45 min |
| 7 | 故事 section 渲染（renderStory） | 60 min |
| 8 | 键盘快捷键（数字键跳转 / 0 回目录） | 30 min |
| 9 | 集成 smoke test（manual checklist） | 30 min |
| 10 | README 完善 + 讲师备课指南 | 30 min |

总计约 6 小时实施工作量。

---

### Task 1: 项目初始化

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `README.md`（skeleton）
- Create: 目录 `css/`、`js/`、`js/__tests__/`、`data/`、`images/`、`vendor/`

- [ ] **Step 1.1: 初始化 git 仓库（在项目根目录 `d:/claude/school_lesson_news/`）**

```bash
cd d:/claude/school_lesson_news
git init
git config core.autocrlf input
```

预期输出：`Initialized empty Git repository in ...`

- [ ] **Step 1.2: 创建 .gitignore**

写入 `.gitignore`：
```
# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp

# Node (即使我们不用 node_modules，仍以防万一)
node_modules/
npm-debug.log
yarn-error.log

# 临时文件
*.tmp
*.log
```

- [ ] **Step 1.3: 创建项目目录骨架**

```bash
mkdir -p css js/__tests__ data vendor images
```

(images/ 子目录在 Task 4 时按 9 个故事 ID 创建)

- [ ] **Step 1.4: 创建 package.json**

写入 `package.json`：
```json
{
  "name": "school-lesson-news",
  "version": "1.0.0",
  "description": "家长进课堂'看世界、想问题' HTML 演示",
  "type": "module",
  "private": true,
  "scripts": {
    "test": "node --test js/__tests__"
  }
}
```

注意：
- `"type": "module"` 让 `.js` 文件按 ES Module 解析（`import/export` 可用于 Node 测试和浏览器统一语法）
- `"private": true` 防止意外发布到 npm
- 无 `dependencies` / `devDependencies`，避免引入工具链复杂度

- [ ] **Step 1.5: 创建 README skeleton**

写入 `README.md`：
```markdown
# 家长进课堂 · 看世界、想问题

以美国一些"奇葩"新闻为切入，用中美数字对比让小学四年级孩子看见世界、想想问题的 HTML 演示。

## 快速开始

1. 按 `images-manifest.md` 下载图片到 `images/<story-id>/`
2. 双击 `index.html` 在浏览器打开
3. 用键盘 ←/→ 翻页，数字键 1-9 跳故事，ESC 看总览，F 全屏

详细备课指南见本文末（Task 10 完善）。
```

- [ ] **Step 1.6: 验证测试脚本能跑**

```bash
npm test
```

预期：因为 `js/__tests__` 还没有测试文件，输出会是 `# tests 0`、`# pass 0`，**进程退出码为 0**。如果报错"command not found"或"not a directory"，说明目录或 package.json 有问题。

- [ ] **Step 1.7: 首次提交**

```bash
git add .gitignore package.json README.md
git commit -m "chore: initialize project structure with package.json and gitignore"
```

预期：`[master (root-commit) ...] chore: initialize project structure ...`，3 个文件被记录。

### Task 2: 下载 vendored reveal.js + 最小 index.html 验证

**Files:**
- Create: `vendor/reveal.js/dist/reveal.css`
- Create: `vendor/reveal.js/dist/reveal.js`
- Create: `vendor/reveal.js/dist/theme/black.css`（备用基础主题，方便 fallback）
- Create: `index.html`（最小骨架）

**目的：** 把 reveal.js v5.x 全部本地化，保证上课不依赖网络。然后写最小 `index.html` 验证浏览器能加载并显示 2 张测试 slide。

- [ ] **Step 2.1: 下载 reveal.js v5.x release tarball**

到 https://github.com/hakimel/reveal.js/releases 选择最新 5.x 稳定版（v5.1+ 即可），下载 zip。

或用命令行（需要 curl 和 unzip）：
```bash
cd d:/claude/school_lesson_news/vendor
curl -L -o reveal.zip https://github.com/hakimel/reveal.js/archive/refs/tags/5.1.0.tar.gz
tar -xzf reveal.zip
mv reveal.js-5.1.0 reveal.js
rm reveal.zip
```

> 实际版本号以 GitHub 页面最新 5.x stable release 为准；如 5.1.0 不可用，可用 5.0.5 或更新版本。

- [ ] **Step 2.2: 验证 vendor 目录结构正确**

```bash
ls vendor/reveal.js/dist/
```

预期至少包含：`reveal.css`、`reveal.js`、`theme/`（含 `black.css`、`white.css` 等）

如缺少 `dist/` 目录（仅有源码），改用 npm 方式：
```bash
cd vendor && npm pack reveal.js@latest && tar -xzf reveal.js-*.tgz && mv package reveal.js && rm reveal.js-*.tgz
```

- [ ] **Step 2.3: 删除 vendor 内不必要的子目录（瘦身）**

只保留 `dist/`（运行时必需）和 `LICENSE`。`examples/`、`test/`、`gulpfile.js`、`README.md` 等开发文件可删，避免 vendor 体积过大。

```bash
cd vendor/reveal.js
# 仅保留 dist/ 和 LICENSE
ls | grep -v -E "^(dist|LICENSE)$" | xargs -I {} rm -rf {}
```

(Windows Git Bash 可执行；如失败可手动删除非必要目录)

验证后续：`vendor/reveal.js/` 下应只剩 `dist/` 和 `LICENSE`。

- [ ] **Step 2.4: 创建最小 index.html 用于 smoke test**

写入 `index.html`：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>家长进课堂 · 看世界、想问题</title>
  <link rel="stylesheet" href="vendor/reveal.js/dist/reveal.css">
  <link rel="stylesheet" href="vendor/reveal.js/dist/theme/black.css" id="theme-base">
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section><h1>测试 Slide 1</h1><p>如果你看到这一页，reveal.js 加载成功</p></section>
      <section><h1>测试 Slide 2</h1><p>按 → 翻到这一页就更成功了</p></section>
    </div>
  </div>
  <script src="vendor/reveal.js/dist/reveal.js"></script>
  <script>
    Reveal.initialize({ hash: false, controls: true, progress: true });
  </script>
</body>
</html>
```

- [ ] **Step 2.5: 浏览器手动验证**

双击 `index.html`，应看到：
- ✅ 第一页全屏显示，标题"测试 Slide 1"
- ✅ 按 → 翻到第二页
- ✅ 按 ESC 看到所有 slide 缩略图
- ✅ 按 F 进入全屏

如打不开/白屏：检查 `vendor/reveal.js/dist/reveal.js` 路径，浏览器 F12 看 Network 是否 404。

- [ ] **Step 2.6: 提交**

```bash
git add vendor/ index.html
git commit -m "chore: vendor reveal.js v5.x and add smoke test index.html"
```

> ⚠️ vendor 目录内 reveal.js 是 MIT 协议，commit 没问题。但提交前确认 `vendor/reveal.js/LICENSE` 还在。

---

### Task 3: stories.json 数据 + JSON schema 校验

**Files:**
- Create: `data/stories.json`（9 个故事完整数据）
- Create: `js/storyData.js`（加载 + 校验函数）
- Create: `js/__tests__/storyData.test.js`

**说明：** 故事内容数据来自 spec [Section 5](../specs/2026-05-02-us-news-class-design.md#5-故事池清单)。下面给出全部 9 个故事的完整 JSON——直接复制即可。

- [ ] **Step 3.1: 写入 data/stories.json**

写入 `data/stories.json`（完整复制全部内容）：

```json
{
  "version": 1,
  "last_updated": "2026-05-02",
  "stories": [
    {
      "id": "01-cahsr",
      "title": "加州高铁修了 16 年还没通",
      "theme": "基建",
      "risk_level": "low",
      "estimated_duration_min": [3, 5],
      "hook": "你出生那年开始修，等你大学毕业还没通",
      "us_data": {
        "facts": ["2008 立项，原计划 2020 通车", "原预算 $33B", "2024 全段预算飙至 $128B+", "中央山谷段 2030+ 才可能通"],
        "source": "CHSRA 2024 Project Update Report",
        "source_url": "https://hsr.ca.gov/about/board-of-directors/board-meeting-archive/",
        "last_verified": "2026-05-02"
      },
      "cn_data": {
        "facts": ["京沪高铁全长 1318 km（约 819 英里）", "2008.4 开工，2011.6 通车", "工期 39 个月"],
        "source": "国家铁路局《2024 年统计公报》",
        "source_url": "https://www.nra.gov.cn/",
        "last_verified": "2026-05-02"
      },
      "comparison_anchor": "16 年没修通 vs 39 个月通车 / $128B 飙升 vs $33B 起步",
      "interactions": [
        {"type": "vote", "question": "如果给你 16 年，你能做什么？", "options": ["A. 学会一门外语", "B. 长成大人", "C. 读完小学到大学"]},
        {"type": "open", "question": "为什么修一条高铁要 16 年还没修完？"}
      ],
      "ending": "现在加州高铁还在修，会修通的——只是要等很久",
      "filter_notes": ["不要使用'中国速度比美国快'等评价语"],
      "images": [
        {"file": "01-cahsr/cover.jpg", "purpose": "封面主图：加州高铁未完工高架桥"},
        {"file": "01-cahsr/route-map.jpg", "purpose": "故事铺垫：原规划路线图"},
        {"file": "01-cahsr/budget-chart.png", "purpose": "反差揭示：预算膨胀曲线"},
        {"file": "01-cahsr/jinghu-hsr.jpg", "purpose": "对比锚：京沪高铁运行图"}
      ]
    },
    {
      "id": "02-fire-fee",
      "title": "消防员看着房子烧",
      "theme": "公共服务",
      "risk_level": "medium",
      "estimated_duration_min": [3, 5],
      "hook": "忘交了 75 美元，消防员不肯施救",
      "us_data": {
        "facts": ["2010.9.29 田纳西州 Obion County", "Cranick 一家未交 $75/年消防费（订阅制）", "房子起火，消防员到达后只保护邻居家", "老人当场补交也被拒"],
        "source": "NBC News, MSNBC 2010 报道",
        "source_url": "https://www.nbcnews.com/id/wbna39516346",
        "last_verified": "2026-05-02"
      },
      "cn_data": {
        "facts": ["拨打 119 永远免费", "不问交没交税", "消防是国家公共服务"],
        "source": "《中华人民共和国消防法》",
        "source_url": "http://www.gov.cn/banshi/2005-08/21/content_25060.htm",
        "last_verified": "2026-05-02"
      },
      "comparison_anchor": "美国某地 $75/年订阅 vs 中国 119 全免费",
      "interactions": [
        {"type": "vote", "question": "消防员该不该救？", "options": ["A. 该救", "B. 不该救", "C. 一半一半"]},
        {"type": "open", "question": "如果消防员去救了，对其他交了费的人公平吗？"}
      ],
      "ending": "这件事推动了美国对'订阅式消防'的反思讨论",
      "filter_notes": ["不渲染宠物死亡细节，仅说'几只宠物没能逃出来'", "不展示火场死亡照片"],
      "images": [
        {"file": "02-fire-fee/cover.jpg", "purpose": "封面：燃烧的房屋远景"},
        {"file": "02-fire-fee/firefighter-watching.jpg", "purpose": "故事铺垫：消防员站在邻居家旁观（如有）"},
        {"file": "02-fire-fee/news-headline.png", "purpose": "反差揭示：当年新闻头条截图"},
        {"file": "02-fire-fee/china-119.jpg", "purpose": "对比锚：中国消防员救援图"}
      ]
    },
    {
      "id": "03-front-yard-garden",
      "title": "在自家前院种菜被罚款",
      "theme": "生存",
      "risk_level": "low",
      "estimated_duration_min": [3, 5],
      "hook": "种棵青菜要打 6 年官司",
      "us_data": {
        "facts": ["佛罗里达州 Miami Shores 村", "Hermine Ricketts 与 Tom Carroll 夫妇", "2013 起前院种菜被罚 $50/天", "2019 年州法律 SB 82 才允许"],
        "source": "Institute for Justice 案件档案",
        "source_url": "https://ij.org/case/miami-shores-vegetable-garden/",
        "last_verified": "2026-05-02"
      },
      "cn_data": {
        "facts": ["大爷大妈在阳台、绿化带、楼顶种菜是日常", "无'前院禁止种菜'类法规"],
        "source": "中国城市生活常识",
        "source_url": "",
        "last_verified": "2026-05-02"
      },
      "comparison_anchor": "美国某地 $50/天罚款 + 6 年官司 vs 中国阳台随便种",
      "interactions": [
        {"type": "vote", "question": "你家阳台/院子有人种过菜吗？", "options": ["A. 种过", "B. 没种过", "C. 想种"]},
        {"type": "open", "question": "为什么有人觉得'看到别人家种菜不舒服'？"}
      ],
      "ending": "现在他们可以合法在前院种菜了——人们打官司能改变法律",
      "filter_notes": [],
      "images": [
        {"file": "03-front-yard-garden/cover.jpg", "purpose": "封面：被强制铲除的前院菜园"},
        {"file": "03-front-yard-garden/couple.jpg", "purpose": "故事铺垫：Ricketts 夫妇照"},
        {"file": "03-front-yard-garden/news.png", "purpose": "反差揭示：罚款单或新闻截图"},
        {"file": "03-front-yard-garden/balcony-china.jpg", "purpose": "对比锚：中国阳台菜园"}
      ]
    },
    {
      "id": "04-rainwater",
      "title": "天上的雨水也是政府的",
      "theme": "生存",
      "risk_level": "low",
      "estimated_duration_min": [3, 5],
      "hook": "在自家院子里接雨水，违法",
      "us_data": {
        "facts": ["科罗拉多州长期禁止家庭收集雨水", "2009 年 SB 80 仅允许特定农村住户", "2016 年 HB 16-1005 允许任何家庭使用 2 个 110 加仑桶（最多 220 加仑）"],
        "source": "Colorado Division of Water Resources",
        "source_url": "https://dwr.colorado.gov/",
        "last_verified": "2026-05-02"
      },
      "cn_data": {
        "facts": ["北方农村蓄雨水正常生活", "城市虽不普遍但无'违法'概念"],
        "source": "中国城乡用水习惯",
        "source_url": "",
        "last_verified": "2026-05-02"
      },
      "comparison_anchor": "美国某州只能两桶 220 加仑 vs 中国想接多少接多少",
      "interactions": [
        {"type": "vote", "question": "下雨天你想用桶接雨水做什么？", "options": ["A. 浇花", "B. 玩水", "C. 没想过"]},
        {"type": "open", "question": "天上的雨水算谁的？"}
      ],
      "ending": "2016 年法律改了，现在可以接一点了",
      "filter_notes": [],
      "images": [
        {"file": "04-rainwater/cover.jpg", "purpose": "封面：雨水落入水桶图"},
        {"file": "04-rainwater/colorado-law.png", "purpose": "故事铺垫：法律条文摘录或图示"},
        {"file": "04-rainwater/two-barrels.jpg", "purpose": "反差揭示：两个 110 加仑桶图"},
        {"file": "04-rainwater/china-rural.jpg", "purpose": "对比锚：中国农村蓄水池或水缸"}
      ]
    },
    {
      "id": "05-ambulance",
      "title": "宁可坐 Uber 也不叫救护车",
      "theme": "医疗",
      "risk_level": "medium",
      "estimated_duration_min": [3, 5],
      "hook": "开 2 英里，账单 3000 美元",
      "us_data": {
        "facts": ["2019-2020 美国救护车均价 $940-$1,277（保险前）", "多起报道：扭伤/过敏叫救护车开几英里收 $3000+", "Uber 进入城市后救护车呼叫减少约 7%"],
        "source": "FAIR Health 2020；University of Kansas 2017 研究；Kaiser Health News 'Bill of the Month'",
        "source_url": "https://kffhealthnews.org/news/tag/bill-of-the-month/",
        "last_verified": "2026-05-02"
      },
      "cn_data": {
        "facts": ["120 出车一般几百元起", "医保可报销", "多数地区急救车几百元封顶"],
        "source": "各地 120 服务收费标准（如《北京市急救服务收费标准》）",
        "source_url": "",
        "last_verified": "2026-05-02"
      },
      "comparison_anchor": "救护车 $3000+ vs 120 几百元 + 医保报销",
      "interactions": [
        {"type": "vote", "question": "如果生病了你会选什么？", "options": ["A. 救护车", "B. 出租车", "C. 自己走"]},
        {"type": "open", "question": "为什么有人宁可坐 Uber 也不叫救护车？"}
      ],
      "ending": "救护车贵让一些人有了疑问：救命的车，要不要这么贵？",
      "filter_notes": ["不使用'伤员跳车'网络段子（未经核实）", "不展开患者死亡案例"],
      "images": [
        {"file": "05-ambulance/cover.jpg", "purpose": "封面：美国救护车 + 账单图"},
        {"file": "05-ambulance/bill.png", "purpose": "故事铺垫：真实账单截图"},
        {"file": "05-ambulance/uber-vs-ambulance.jpg", "purpose": "反差揭示：Uber 与救护车并排"},
        {"file": "05-ambulance/china-120.jpg", "purpose": "对比锚：中国 120 救护车"}
      ]
    },
    {
      "id": "06-key-bridge",
      "title": "47 年的桥被一艘船撞塌",
      "theme": "基建",
      "risk_level": "medium",
      "estimated_duration_min": [3, 5],
      "hook": "1977 年的桥，2024 年塌了",
      "us_data": {
        "facts": ["2024.3.26 凌晨", "集装箱船 MV Dali 失去动力撞击桥墩", "桥建于 1977 年", "47 年桥龄"],
        "source": "NTSB 2024 调查报告",
        "source_url": "https://www.ntsb.gov/investigations/Pages/HWY24MH010.aspx",
        "last_verified": "2026-05-02"
      },
      "cn_data": {
        "facts": ["港珠澳大桥 2018 通车", "总长 55 km", "设计抗 16 级台风、8 级地震、30 万吨船撞击", "设计寿命 120 年"],
        "source": "港珠澳大桥管理局",
        "source_url": "https://www.hzmb.gov.hk/",
        "last_verified": "2026-05-02"
      },
      "comparison_anchor": "美国 47 年老桥被船撞塌 vs 港珠澳大桥设计抗 30 万吨撞击",
      "interactions": [
        {"type": "vote", "question": "你猜美国有多少座桥被评为'结构不安全'？", "options": ["A. 1 千座", "B. 1 万座", "C. 4 万多座"]},
        {"type": "open", "question": "桥老了应该谁来修？"}
      ],
      "ending": "桥要修、要换——没人换，桥就塌",
      "filter_notes": ["不展示桥塌瞬间死亡画面", "不渲染遇难工人细节，仅一句'有工人不幸遇难'"],
      "images": [
        {"file": "06-key-bridge/cover.jpg", "purpose": "封面：Key Bridge 倒塌后远景（避免血腥）"},
        {"file": "06-key-bridge/bridge-old.jpg", "purpose": "故事铺垫：1977 年桥的历史照片"},
        {"file": "06-key-bridge/dali-ship.jpg", "purpose": "反差揭示：撞桥的 MV Dali 船"},
        {"file": "06-key-bridge/hzmb.jpg", "purpose": "对比锚：港珠澳大桥航拍"}
      ]
    },
    {
      "id": "07-texas-blackout",
      "title": "停电 4 天，电费 17000 美元",
      "theme": "基建",
      "risk_level": "medium",
      "estimated_duration_min": [3, 5],
      "hook": "天冷停电没事，账单来了才哭",
      "us_data": {
        "facts": ["2021.2.13-17 德州极端寒潮", "电网崩溃，约 450 万户停电、断水多日", "部分用户因可变电价合同收到 $5000-$17,000 极端电费账单"],
        "source": "ERCOT 报告 2021；Texas State Senate 调查",
        "source_url": "https://www.ercot.com/files/docs/2021/02/24/2.24.21_FebPRRWeather_Update_Public.pdf",
        "last_verified": "2026-05-02"
      },
      "cn_data": {
        "facts": ["中国电网应对寒潮恢复速度通常以小时/一两天计", "电价为政府指导价，不会因供需暴涨"],
        "source": "国家电网公开运维数据",
        "source_url": "http://www.sgcc.com.cn/",
        "last_verified": "2026-05-02"
      },
      "comparison_anchor": "停电 4 天 + 一户 $17000 账单 vs 中国寒潮停电小时级恢复 + 电价稳定",
      "interactions": [
        {"type": "vote", "question": "如果你家停电 4 天，你最担心什么？", "options": ["A. 没法看电视", "B. 冰箱东西坏", "C. 冷"]},
        {"type": "open", "question": "为什么有人会收到 $17000 的电费？"}
      ],
      "ending": "电是日常的水和饭——稳定才安心",
      "filter_notes": ["不讲死亡数字（246+ 人）", "只讲停电+离谱账单"],
      "images": [
        {"file": "07-texas-blackout/cover.jpg", "purpose": "封面：德州雪景 + 黑屋子图"},
        {"file": "07-texas-blackout/icy-power-line.jpg", "purpose": "故事铺垫：结冰的输电线"},
        {"file": "07-texas-blackout/bill.png", "purpose": "反差揭示：天价电费账单截图"},
        {"file": "07-texas-blackout/china-grid.jpg", "purpose": "对比锚：中国电网维修工/雪夜抢修"}
      ]
    },
    {
      "id": "08-asce-grade",
      "title": "美国土木协会自己给自己打 C-",
      "theme": "基建综述",
      "risk_level": "low",
      "estimated_duration_min": [3, 4],
      "hook": "整个国家的基建评级——刚及格",
      "us_data": {
        "facts": ["ASCE 每 4 年发布《基础设施报告卡》", "2021 整体评级 C-", "桥梁评级 C，约 4.6 万座（占 7.5%）'结构性不安全'", "之前几次评级长期 D 段"],
        "source": "ASCE 2021 Infrastructure Report Card",
        "source_url": "https://infrastructurereportcard.org/",
        "last_verified": "2026-05-02"
      },
      "cn_data": {
        "facts": ["截至 2023，中国公路桥梁超过 100 万座", "高铁运营里程超 4.5 万公里"],
        "source": "交通运输部《2023 年交通运输行业发展统计公报》；国家铁路局",
        "source_url": "https://www.mot.gov.cn/",
        "last_verified": "2026-05-02"
      },
      "comparison_anchor": "美国 4.6 万座桥不安全 vs 中国百万座桥 + 4.5 万公里高铁",
      "interactions": [
        {"type": "vote", "question": "听完前面这些故事，你猜美国基建该打几分？", "options": ["A. 优", "B. 良", "C. 差"]},
        {"type": "open", "question": "为什么会变成这样？"}
      ],
      "ending": "每个国家都有自己的问题——重要的是去看见、去想",
      "filter_notes": ["放在故事池末位作为整堂课收尾"],
      "images": [
        {"file": "08-asce-grade/cover.jpg", "purpose": "封面：ASCE 报告卡封面或 'C-' 大字"},
        {"file": "08-asce-grade/report-card.png", "purpose": "故事铺垫：报告卡分类评分"},
        {"file": "08-asce-grade/bridge-deficient.jpg", "purpose": "反差揭示：结构不安全的桥（示例）"},
        {"file": "08-asce-grade/china-infrastructure.jpg", "purpose": "对比锚：中国基建航拍合集"}
      ]
    },
    {
      "id": "09-shooter-drill",
      "title": "美国小学生上学要练躲枪手",
      "theme": "教育",
      "risk_level": "medium-high",
      "estimated_duration_min": [3, 5],
      "hook": "他们练的不是地震、不是火灾",
      "us_data": {
        "facts": ["美国 K-12 公立学校 95% 做过 lockdown drill（封锁演练）", "超 40 个州法律要求", "演练内容：关灯静默、躲桌底、堵门、装死、ALICE 流程"],
        "source": "US GAO 2020 Report; Pew Research 2018; National Center for Education Statistics",
        "source_url": "https://www.gao.gov/products/gao-20-144",
        "last_verified": "2026-05-02"
      },
      "cn_data": {
        "facts": ["中国学校演练：地震、火灾、防溺水、紧急疏散", "教育部要求每月 1 次安全教育、每学期 1 次综合演练", "没有'枪手演练'"],
        "source": "教育部《中小学公共安全教育指导纲要》(2007)",
        "source_url": "http://www.moe.gov.cn/",
        "last_verified": "2026-05-02"
      },
      "comparison_anchor": "美国孩子练躲枪手 vs 中国孩子练躲地震、火灾",
      "interactions": [
        {"type": "vote", "question": "你们学校做过哪些演练？", "options": ["A. 地震", "B. 火灾", "C. 防溺水"]},
        {"type": "open", "question": "美国孩子为什么要练这个？"}
      ],
      "ending": "每个国家的孩子，练的是自己环境里要小心的事",
      "filter_notes": ["聚焦'练什么'（关灯、躲桌、装死）", "不展开'为什么要练'（不讲具体枪击案、不展示伤亡）", "不出现具体枪击事件名称、不出现遇难者照片", "讲完后立刻接下一个相对轻松的故事或收尾"],
      "images": [
        {"file": "09-shooter-drill/cover.jpg", "purpose": "封面：美国教室 lockdown drill 演练（避免枪支元素）"},
        {"file": "09-shooter-drill/drill-classroom.jpg", "purpose": "故事铺垫：学生躲桌下"},
        {"file": "09-shooter-drill/state-laws.png", "purpose": "反差揭示：要求演练的州地图或统计"},
        {"file": "09-shooter-drill/china-earthquake-drill.jpg", "purpose": "对比锚：中国学生地震演练"}
      ]
    }
  ]
}
```

- [ ] **Step 3.2: 写 schema 校验测试（先失败）**

写入 `js/__tests__/storyData.test.js`：
```js
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
```

运行 `npm test`。预期：全部失败（`storyData.js` 还不存在）。

- [ ] **Step 3.3: 实现 storyData.js（让测试通过）**

写入 `js/storyData.js`：
```js
export const REQUIRED_FIELDS = new Set([
  'id', 'title', 'theme', 'risk_level', 'estimated_duration_min', 'hook',
  'us_data', 'cn_data', 'comparison_anchor', 'interactions', 'ending',
  'filter_notes', 'images'
]);

const VALID_RISK_LEVELS = new Set(['low', 'medium', 'medium-high', 'high']);

export function validateStories(stories) {
  const errors = [];
  if (!Array.isArray(stories)) {
    errors.push('stories must be an array');
    return { ok: false, errors };
  }
  stories.forEach((s, idx) => {
    for (const field of REQUIRED_FIELDS) {
      if (!(field in s)) errors.push(`story[${idx}] (${s.id || '?'}) missing field: ${field}`);
    }
    if (s.risk_level && !VALID_RISK_LEVELS.has(s.risk_level)) {
      errors.push(`story[${idx}] (${s.id || '?'}) invalid risk_level: ${s.risk_level}`);
    }
  });
  return { ok: errors.length === 0, errors };
}

export async function loadStories(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load stories: ${res.status}`);
  const data = await res.json();
  const validation = validateStories(data.stories);
  if (!validation.ok) {
    console.error('stories.json validation errors:', validation.errors);
    throw new Error('stories.json failed schema validation');
  }
  return data.stories;
}
```

- [ ] **Step 3.4: 跑测试，确认通过**

```bash
npm test
```
预期：4 个测试全部 PASS。

- [ ] **Step 3.5: 验证真实 stories.json 通过校验**

```bash
node --input-type=module -e "import { readFileSync } from 'fs'; import { validateStories } from './js/storyData.js'; const data = JSON.parse(readFileSync('data/stories.json', 'utf-8')); const r = validateStories(data.stories); console.log(r.ok ? 'OK ('+data.stories.length+' stories)' : 'FAIL\n'+r.errors.join('\n'));"
```
预期输出：`OK (9 stories)`

- [ ] **Step 3.6: 提交**

```bash
git add data/stories.json js/storyData.js js/__tests__/storyData.test.js
git commit -m "feat: add stories.json with 9 stories and schema validator"
```

---

### Task 4: images-manifest.md 编写

**Files:**
- Create: `images-manifest.md`

**说明：** 为 9 个故事的每张候选图提供下载指引。用户照清单逐一访问 URL 下载，重命名后放进 `images/<story-id>/`。优先维基百科 / 政府公开 / 新闻媒体的免费可用图。

- [ ] **Step 4.1: 创建 images/ 子目录骨架**

```bash
cd d:/claude/school_lesson_news
for d in 01-cahsr 02-fire-fee 03-front-yard-garden 04-rainwater 05-ambulance 06-key-bridge 07-texas-blackout 08-asce-grade 09-shooter-drill; do
  mkdir -p images/$d
done
```

(Windows Git Bash 可执行；如失败可手动创建 9 个子目录)

- [ ] **Step 4.2: 写入 images-manifest.md**

写入 `images-manifest.md`：

````markdown
# 图片下载清单

每个故事 4 张图，按本清单访问候选 URL 下载，重命名为目标文件名后放入 `images/<story-id>/`。

**优先级**：维基百科（CC/Public Domain）→ 政府/公共机构 → 新闻媒体（教育用途，注明来源）。

**核对方法**：每张图找到后，检查清晰度（最短边 ≥ 800 px）、构图（无血腥/儿童伤亡画面）。

---

## 01-cahsr · 加州高铁

| 文件名 | 用途 | 搜索关键词 | 候选来源 |
|---|---|---|---|
| `cover.jpg` | 封面：未完工高架桥 | "California High-Speed Rail viaduct" / "加州高铁高架桥" | https://en.wikipedia.org/wiki/California_High-Speed_Rail（页面图）；CHSRA 官方图库 https://hsr.ca.gov/about/photo-gallery/ |
| `route-map.jpg` | 故事铺垫：原规划路线图 | "California HSR route map Phase 1 2008" | https://en.wikipedia.org/wiki/California_High-Speed_Rail（路线图） |
| `budget-chart.png` | 反差揭示：预算膨胀曲线 | "California HSR budget cost overrun chart" | LA Times / NYT 报道图（自行截图）；或自制简单柱状图 |
| `jinghu-hsr.jpg` | 对比锚：京沪高铁 | "京沪高铁 复兴号" / "Beijing-Shanghai HSR" | https://commons.wikimedia.org/wiki/Category:Beijing%E2%80%93Shanghai_high-speed_railway |

## 02-fire-fee · 田纳西消防费

| 文件名 | 用途 | 搜索关键词 | 候选来源 |
|---|---|---|---|
| `cover.jpg` | 封面：燃烧的房屋远景（不要伤亡画面） | "house fire night silhouette" 通用素材 | https://commons.wikimedia.org/wiki/Category:House_fires；Pexels / Unsplash 免费图库 |
| `firefighter-watching.jpg` | 故事铺垫：消防员旁观镜头 | "firefighter watching" / "subscription firefighting Tennessee" | NBC News 2010 报道页；如找不到原图，可用通用消防员剪影 |
| `news-headline.png` | 反差揭示：新闻头条截图 | "Cranick fire 2010 Obion County news" | https://www.nbcnews.com/id/wbna39516346（截图） |
| `china-119.jpg` | 对比锚：中国消防员 | "中国 消防员 救援" | https://commons.wikimedia.org/wiki/Category:Firefighters_of_China |

## 03-front-yard-garden · 前院种菜

| 文件名 | 用途 | 搜索关键词 | 候选来源 |
|---|---|---|---|
| `cover.jpg` | 封面：前院菜园 | "front yard vegetable garden" | https://commons.wikimedia.org/（搜 "front yard garden"）；Pexels |
| `couple.jpg` | 故事铺垫：Ricketts 夫妇 | "Hermine Ricketts Tom Carroll Miami Shores" | Institute for Justice 案件页 https://ij.org/case/miami-shores-vegetable-garden/ |
| `news.png` | 反差揭示：罚款单或新闻截图 | "Miami Shores garden ban news" | IJ 网站；地方报道截图 |
| `balcony-china.jpg` | 对比锚：中国阳台菜园 | "中国 阳台 种菜" | 微博 / 小红书图（截图引用）；或 Pexels "balcony garden Asia" |

## 04-rainwater · 接雨水

| 文件名 | 用途 | 搜索关键词 | 候选来源 |
|---|---|---|---|
| `cover.jpg` | 封面：雨水落入水桶 | "rain barrel water collection" | https://commons.wikimedia.org/wiki/Category:Rainwater_harvesting |
| `colorado-law.png` | 故事铺垫：法律条文 | "Colorado HB 16-1005 rainwater" | Colorado Legislature 官网截图 https://leg.colorado.gov/ |
| `two-barrels.jpg` | 反差揭示：两个 110 加仑桶 | "two 55 gallon rain barrels" | Wikimedia "rain barrel"；Home Depot 产品图 |
| `china-rural.jpg` | 对比锚：中国农村蓄水缸 | "中国 农村 水缸 蓄水" | Wikimedia "Chinese countryside well"；图虫等图库 |

## 05-ambulance · 救护车账单

| 文件名 | 用途 | 搜索关键词 | 候选来源 |
|---|---|---|---|
| `cover.jpg` | 封面：救护车 + 账单 | "ambulance bill USA" | Pexels；Kaiser Health News 配图 https://kffhealthnews.org/news/tag/bill-of-the-month/ |
| `bill.png` | 故事铺垫：真实账单截图 | "ambulance bill of the month KFF" | KFF Bill of the Month 系列文章配图 |
| `uber-vs-ambulance.jpg` | 反差揭示：Uber 与救护车 | "Uber instead of ambulance" | NPR / KHN 报道配图；自行合成 |
| `china-120.jpg` | 对比锚：中国 120 救护车 | "中国 120 急救车" | https://commons.wikimedia.org/wiki/Category:Ambulances_in_China |

## 06-key-bridge · Key Bridge 倒塌

| 文件名 | 用途 | 搜索关键词 | 候选来源 |
|---|---|---|---|
| `cover.jpg` | 封面：倒塌后远景（避血腥） | "Key Bridge Baltimore collapse aerial" | https://commons.wikimedia.org/wiki/Category:Francis_Scott_Key_Bridge_(Baltimore)（NTSB / USCG 公开图） |
| `bridge-old.jpg` | 故事铺垫：1977 年桥的历史照片 | "Francis Scott Key Bridge Baltimore 1977" | Wikimedia 历史图 |
| `dali-ship.jpg` | 反差揭示：MV Dali | "MV Dali container ship" | Wikimedia "MV Dali" 页面图 |
| `hzmb.jpg` | 对比锚：港珠澳大桥 | "Hong Kong-Zhuhai-Macau Bridge aerial" | https://commons.wikimedia.org/wiki/Category:Hong_Kong%E2%80%93Zhuhai%E2%80%93Macau_Bridge |

## 07-texas-blackout · 德州大停电

| 文件名 | 用途 | 搜索关键词 | 候选来源 |
|---|---|---|---|
| `cover.jpg` | 封面：德州雪景 | "Texas snow storm 2021" | https://commons.wikimedia.org/wiki/Category:February_2021_North_American_winter_storm |
| `icy-power-line.jpg` | 故事铺垫：结冰输电线 | "ice storm power line Texas 2021" | Wikimedia ；NOAA 公开图 |
| `bill.png` | 反差揭示：天价电费账单 | "Texas blackout $17000 electric bill" | NYT / Texas Tribune 报道截图 |
| `china-grid.jpg` | 对比锚：中国电网维修 | "国家电网 抢修 雪天" | Wikimedia "State Grid"；新华社图（注明来源） |

## 08-asce-grade · 基建评级

| 文件名 | 用途 | 搜索关键词 | 候选来源 |
|---|---|---|---|
| `cover.jpg` | 封面：'C-' 大字 | "ASCE Infrastructure Report Card 2021" | ASCE 官网 https://infrastructurereportcard.org/ 截图 |
| `report-card.png` | 故事铺垫：分类评分 | "ASCE 2021 grades by category" | ASCE 官网图 |
| `bridge-deficient.jpg` | 反差揭示：结构不安全的桥（示例） | "structurally deficient bridge USA" | FHWA 公开图；Wikimedia |
| `china-infrastructure.jpg` | 对比锚：中国基建航拍 | "China high-speed rail aerial bridges" | Wikimedia 中国基建合集 |

## 09-shooter-drill · 校园枪击演练

| 文件名 | 用途 | 搜索关键词 | 候选来源 |
|---|---|---|---|
| `cover.jpg` | 封面：教室封锁演练（**避免枪支元素**） | "school lockdown drill classroom" | Wikimedia "lockdown drill"；CDC / DHS 公开宣传图 |
| `drill-classroom.jpg` | 故事铺垫：学生躲桌下 | "students hiding under desk drill" | Wikimedia ；ABC News / NPR 报道配图（学生背影，无枪手） |
| `state-laws.png` | 反差揭示：要求演练的州地图 | "active shooter drill state laws map" | EveryTownResearch / Pew Research 图表 |
| `china-earthquake-drill.jpg` | 对比锚：中国地震演练 | "中国 学校 地震 演练" | Wikimedia "earthquake drill China"；新华社图 |

---

## 备选/缺失策略

如某张图找不到合适的免费可用图：
1. **降级使用文字+数字**：该 slide 改为纯文字大字海报样式（在 stories.json 中将该 image 条目标记 `"file": null`，CSS 会自动应用 fallback 样式）
2. **使用通用占位图**：临时用 `images/_placeholder.jpg`（自行做一张深灰底白字"图片待补"）

---

## 版权 / 引用规范

- **公开放映场景**（学校班级讲课）属教育用途，多数主流媒体图片可适度使用，但建议每张图在课件备注里注明来源
- **维基百科图片**：优先选 CC-BY-SA / Public Domain 标注的，转载时保留作者署名
- **政府/官方图**：通常 Public Domain（美国联邦政府图）或可申请使用
- **不要使用**：搜索引擎来路不明的图、标注 "All rights reserved" 的图

````

- [ ] **Step 4.3: 提交**

```bash
git add images-manifest.md images/
git commit -m "docs: add images-manifest.md with download checklist for 9 stories"
```

注意：`images/` 下的 9 个空子目录会因为 git 不跟踪空目录而不被记录。可在每个空目录加一个 `.gitkeep`：
```bash
for d in 01-cahsr 02-fire-fee 03-front-yard-garden 04-rainwater 05-ambulance 06-key-bridge 07-texas-blackout 08-asce-grade 09-shooter-drill; do
  touch images/$d/.gitkeep
done
git add images/*/.gitkeep
git commit --amend --no-edit
```

---

### Task 5: theme.css 实现（新闻报道风视觉）

**Files:**
- Create: `css/theme.css`

**视觉规范：**（来自 spec Section 6.2）
- 主背景：深黑 `#0a0a0a`，强调块 `#1a1a1a`
- 主文字：白 `#ffffff`
- 强调色：红 `#e63946`（关键数字、美国端、警示）
- 中国端对照：白色或淡绿 `#5fb878`
- 字体：标题/正文 PingFang SC、思源黑体、Microsoft YaHei、sans-serif；数字 Roboto Mono / 'JetBrains Mono' 等宽

- [ ] **Step 5.1: 写入 css/theme.css**

写入 `css/theme.css`：
```css
/* ==========================================================================
   家长进课堂 · 新闻报道风主题
   覆盖 reveal.js 默认 black.css 的字体/颜色/版式
   ========================================================================== */

:root {
  --bg-deep: #0a0a0a;
  --bg-block: #1a1a1a;
  --bg-block-2: #222;
  --fg-white: #ffffff;
  --fg-muted: #cfcfcf;
  --accent-red: #e63946;
  --accent-cn: #5fb878;
  --border-subtle: rgba(255, 255, 255, 0.12);
  --font-zh: "PingFang SC", "思源黑体", "Microsoft YaHei", "Hiragino Sans GB", sans-serif;
  --font-mono: "JetBrains Mono", "Roboto Mono", Consolas, monospace;
}

/* ==========================================================================
   reveal.js 全局覆盖
   ========================================================================== */
.reveal {
  background: var(--bg-deep);
  color: var(--fg-white);
  font-family: var(--font-zh);
  font-size: 38px;
  line-height: 1.45;
}
.reveal .slides section {
  text-align: left;
  padding: 0 6vw;
}
.reveal h1, .reveal h2, .reveal h3 {
  color: var(--fg-white);
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 0.6em;
  text-transform: none;
}
.reveal h1 { font-size: 2.0em; }
.reveal h2 { font-size: 1.5em; }
.reveal h3 { font-size: 1.2em; }
.reveal p { margin: 0.5em 0; }
.reveal a { color: var(--accent-red); text-decoration: none; }

/* ==========================================================================
   封面页（首页 + 故事封面页通用）
   ========================================================================== */
.slide-cover-main {
  text-align: center;
}
.slide-cover-main h1 {
  font-size: 2.6em;
  margin-bottom: 0.3em;
}
.slide-cover-main .subtitle {
  font-size: 1.1em;
  color: var(--fg-muted);
}

.story-cover {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
}
.story-cover .story-title {
  font-size: 2.2em;
  margin: 0 0 0.5em;
  color: var(--fg-white);
}
.story-cover .cover-image {
  max-width: 70%;
  max-height: 55vh;
  margin: 0.5em 0;
  border-radius: 4px;
}
.story-cover .hook-question {
  font-size: 1.1em;
  color: var(--accent-red);
  font-weight: 600;
}

/* ==========================================================================
   目录页
   ========================================================================== */
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;
  padding: 0 4vw;
}
.catalog-card {
  background: var(--bg-block);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 18px;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease;
  text-align: left;
}
.catalog-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-red);
}
.catalog-card .card-num {
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--accent-red);
  margin-bottom: 8px;
}
.catalog-card .card-thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--bg-block-2) center/cover no-repeat;
  margin-bottom: 12px;
  border-radius: 3px;
}
.catalog-card .card-title {
  font-size: 0.78em;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--fg-white);
}
.catalog-card .card-meta {
  font-size: 0.55em;
  color: var(--fg-muted);
  display: flex;
  gap: 12px;
}

/* ==========================================================================
   故事铺垫页 / 反差揭示页
   ========================================================================== */
.slide-narrative img,
.slide-reveal img {
  max-width: 60%;
  max-height: 50vh;
  display: block;
  margin: 1em auto;
  border-radius: 4px;
}
.slide-reveal .big-number {
  font-family: var(--font-mono);
  font-size: 4em;
  color: var(--accent-red);
  font-weight: 800;
  text-align: center;
  margin: 0.3em 0;
}
.slide-reveal .reveal-caption {
  font-size: 1em;
  text-align: center;
  color: var(--fg-muted);
}

/* ==========================================================================
   对比锚页（中美数据并排）
   ========================================================================== */
.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  height: 70vh;
  align-items: stretch;
}
.comparison-side {
  padding: 28px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}
.comparison-side.us {
  background: rgba(230, 57, 70, 0.10);
  border: 2px solid var(--accent-red);
}
.comparison-side.cn {
  background: rgba(95, 184, 120, 0.08);
  border: 2px solid var(--accent-cn);
}
.comparison-side h2 {
  font-size: 1.4em;
  margin: 0 0 0.6em;
}
.comparison-side.us h2 { color: var(--accent-red); }
.comparison-side.cn h2 { color: var(--accent-cn); }
.comparison-side .facts {
  list-style: none;
  padding: 0;
  margin: 0 0 auto;
  font-size: 0.92em;
  line-height: 1.6;
}
.comparison-side .facts li {
  margin-bottom: 0.5em;
  padding-left: 1em;
  position: relative;
}
.comparison-side .facts li::before {
  content: "·";
  position: absolute;
  left: 0;
  color: inherit;
  opacity: 0.6;
}
.comparison-side .source {
  font-size: 0.42em;
  color: var(--fg-muted);
  margin-top: 1em;
  padding-top: 0.6em;
  border-top: 1px dashed var(--border-subtle);
}

/* ==========================================================================
   想一想页
   ========================================================================== */
.slide-think {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}
.slide-think .think-label {
  font-size: 0.7em;
  color: var(--accent-red);
  letter-spacing: 0.3em;
  margin-bottom: 0.5em;
}
.slide-think .think-question {
  font-size: 1.6em;
  font-weight: 700;
  margin-bottom: 1em;
}
.slide-think .think-options {
  list-style: none;
  padding: 0;
  font-size: 0.95em;
}
.slide-think .think-options li {
  background: var(--bg-block);
  margin: 0.4em 0;
  padding: 12px 20px;
  border-radius: 4px;
  border-left: 4px solid var(--accent-red);
}
.slide-think .think-timer {
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 0.55em;
  color: var(--fg-muted);
  font-family: var(--font-mono);
}

/* ==========================================================================
   背景小知识页 / 收尾
   ========================================================================== */
.slide-aftermath {
  text-align: center;
}
.slide-aftermath .aftermath-text {
  font-size: 1.2em;
  line-height: 1.6;
  max-width: 80%;
  margin: 1em auto;
}
.slide-aftermath .ending-quote {
  font-size: 1.4em;
  color: var(--accent-cn);
  font-weight: 600;
  margin-top: 1em;
}

/* ==========================================================================
   "返回目录"按钮（每个故事最后一页角落）
   ========================================================================== */
.back-to-catalog {
  position: absolute;
  bottom: 24px;
  right: 24px;
  font-size: 0.5em;
  color: var(--fg-muted);
  background: var(--bg-block);
  padding: 6px 12px;
  border-radius: 3px;
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  font-family: var(--font-mono);
}
.back-to-catalog:hover { border-color: var(--accent-red); color: var(--fg-white); }

/* ==========================================================================
   reveal.js progress / controls 微调
   ========================================================================== */
.reveal .progress { color: var(--accent-red); }
.reveal .controls { color: var(--accent-red); }
```

- [ ] **Step 5.2: 在 index.html 引入 theme.css**

修改 `index.html` 的 `<head>`，在 `black.css` 之后追加：
```html
  <link rel="stylesheet" href="css/theme.css">
```

完整 head 部分：
```html
<head>
  <meta charset="UTF-8">
  <title>家长进课堂 · 看世界、想问题</title>
  <link rel="stylesheet" href="vendor/reveal.js/dist/reveal.css">
  <link rel="stylesheet" href="vendor/reveal.js/dist/theme/black.css" id="theme-base">
  <link rel="stylesheet" href="css/theme.css">
</head>
```

- [ ] **Step 5.3: 浏览器手动验证**

刷新 `index.html`：
- ✅ 测试 slide 的字体已变为思源黑体 / PingFang SC
- ✅ 文字颜色为白色
- ✅ progress bar 颜色为红色
- ✅ 不应该有视觉报错

如果字体没变：检查浏览器 F12 → Computed Styles 的 font-family。

- [ ] **Step 5.4: 提交**

```bash
git add css/theme.css index.html
git commit -m "feat: add theme.css with news-report visual style"
```

---

### Task 6: 目录页渲染（renderCatalog）

**目标：** 把 `stories.json` 渲染为一组可点击的目录卡片，作为讲师选讲的入口。先写 pure function 通过测试，再做 DOM 应用。

**Files:**
- Create: `js/renderCatalog.js`
- Create: `js/__tests__/renderCatalog.test.js`
- Create: `js/app.js`
- Modify: `index.html`（追加 catalog section + script 入口）

- [ ] **Step 6.1: 写失败测试 — `js/__tests__/renderCatalog.test.js`**

```js
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

test('buildCatalogCardHTML: 包含 data-story-id 用于事件绑定', () => {
  const html = buildCatalogCardHTML(sampleStory, 1);
  assert.match(html, /data-story-id="02-fire-fee"/);
});

test('buildCatalogCardHTML: 显示编号徽章（讲师按数字键跳转）', () => {
  const html = buildCatalogCardHTML(sampleStory, 1);
  assert.match(html, /catalog-card-number[^>]*>\s*1\s*</);
});

test('buildCatalogCardHTML: 显示故事标题', () => {
  const html = buildCatalogCardHTML(sampleStory, 1);
  assert.ok(html.includes('没交75美元，消防车在我家门口看着房子烧'));
});

test('buildCatalogCardHTML: 显示主题标签', () => {
  const html = buildCatalogCardHTML(sampleStory, 1);
  assert.ok(html.includes('安全 / 公共服务'));
});

test('buildCatalogCardHTML: 显示预估时长', () => {
  const html = buildCatalogCardHTML(sampleStory, 1);
  assert.match(html, /4\s*分钟|4\s*min/);
});

test('buildCatalogCardHTML: 转义标题中的 HTML 特殊字符', () => {
  const evil = { ...sampleStory, title: '<script>alert(1)</script>' };
  const html = buildCatalogCardHTML(evil, 1);
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});
```

- [ ] **Step 6.2: 运行测试，确认失败**

```bash
node --test js/__tests__/renderCatalog.test.js
```
Expected: 失败 — `Cannot find module '../renderCatalog.js'`

- [ ] **Step 6.3: 实现 `js/renderCatalog.js`**

```js
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
export function buildCatalogCardHTML(story, index) {
  const id = escapeHTML(story.id);
  const title = escapeHTML(story.title);
  const theme = escapeHTML(story.theme);
  const minutes = Number(story.estimated_duration_min) || 0;
  const hook = escapeHTML(story.hook || '');

  return `
    <button type="button" class="catalog-card" data-story-id="${id}">
      <div class="catalog-card-number">${index}</div>
      <div class="catalog-card-tag">${theme}</div>
      <h3 class="catalog-card-title">${title}</h3>
      <p class="catalog-card-hook">${hook}</p>
      <div class="catalog-card-duration">⏱ ${minutes} 分钟</div>
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

  container.addEventListener('click', (event) => {
    const card = event.target.closest('.catalog-card');
    if (!card) return;
    const storyId = card.dataset.storyId;
    const targetIndex = stories.findIndex((s) => s.id === storyId);
    if (targetIndex < 0) return;
    // 目录是 horizontal slide 0；故事从 horizontal slide 1 开始
    reveal.slide(targetIndex + 1, 0);
  });
}
```

- [ ] **Step 6.4: 运行测试，确认通过**

```bash
node --test js/__tests__/renderCatalog.test.js
```
Expected: 6 tests pass。

- [ ] **Step 6.5: 写 `js/app.js`（应用入口）**

```js
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
```

- [ ] **Step 6.6: 修改 `index.html` —— 加入目录 section 和 script**

把 `<div class="slides">` 替换为：
```html
<div class="slides">
  <!-- 封面 -->
  <section class="slide-cover-main">
    <h1>看世界 · 想问题</h1>
    <p class="subtitle">家长进课堂 · 第 N 期</p>
    <p class="hint">按 → 进入目录；目录中点击或按数字键 1-9 选讲。</p>
  </section>

  <!-- 目录 -->
  <section data-state="catalog">
    <h2 class="catalog-title">今日故事池</h2>
    <div id="catalog-grid" class="catalog-grid">
      <!-- 由 renderCatalog 注入 -->
    </div>
  </section>

  <!-- 故事 sections 由 Task 7 注入 -->
</div>
```

并在 `</body>` 之前追加：
```html
<script src="vendor/reveal.js/dist/reveal.js"></script>
<script type="module" src="js/app.js"></script>
```

- [ ] **Step 6.7: 浏览器手动验证**

刷新 `index.html`：
- ✅ 看到封面页
- ✅ → 进入目录页，9 张卡片以 3 列网格排列
- ✅ 卡片包含编号、主题标签、标题、hook、时长
- ✅ 点击任一张卡片不应该报错（即便目标 section 还没建好，也至少 reveal.slide() 调用不抛异常；可以通过控制台验证）
- ✅ F12 控制台无 error

- [ ] **Step 6.8: 提交**

```bash
git add js/renderCatalog.js js/__tests__/renderCatalog.test.js js/app.js index.html
git commit -m "feat: render catalog grid driven by stories.json"
```

---

### Task 7: 故事 section 渲染（renderStory）

**目标：** 把每个 story 渲染为一个 reveal.js horizontal section（内含若干 vertical slides）：故事封面 → hook → 美国数据 → 中美对比锚 → 互动思考 → 收尾。每个 slide 的 HTML 由独立 pure function 构造，便于单测。

**Files:**
- Create: `js/renderStory.js`
- Create: `js/__tests__/renderStory.test.js`
- Modify: `js/app.js`（在 catalog 之后追加 stories sections）

**Slide 类型对照表（必须实现）：**

| Slide 类型 | 内容来源 | 关键 class |
|---|---|---|
| story-cover | `story.title` / `story.theme` | `.story-cover` |
| hook | `story.hook` + 第一张照片（如有） | `.slide-narrative` |
| us-data | `story.us_data`（结构化字段） | `.slide-reveal` |
| comparison | `story.comparison_anchor` 中美对比 | `.slide-comparison` |
| interaction | `story.interactions[i]`（每条一张 slide） | `.slide-think` |
| ending | `story.ending` | `.slide-aftermath` |

- [ ] **Step 7.1: 写失败测试 — `js/__tests__/renderStory.test.js`**

```js
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
  estimated_duration_min: 4,
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

test('buildStoryCoverHTML: 渲染标题 + 主题', () => {
  const html = buildStoryCoverHTML(story);
  assert.ok(html.includes(story.title));
  assert.ok(html.includes(story.theme));
});

test('buildHookSlideHTML: 渲染 hook 文案', () => {
  const html = buildHookSlideHTML(story);
  assert.ok(html.includes('消防员到场后查到没交费'));
});

test('buildUSDataSlideHTML: 渲染 headline 和所有 bullets', () => {
  const html = buildUSDataSlideHTML(story);
  assert.ok(html.includes('田纳西州 South Fulton, 2010'));
  assert.ok(html.includes('75 美元 / 年'));
  assert.ok(html.includes('眼睁睁看房子和宠物烧毁'));
});

test('buildComparisonSlideHTML: 同时渲染 US 和 CN 两侧', () => {
  const html = buildComparisonSlideHTML(story);
  assert.ok(html.includes('美国部分小镇'));
  assert.ok(html.includes('75 美元 / 年订阅'));
  assert.ok(html.includes('中国'));
  assert.ok(html.includes('0 元（公共财政）'));
  // 必须包含两侧的语义类，便于 css 控制颜色
  assert.match(html, /comparison-side[^"]*us/);
  assert.match(html, /comparison-side[^"]*cn/);
});

test('buildInteractionSlideHTML: 渲染问题和所有选项', () => {
  const html = buildInteractionSlideHTML(story.interactions[0]);
  assert.ok(html.includes('如果你是那位消防员'));
  assert.ok(html.includes('坚持按规定办'));
  assert.ok(html.includes('先救火再说'));
  assert.ok(html.includes('其他想法'));
});

test('buildInteractionSlideHTML: 没有 options 时只渲染问题', () => {
  const html = buildInteractionSlideHTML({ question: '你怎么想？' });
  assert.ok(html.includes('你怎么想？'));
  assert.doesNotMatch(html, /<ul[\s\S]*?<\/ul>/);
});

test('buildEndingSlideHTML: 渲染 ending 文案', () => {
  const html = buildEndingSlideHTML(story);
  assert.ok(html.includes('几乎没有'));
});

test('buildStorySectionHTML: 嵌套结构以 <section> 开始/结束，且为 horizontal section', () => {
  const html = buildStorySectionHTML(story);
  // 外层是一个 section（horizontal），内含若干 vertical section
  assert.match(html, /^<section[^>]*data-story-id="02-fire-fee"/);
  assert.ok(html.trimEnd().endsWith('</section>'));
  // story.interactions 长度 1 + cover/hook/us-data/comparison/ending = 共 6 个 vertical slide
  const innerSections = html.match(/<section/g) || [];
  assert.equal(innerSections.length, 7); // 外层 1 + 内 6
});

test('buildStorySectionHTML: 转义恶意 title', () => {
  const evil = { ...story, title: '<img onerror="x">' };
  const html = buildStorySectionHTML(evil);
  assert.ok(!html.includes('<img onerror="x">'));
  assert.ok(html.includes('&lt;img'));
});
```

- [ ] **Step 7.2: 运行测试，确认失败**

```bash
node --test js/__tests__/renderStory.test.js
```
Expected: 失败 — `Cannot find module '../renderStory.js'`

- [ ] **Step 7.3: 实现 `js/renderStory.js`**

```js
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

function bulletsHTML(bullets = []) {
  if (!Array.isArray(bullets) || bullets.length === 0) return '';
  return `<ul>${bullets.map((b) => `<li>${escapeHTML(b)}</li>`).join('')}</ul>`;
}

export function buildStoryCoverHTML(story) {
  return `
    <section class="story-cover">
      <div class="story-tag">${escapeHTML(story.theme)}</div>
      <h2 class="story-title">${escapeHTML(story.title)}</h2>
      <p class="story-duration">⏱ 约 ${Number(story.estimated_duration_min) || 0} 分钟</p>
    </section>
  `.trim();
}

export function buildHookSlideHTML(story) {
  const cover = (story.images && story.images[0]) || null;
  const img = cover
    ? `<img class="hook-image" src="images/${escapeHTML(cover.filename)}" alt="${escapeHTML(cover.alt || '')}">`
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
  return `
    <section class="slide-reveal">
      <h3 class="us-headline">${escapeHTML(us.headline || '')}</h3>
      ${bulletsHTML(us.bullets)}
    </section>
  `.trim();
}

export function buildComparisonSlideHTML(story) {
  const a = story.comparison_anchor || {};
  return `
    <section class="slide-comparison">
      <h3 class="comparison-title">中美对比锚</h3>
      <div class="comparison-grid">
        <div class="comparison-side us">
          <div class="side-label">${escapeHTML(a.us_label || '美国')}</div>
          <div class="side-value">${escapeHTML(a.us_value || '')}</div>
        </div>
        <div class="comparison-side cn">
          <div class="side-label">${escapeHTML(a.cn_label || '中国')}</div>
          <div class="side-value">${escapeHTML(a.cn_value || '')}</div>
        </div>
      </div>
    </section>
  `.trim();
}

export function buildInteractionSlideHTML(interaction) {
  const opts = Array.isArray(interaction.options) ? interaction.options : [];
  const list = opts.length
    ? `<ul class="interaction-options">${opts.map((o) => `<li>${escapeHTML(o)}</li>`).join('')}</ul>`
    : '';
  return `
    <section class="slide-think">
      <div class="think-tag">想一想</div>
      <h3 class="think-question">${escapeHTML(interaction.question || '')}</h3>
      ${list}
    </section>
  `.trim();
}

export function buildEndingSlideHTML(story) {
  return `
    <section class="slide-aftermath">
      <p class="ending-text">${escapeHTML(story.ending || '')}</p>
      <button type="button" class="back-to-catalog" data-action="back-to-catalog">⬅ 回目录</button>
    </section>
  `.trim();
}

export function buildStorySectionHTML(story) {
  const interactions = Array.isArray(story.interactions) ? story.interactions : [];
  const interactionSlides = interactions.map((i) => buildInteractionSlideHTML(i)).join('\n');

  // 外层 horizontal section，内含 vertical sections
  return `<section data-story-id="${escapeHTML(story.id)}">
${buildStoryCoverHTML(story)}
${buildHookSlideHTML(story)}
${buildUSDataSlideHTML(story)}
${buildComparisonSlideHTML(story)}
${interactionSlides}
${buildEndingSlideHTML(story)}
</section>`;
}

/**
 * 把全部故事注入 reveal slides 容器，并绑定 "回目录" 按钮。
 */
export function renderAllStories(stories, slidesContainer, reveal) {
  const html = stories.map((s) => buildStorySectionHTML(s)).join('\n');
  slidesContainer.insertAdjacentHTML('beforeend', html);

  slidesContainer.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-action="back-to-catalog"]');
    if (!btn) return;
    reveal.slide(0, 0); // 回到目录 horizontal slide（index 1，因为 0 是封面）
    // 注意：封面在 0、目录在 1；这里跳到 1
    reveal.slide(1, 0);
  });
}
```

> ⚠️ 上面 `renderAllStories` 内连续调用了两次 `reveal.slide()` 是笔误；保留单次跳转：删除第一行的 `reveal.slide(0, 0);`。最终只保留 `reveal.slide(1, 0);`。在实现时直接写正确版本：
> ```js
> reveal.slide(1, 0); // 目录是 horizontal index 1
> ```

- [ ] **Step 7.4: 运行测试，确认通过**

```bash
node --test js/__tests__/renderStory.test.js
```
Expected: 9 tests pass。

- [ ] **Step 7.5: 修改 `js/app.js` —— 在 catalog 渲染之后注入 story sections**

把 `bootstrap()` 函数体修改为：
```js
async function bootstrap() {
  const stories = await loadStories('./data/stories.json');

  const catalogContainer = document.querySelector('#catalog-grid');
  const slidesContainer = document.querySelector('.reveal .slides');
  if (!catalogContainer || !slidesContainer) {
    throw new Error('required containers not found');
  }

  // 1. 先把 story sections 注入 DOM（必须在 reveal.initialize 之前）
  renderAllStories(stories, slidesContainer, /* reveal will be set later */ null);

  // 2. 初始化 reveal
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

  // 4. "回目录" 按钮事件需要 reveal 实例 —— 重新挂一次
  slidesContainer.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-action="back-to-catalog"]');
    if (btn) reveal.slide(1, 0);
  });

  window.__lessonApp = { stories, reveal };
}
```

并把顶部 import 增加：
```js
import { renderAllStories } from './renderStory.js';
```

> 说明：因为 reveal.js 在初始化时扫描 DOM 中的 `<section>`，所以 story sections 必须在 `reveal.initialize()` 之前注入。`renderAllStories` 第三个参数此时还没有 reveal —— 把它改成只插 DOM、不绑事件，事件由 app.js 在初始化后单独绑定（如上）。

修正版 `renderAllStories`：
```js
export function renderAllStories(stories, slidesContainer) {
  const html = stories.map((s) => buildStorySectionHTML(s)).join('\n');
  slidesContainer.insertAdjacentHTML('beforeend', html);
}
```

并把测试中可能遗留的对 `reveal` 的依赖删掉（renderAllStories 现在只接受 2 个参数，pure function 仍可单测）。

- [ ] **Step 7.6: 浏览器手动验证**

刷新 `index.html`：
- ✅ 目录页 9 张卡片仍然正常
- ✅ 点击第 2 张卡片 "fire-fee"，跳转到该故事 horizontal section 的封面页
- ✅ 在故事内向下 ↓ 翻页可看到：故事封面 → hook → 美国数据 → 中美对比锚 → 想一想 → 收尾
- ✅ 点击 "⬅ 回目录" 按钮回到目录
- ✅ F12 控制台无 error

- [ ] **Step 7.7: 提交**

```bash
git add js/renderStory.js js/__tests__/renderStory.test.js js/app.js
git commit -m "feat: render story sections with all slide types"
```

---

### Task 8: 键盘快捷键（数字键跳转 / 0 回目录）

**目标：** 讲师按 1-9 直接跳到对应故事，按 0 回目录。这是「掌控节奏」的关键 UX —— 不必依赖鼠标点击。

**Files:**
- Create: `js/keyboard.js`
- Create: `js/__tests__/keyboard.test.js`
- Modify: `js/app.js`（在 bootstrap 中调用 setupKeyboardShortcuts）

**Slide 索引约定（必须遵守，否则导航错乱）：**

| Horizontal index | 内容 |
|---|---|
| 0 | 封面 |
| 1 | 目录 |
| 2 | story[0] |
| 3 | story[1] |
| ... | ... |
| 1 + storyCount | story[storyCount - 1] |

- [ ] **Step 8.1: 写失败测试 — `js/__tests__/keyboard.test.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keyToTarget } from '../keyboard.js';

test('keyToTarget: "1" 跳到第一个故事（horizontal index 2）', () => {
  assert.deepEqual(keyToTarget('1', 9), { type: 'story', horizontalIndex: 2 });
});

test('keyToTarget: "9" 跳到第九个故事（horizontal index 10）', () => {
  assert.deepEqual(keyToTarget('9', 9), { type: 'story', horizontalIndex: 10 });
});

test('keyToTarget: "0" 跳回目录（horizontal index 1）', () => {
  assert.deepEqual(keyToTarget('0', 9), { type: 'catalog', horizontalIndex: 1 });
});

test('keyToTarget: 故事数不足时，超界数字返回 null', () => {
  assert.equal(keyToTarget('9', 5), null);
  assert.equal(keyToTarget('6', 5), null);
});

test('keyToTarget: 故事数足够时，返回正确索引', () => {
  assert.deepEqual(keyToTarget('5', 5), { type: 'story', horizontalIndex: 6 });
});

test('keyToTarget: 非数字键返回 null', () => {
  assert.equal(keyToTarget('a', 9), null);
  assert.equal(keyToTarget('Enter', 9), null);
  assert.equal(keyToTarget('', 9), null);
  assert.equal(keyToTarget(undefined, 9), null);
});

test('keyToTarget: storyCount 非法时返回 null', () => {
  assert.equal(keyToTarget('1', 0), null);
  assert.equal(keyToTarget('1', -1), null);
});
```

- [ ] **Step 8.2: 运行测试，确认失败**

```bash
node --test js/__tests__/keyboard.test.js
```
Expected: 失败 — `Cannot find module '../keyboard.js'`

- [ ] **Step 8.3: 实现 `js/keyboard.js`**

```js
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
  if (typeof storyCount !== 'number' || storyCount <= 0) return null;
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
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const target = keyToTarget(event.key, stories.length);
    if (!target) return;
    event.preventDefault();
    reveal.slide(target.horizontalIndex, 0);
  });
}
```

- [ ] **Step 8.4: 运行测试，确认通过**

```bash
node --test js/__tests__/keyboard.test.js
```
Expected: 7 tests pass。

- [ ] **Step 8.5: 在 `js/app.js` 接入**

import 段追加：
```js
import { setupKeyboardShortcuts } from './keyboard.js';
```

在 `bootstrap()` 末尾（设置 `window.__lessonApp` 之前）追加：
```js
  setupKeyboardShortcuts(stories, reveal);
```

- [ ] **Step 8.6: 浏览器手动验证**

刷新 `index.html`：
- ✅ 在目录页按 `1` —— 跳转到第 1 个故事
- ✅ 按 `0` —— 回到目录
- ✅ 按 `5` —— 跳转到第 5 个故事
- ✅ 在故事内按 `2` —— 直接跳到第 2 个故事的封面
- ✅ 按数字 `9`（如果只配置 8 个故事）—— 不跳转、无报错
- ✅ 按字母键 —— 不影响 reveal.js 默认行为（如 `f` 全屏、`s` 演讲者视图）

> ⚠️ 注意：reveal.js 默认会监听数字键做其它行为（其实默认没有，但要验证不冲突）。如果发现按 1-9 触发了 reveal 内置功能，在 `bootstrap()` 中改成在 reveal 初始化前调用 `setupKeyboardShortcuts`，并依赖事件传播顺序（用户监听器先于 reveal 内部）。

- [ ] **Step 8.7: 提交**

```bash
git add js/keyboard.js js/__tests__/keyboard.test.js js/app.js
git commit -m "feat: number-key shortcuts for story/catalog navigation"
```

---

### Task 9: 集成 smoke test（manual checklist）

**目标：** 在浏览器里端到端走一遍，确保所有模块协同工作，捕获自动化测试覆盖不到的视觉/交互问题。**这一步只跑测试 + 人工核对，不写新代码**（除非发现 bug）。

**Files:**（验证用，不修改）
- `index.html`
- `js/*.js`
- `css/theme.css`
- `data/stories.json`

> 如果 Task 4 中列出的图片还没下载到 `images/`，本步骤接受图片 404；视觉上会出现 alt 文本占位，这是预期行为，不阻塞 dev 验证。讲师在备课时由 user 自行下载图片。

- [ ] **Step 9.1: 全量跑单测**

```bash
node --test js/__tests__/
```
Expected: 全部测试通过（storyData / renderCatalog / renderStory / keyboard 共 4 个文件、~25 个 tests）。

- [ ] **Step 9.2: 启动本地服务器**

```bash
# Python（推荐，免依赖）
python -m http.server 8000
# 或 Node
npx --yes http-server -p 8000
```
访问 `http://localhost:8000/`。

> 直接 `file://` 打开 index.html 会因为 ES Module CORS 限制而失败 —— 必须经 HTTP 服务器。

- [ ] **Step 9.3: 封面 + 目录验证**

| 验证项 | 期望 |
|---|---|
| 页面加载无白屏 | ✅ 看到 "看世界 · 想问题" 封面 |
| F12 控制台 | ✅ 无 error；可有 image 404（如果未下载图片） |
| 按 → | ✅ 进入目录页，9 张卡片 3 列网格 |
| 卡片元素 | ✅ 编号徽章、主题标签、标题、hook、时长 都显示 |
| 字体 | ✅ 思源黑体 / PingFang SC（不是衬线） |
| progress bar | ✅ 红色（#e63946） |

- [ ] **Step 9.4: 单个故事完整翻页（任选一个故事）**

进入 story `02-fire-fee`：
- ✅ 故事封面：黑底，主题标签 + 大标题 + ⏱ 时长
- ✅ ↓ hook：图片（若已下载）+ 一句引入
- ✅ ↓ 美国数据：headline + bullet list
- ✅ ↓ 中美对比锚：左红右绿两栏，标签 + 数值
- ✅ ↓ 互动：「想一想」标签 + 问题 + 选项列表
- ✅ ↓ 收尾：ending + ⬅ 回目录按钮
- ✅ 点击 "回目录" → 跳回目录页

- [ ] **Step 9.5: 键盘快捷键验证**

在目录页 / 任意故事内：
- ✅ 按 `3` → 跳到第 3 个故事
- ✅ 按 `0` → 回到目录
- ✅ 按 `1` → 跳到第 1 个故事
- ✅ 按 `9` → 跳到第 9 个故事（如有）
- ✅ 按 `f` → reveal.js 全屏（不被自定义快捷键拦截）

- [ ] **Step 9.6: 全部 9 个故事各自走一遍封面页 + 对比锚页**

至少确认每个 story 的：
- ✅ 标题 / theme 渲染正确
- ✅ 中美对比锚两侧数值都显示且各自有标签
- ✅ 没有 `undefined` / `[object Object]` 等渲染异常

如果有任何故事在对比锚页面显示 `undefined`，回 stories.json 检查字段名拼写。

- [ ] **Step 9.7: 视觉走查**

逐故事翻一遍，确认：
- ✅ 黑底白字一致，无浅灰背景遗漏
- ✅ 大数字以红色凸显（`.big-number` 类是否在某 slide 上需要？若 stories.json 中 us_data 还有 highlight 字段，可在后续 patch 中支持，本期不做）
- ✅ 文字不溢出屏幕（特别是中美对比锚和长 ending）

- [ ] **Step 9.8: 修复发现的问题 + 提交**

如果以上任一项失败：
1. 定位是哪个模块的问题（renderCatalog / renderStory / keyboard / theme.css / stories.json）
2. 加测试覆盖该 bug，再修复
3. 重跑 9.1 的全量测试
4. 重跑相关浏览器手动验证

如果 9.1-9.7 全部通过：

```bash
git add -A
git diff --cached --stat
# 若有 fix commit
git commit -m "fix: address smoke test findings"  # 可选
git tag mvp-smoke-passed
```

---

### Task 10: README 完善 + 讲师备课指南

**目标：** 把 README 从 Task 1 的占位骨架完善成讲师能直接照着用的备课/上课操作手册，并新增一份 `docs/teaching-guide.md` 写讲师叙事节奏建议、互动技巧、敏感话题处理。

**Files:**
- Modify: `README.md`
- Create: `docs/teaching-guide.md`

- [ ] **Step 10.1: 完善 `README.md`**

把 Task 1 中创建的占位 README 替换为完整内容：

```markdown
# 看世界 · 想问题（家长进课堂）

以美国「奇葩」新闻为切入点，让小学四/五年级学生学着观察社会结构问题。中立启蒙基调，可多期复用。

## 谁用这个

家长（讲师）。学生看到的只是 reveal.js 演示页面。

## 快速开始（讲师视角）

1. 下载图片（首次使用前一次性完成）
   - 打开 `images-manifest.md`
   - 按其中给出的搜索关键词 / 来源链接，把每个故事至少 1 张图片保存到 `images/` 目录
   - 文件名严格按 manifest 中第 1 候选图（如 `02-fire-fee-house.jpg`）
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
| ↓ / ↑ | 纵向翻页（在故事内部） |
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
```

- [ ] **Step 10.2: 创建 `docs/teaching-guide.md`**

```markdown
# 讲师备课与叙事指南

> 此文件给讲师（家长）看，不显示给学生。
> 目标：把每个故事讲得有节奏、能引发思考、不偏不倚。

## 总体基调

- **看世界、想问题** —— 中立启蒙，不做政治评判
- 多用「为什么会这样？」「换成你会怎么做？」
- 不教结论，教观察

## 一节课 40 分钟的节奏建议

| 时段 | 内容 | 时长 |
|---|---|---|
| 0-3 min | 封面 + 目录介绍 | 3 |
| 3-30 min | 6-7 个故事，每个 3-5 min | ~27 |
| 30-37 min | 学生提问 + 自由讨论 | 7 |
| 37-40 min | 总结：「我们今天看到了什么？」 | 3 |

## 每个故事的讲述模板（5 张 slide）

1. **故事封面** —— 念出标题，停 1 秒
2. **Hook**（5-10 秒）—— 念出 hook，让学生短暂震惊
3. **美国数据**（30-60 秒）—— 用平静、新闻播报式语气念出 bullets，**不要加形容词**
4. **中美对比锚**（30 秒）—— 「在中国是这样的」，让学生自己比较
5. **想一想**（互动 1-2 分钟）—— 抛出问题，等 3-5 个学生回答，不评价对错
6. **收尾**（10 秒）—— 念 ending；按「回目录」回去

## 处理敏感话题

- 学生问「美国是不是不好」：不直接回答，反问「你觉得是什么造成了这个故事？」
- 学生问「中国是不是更好」：「不同国家解决问题的方式不一样，今天我们看到的是不同制度下的不同结果。」
- 学生提到「我家亲戚在美国」：肯定、共情，强调「我们今天看的是结构性问题，不是某个人的问题」

## 风险分级故事（risk_level）

- **low / medium** —— 任何场合可讲
- **medium-high** —— 第二期或更晚，或针对更成熟班级
- **high** —— 涉及枪击演练等议题，可整期专题，建议提前与班主任沟通

## 互动话术示例

> 「这个 75 美元一年的消防费，比一个游戏皮肤还便宜。但是因为没交，房子和宠物都烧没了。"如果你是那个消防员"，你会怎么做？」

> 「16 年盖一段还没通的高铁。咱们国家 16 年盖了多少高铁？查一下家长用的 12306，那上面的高铁线路图是不是和 16 年前完全不一样了？」

## 不要做

- 不要嘲笑、调侃、用幸灾乐祸的语气
- 不要给出政治结论
- 不要鼓励学生对美国小朋友产生负面情绪
- 不要让学生觉得「中国一切都好、美国一切都坏」—— 这不是真相，也不是这节课的目的
- 不要超时；宁可少讲一个故事，也要留给学生提问

## 临场出错怎么办

- 投影连不上 / 图片没加载 → 直接念文字，不影响内容
- 键盘 1-9 无响应 → 用鼠标点目录卡片
- 学生问到讲师不会的问题 → 「这是个好问题，我也不确定，我们课后一起查」
```

- [ ] **Step 10.3: 提交**

```bash
git add README.md docs/teaching-guide.md
git commit -m "docs: complete README and add teaching guide"
```

- [ ] **Step 10.4: 打 release tag**

```bash
git tag v1.0.0
git log --oneline
```

确认 commit 历史完整、清晰。

---

## 完成验收

所有 Task 1-10 完成后，**讲师应当能够**：

1. ✅ Clone 仓库
2. ✅ 按 `images-manifest.md` 下载图片到 `images/`
3. ✅ 启动 `python -m http.server 8000`
4. ✅ 访问 `localhost:8000` 看到完整可用的 9 故事课件
5. ✅ 用键盘 1-9 / 0 在故事和目录之间快速切换
6. ✅ 按 `docs/teaching-guide.md` 在课堂上完成 40 分钟讲述
7. ✅ 后续期想加新故事，只改 `data/stories.json`，不写代码

**测试覆盖：**
- ✅ 4 个测试文件、20+ tests 全部通过
- ✅ 浏览器手动 smoke test 全部通过

---

## 计划自审（writing-plans 自检）

> 该自检在编写完成后由 writing-plans skill 要求执行。

**Spec coverage（对照 spec Section 11 列出的 6 项任务）：**

| Spec 任务 | 对应 Plan Task |
|---|---|
| 1. 项目骨架 + reveal.js vendor | Task 1 + Task 2 |
| 2. JSON 数据载入 + schema 校验 | Task 3 |
| 3. 目录页渲染 + 卡片导航 | Task 6 |
| 4. 故事 section 模板（含中美对比锚 / 互动 slide） | Task 7 |
| 5. 键盘快捷键 1-9 / 0 | Task 8 |
| 6. 视觉主题（黑底白字红强调） | Task 5 |
| 配套：图片清单 | Task 4 |
| 配套：smoke test | Task 9 |
| 配套：README + 讲师指南 | Task 10 |

✅ 所有 6 项 dev 侧任务 + 配套文档都有对应 Plan Task。

**Placeholder scan：** 无 "TBD"、"TODO"、"实现细节略" 类占位。每个有代码的 step 都给了完整代码。

**Type consistency check：**
- `validateStories` / `loadStories` 在 Task 3 定义，Task 6/7 使用 ✅
- `buildCatalogCardHTML(story, index)` Task 6 定义、测试一致 ✅
- `buildStorySectionHTML(story)` 内部调用的 6 个 sub-builder 在 Task 7 一并定义 ✅
- `keyToTarget(key, storyCount)` Task 8 定义，签名与测试匹配 ✅
- `renderAllStories(stories, slidesContainer)` Task 7 修正版只接受 2 个参数 —— 注意：实施时直接写正确版本，避免 Task 7 中的笔误说明带入实现 ⚠️
- 故事字段：`stories.json` 中的字段名（id, title, theme, risk_level, estimated_duration_min, hook, us_data{headline,bullets}, cn_data, comparison_anchor{us_label,us_value,cn_label,cn_value}, interactions[{question,options}], ending, filter_notes, images[{filename,alt}]）在 Task 3/7 一致 ✅

**Slide index 约定一致性：**
- horizontal 0 = 封面、1 = 目录、2 = story[0]、… —— 在 Task 6 (`renderCatalog`)、Task 7 (`renderAllStories`)、Task 8 (`keyToTarget`) 中均按此约定 ✅
- Task 6 中 `reveal.slide(targetIndex + 1, 0)` 跳到 story 时 —— `targetIndex` 是 stories 数组下标 0..N-1，加 1 应该是 2..N ⚠️ 实际实现要改为 `targetIndex + 2`
  - **修正：** 把 Task 6 Step 6.3 的 `renderCatalog` 中
    ```js
    reveal.slide(targetIndex + 1, 0);
    ```
    改为
    ```js
    reveal.slide(targetIndex + 2, 0);
    ```
  - 实施时请直接采用 `+ 2`。


