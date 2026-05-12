# MD to WeChat - Markdown 公众号排版编辑器

> 📝 一款轻量级、可离线使用的 Markdown 转微信公众号排版编辑器。支持多种主题风格、实时预览、一键复制到公众号。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-6-646cff.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)

---

## 📋 目录

- [功能特性](#功能特性)
- [在线体验](#在线体验)
- [安装说明](#安装说明)
- [使用指南](#使用指南)
- [主题预览](#主题预览)
- [项目结构](#项目结构)
- [技术栈](#技术栈)
- [安全说明](#安全说明)
- [常见问题](#常见问题)
- [更新日志](#更新日志)

---

## ✨ 功能特性

- 🎨 **4 种精美主题**：默认（橙心）、优雅极简、极客科技、诗意国风
- ✏️ **双栏实时编辑**：左侧 Markdown 编辑，右侧即时预览
- 📱 **公众号适配模式**：自动将外链转为脚注、过滤纯黑文字、适配微信样式
- 📂 **支持导入文件**：可导入 `.md`、`.markdown`、`.txt` 文件
- 📋 **一键复制 HTML**：直接粘贴到微信公众号编辑器
- 💾 **下载 HTML 文件**：导出完整 HTML 用于本地备份
- 🔒 **纯前端实现**：数据不上传服务器，保护内容隐私
- ⚡ **轻量快速**：基于 Vite + React，启动快、响应快

---

## 🌐 在线体验

无需安装，直接访问：
> （如需部署到服务器，请参考下方【安装说明】）

---

## 📦 安装说明

### 环境要求

| 依赖 | 最低版本 |
|------|---------|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 9.0.0 |

> 推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理 Node.js 版本

### 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/cscsxx606/md-to-wechat.git

# 2. 进入项目目录
cd md-to-wechat

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev
```

启动成功后，浏览器自动打开 http://localhost:5173

### 构建生产版本

```bash
# 构建项目（输出到 dist/ 目录）
npm run build

# 预览生产构建
npm run preview
```

构建完成后，`dist/` 目录中的文件可直接部署到任何静态托管服务（如 GitHub Pages、Vercel、Nginx 等）。

### 部署到 Nginx 示例

```bash
# 1. 先构建
npm run build

# 2. 将 dist/ 目录复制到服务器
scp -r dist/ root@your-server:/var/www/md-to-wechat/

# 3. Nginx 配置示例
server {
    listen 80;
    server_name md.example.com;
    root /var/www/md-to-wechat/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📖 使用指南

### 1. 编写 Markdown

在左侧编辑器中输入或粘贴 Markdown 内容，支持：

| Markdown 语法 | 效果 |
|-------------|------|
| `# 标题` | 一级标题 |
| `## 标题` | 二级标题 |
| `**加粗**` | **加粗** |
| `*斜体*` | *斜体* |
| `~~删除线~~` | ~~删除线~~ |
| `` `代码` `` | 行内代码 |
| ```代码块``` | 代码块 |
| `> 引用` | 引用块 |
| `- 列表` | 无序列表 |
| `1. 列表` | 有序列表 |
| `\|表格\|` | 表格 |
| `![图片](url)` | 图片 |
| `[链接](url)` | 超链接 |

### 2. 选择主题

点击顶部主题下拉框，切换不同排版风格：

- **默认主题（橙心）**：温暖橙色点缀，适合大多数公众号
- **优雅极简**：简洁现代风格，适合科技、商务类文章
- **极客科技**：绿色科技风，适合技术、开发者文章
- **诗意国风**：宋体衬线风格，适合文学、历史类文章

### 3. 切换预览模式

- **预览模式**：标准 HTML 预览
- **公众号模式**：自动处理外链为脚注、过滤纯黑文字等微信适配

### 4. 导入文件

点击「导入 MD」按钮，选择本地 Markdown 文件（`.md`、`.markdown`、`.txt`）。

### 5. 复制到公众号

编辑完成后：

1. 切换到「公众号模式」
2. 点击右上角的「复制 HTML」或「复制到公众号」按钮
3. 打开微信公众号编辑器（mp.weixin.qq.com）
4. 在编辑器中粘贴（`Ctrl+V` / `Cmd+V`）
5. 检查预览效果，微调后即可发布

> ⚠️ **注意**：粘贴到公众号编辑器后，建议先发送预览到手机查看最终效果，不同手机可能存在细微差异。

### 6. 下载 HTML

点击「下载」按钮，可将排版后的文章保存为 `.html` 文件，用于本地备份或二次编辑。

---

## 🎨 主题预览

### 默认主题（橙心）
- 主色调：#f5a623（橙色）
- 特点：温暖活泼，适合生活、美食、教育类公众号

### 优雅极简
- 主色调：#2c3e50（深蓝灰）
- 特点：干净利落，适合科技、商务、金融类文章

### 极客科技
- 主色调：#00b894（薄荷绿）
- 特点：现代科技感，适合编程、AI、互联网类文章

### 诗意国风
- 主色调：#8d6e63（棕褐）
- 特点：宋体衬线，适合文学、历史、传统文化类文章

---

## 🗂️ 项目结构

```
md-to-wechat/
├── index.html              # 入口 HTML 文件
├── package.json            # 项目依赖与脚本
├── vite.config.ts          # Vite 构建配置
├── tsconfig.json           # TypeScript 配置
├── tsconfig.app.json       # 应用 TS 配置
├── tsconfig.node.json      # Node TS 配置
├── tailwind.config.js      # Tailwind CSS 配置
├── postcss.config.js       # PostCSS 配置
├── .gitignore              # Git 忽略规则
├── README.md               # 项目说明文档
├── src/
│   ├── App.tsx             # 主应用组件（编辑器核心逻辑）
│   ├── main.tsx            # 应用入口
│   ├── index.css           # 全局样式
│   ├── vite-env.d.ts       # Vite 类型声明
│   └── assets/
│       └── react.svg       # React Logo
└── generate-app.js         # 代码生成辅助脚本
```

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [React](https://react.dev/) | 19.1.0 | UI 框架 |
| [Vite](https://vitejs.dev/) | 6.4.2 | 构建工具 |
| [TypeScript](https://www.typescriptlang.org/) | 5.6.3 | 类型安全 |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.17 | 原子化 CSS |
| [Terser](https://terser.org/) | 5.39.0 | 代码压缩 |

---

## 🔒 安全说明

### 数据隐私

- **纯前端应用**：所有 Markdown 编辑和渲染均在浏览器本地完成
- **不上传服务器**：文章内容不会发送到任何外部服务器
- **无数据收集**：不收集用户信息、不追踪使用行为
- **本地存储**：未使用 localStorage/sessionStorage 存储任何数据，刷新页面后内容重置

### 使用安全建议

1. **敏感内容**：涉及商业机密或个人隐私的内容，建议先确认网络环境安全
2. **图片引用**：文章中的图片使用外部 URL，请确保图片来源可靠，建议使用自己的 CDN 或图床
3. **外链处理**：公众号模式下外链会自动转为脚注形式，避免微信屏蔽风险
4. **定期备份**：重要文章建议点击「下载」保存 HTML 备份

### 代码安全

- 项目源码完全开源，可审计
- 无第三方追踪脚本或广告代码
- 构建产物为纯静态文件，无服务端逻辑

---

## ❓ 常见问题

### Q: 粘贴到公众号后样式错乱？
A: 微信公众号编辑器对 HTML 有一定过滤，建议：
- 使用「公众号模式」复制
- 粘贴后先发送预览到手机确认效果
- 避免使用过于复杂的表格和嵌套样式

### Q: 代码块没有高亮？
A: 当前版本使用简洁代码样式。如需语法高亮，可在复制到公众号后，使用微信编辑器的代码块功能二次处理。

### Q: 数学公式支持吗？
A: 当前版本暂未支持 LaTeX 公式，建议将公式转为图片后插入。

### Q: 可以自定义主题吗？
A: 目前提供 4 种预设主题。如需自定义，可修改 `src/App.tsx` 中的 `THEME_CSS` 对象，添加自己的 CSS 样式。

### Q: 支持哪些浏览器？
A: 支持所有现代浏览器：Chrome、Edge、Firefox、Safari（最新 2 个版本）。

---

## 📝 更新日志

### v1.0.0 (2026-05-12)
- ✅ 初始版本发布
- ✅ 支持 4 种主题风格
- ✅ 支持 Markdown 导入/导出
- ✅ 支持公众号适配模式
- ✅ 支持一键复制 HTML

---

## 📄 开源协议

[MIT License](https://opensource.org/licenses/MIT)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

如果你有任何建议或遇到问题，请在 [Issues](https://github.com/cscsxx606/md-to-wechat/issues) 页面反馈。

---

> Made with ❤️ by OpenClaw
