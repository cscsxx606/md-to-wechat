# MD to WeChat 代码优化清单

## 🔴 严重 Bug（建议立即修复）

### 1. GitHub 图床 CDN URL 构造错误 → 上传后图片 404
**位置**: `App.tsx` ~L430-435
**问题**: 上传路径带了 `Date.now()` 前缀，但拼接 CDN URL 时漏掉了：
```ts
const path = `images/${Date.now()}-${file.name.replace(/\.[^.]+$/, '.jpg')}`;  // 上传路径
// ...
appendMd(`![${file.name}](${GITHUB_CDN_BASE}${file.name.replace(/\.[^.]+$/, '.jpg')})`);  // CDN URL 没有 Date.now() 前缀
```
**修复**: 把文件名抽成变量统一使用：
```ts
const fileName = `${Date.now()}-${file.name.replace(/\.[^.]+$/, '.jpg')}`;
const path = `images/${fileName}`;
// ...
appendMd(`![${file.name}](${GITHUB_CDN_BASE}${fileName})`);
```

### 2. `autoSpaceText` 破坏 HTML 属性 / URL
**位置**: `parser.ts`
**问题**: `autoSpaceText` 直接对完整 HTML 字符串做正则替换，会在 `<a href="...">`、`<img alt="...">` 等属性值中插入空格，破坏链接和 alt：
```html
<!-- 原始 -->
<a href="https://example.com/测试123">测试link</a>
<!-- 替换后 -->
<a href="https://example.com/测\u2009试\u2009123">测试\u2009link</a>
```
**修复**: 只处理文本节点，不碰标签/属性。可用 DOM 解析或只替换 `>` 和 `<` 之间的文本。

### 3. `appendMd` 中 `prefixText` 已成死代码
**位置**: `App.tsx` ~L312-317
**问题**: `prefixText` 机制原本用于保留压缩提示前缀，现在压缩提示已移除，`prefixText` 永远为空字符串，但保留了对它的拼接逻辑：
```ts
const prefixText = text.slice(0, imgMatch.index);  // 永远为 ""
// ...
const newText = before + ... + prefixText + inlineImg + refDef + ...
```
**修复**: 直接删除 `prefixText` 相关逻辑。

---

## 🟠 性能问题

### 4. iframe 预览每次输入都销毁重建
**位置**: `App.tsx` ~L260-265
**问题**: 
```ts
useEffect(() => { updatePreview(); }, [updatePreview]);
// updatePreview 内部: doc.open(); doc.write(renderHtml(...)); doc.close();
```
每敲一个键都重新 `open/write/close` iframe，大文档时严重卡顿 + 闪屏。
**修复**: 改为通过 `postMessage` 或直接操作 iframe DOM，只更新 body 内容，不重建整页。

### 5. `renderHtml` 中 `prismCSS` 每次重建
**位置**: `App.tsx` ~L180-220
**问题**: 巨大的 CSS 字符串在 `renderHtml` 内部定义，每次 render 都重新创建。
**修复**: 提到函数外部作为常量。

### 6. `extractImageRefs` 全量扫描
**位置**: `App.tsx`
**问题**: 每次 `md` 变化都用正则全量扫描所有 base64 引用。
**优化**: 既然编辑器里图片引用是增量添加的，可以维护一个 ref 数组状态，而不是每次都从文本解析。

---

## 🟡 逻辑缺陷 / 边界问题

### 7. `handleSplitMouseDown` 闭包捕获 stale 值
**位置**: `App.tsx` ~L490
**问题**: `onUp` 回调里的 `splitPct` 是拖拽**开始瞬间**的值，不是拖拽结束后的值。虽然 `useEffect([splitPct])` 会正确保存，但这里的保存是冗余且错误的。
**修复**: 移除 `onUp` 里的 localStorage 保存逻辑，只保留 `useEffect` 里的。

### 8. `compressImage` 一律转 JPEG，PNG 透明丢失
**位置**: `App.tsx` ~L380
**问题**: `canvas.toBlob(..., 'image/jpeg', quality)` 硬编码 JPEG。如果原图是 PNG 且有透明通道，压缩后透明变黑色。
**修复**: 检测原图格式，PNG 用 `'image/png'`，或者先判断是否需要压缩（只有非透明图才转 JPEG）。

### 9. 粘贴/拖拽多图只处理第一张
**位置**: `App.tsx` ~L450
**问题**: `handlePaste` 里 `return` 在第一张图片后就退出循环。
**修复**: 去掉 `return`，收集所有图片后批量处理。

### 10. `extractImageRefs` 和 `extractInlineBase64Images` 的 ref ID 格式不统一
- `appendMd` 生成: `img-1`, `img-2`...（纯计数器）
- `extractInlineBase64Images` 生成: `img-${Date.now()}-1`...（带时间戳）
**风险**: 如果用户先导入文件（带时间戳 ID），再粘贴图片（纯计数器），当计数器恰好与时间戳碰撞时可能冲突（虽然概率低，但风格不统一）。
**修复**: 统一使用 `img-${Date.now()}-${counter}`。

---

## 🟢 体验 / 安全优化

### 11. 复制成功提示共享 state
**位置**: `App.tsx` ~L270-280
**问题**: `handleCopy` 和 `handleCopyForWechat` 共用同一个 `copySuccess`，快速点击两个按钮时提示会冲突。
**修复**: 拆成两个独立状态，或给每个按钮自己的提示。

### 12. GitHub Token 明文存 localStorage
**位置**: `App.tsx` ~L80
**问题**: `localStorage.setItem('md2wx_github', JSON.stringify(githubConfig))` 把 Token 明文存储。
**风险**: XSS 攻击可直接读取。
**建议**: 至少说明风险；更好的方案是 Session Storage 或内存存储（每次刷新重新输入）。

### 13. `handleCopy` 复制的是完整 HTML 文档
**位置**: `App.tsx` ~L275
**问题**: `handleCopy` 调用 `copyToClipboard(html)`，其中 `html` 包含 `<!DOCTYPE html><html><head>...<body>`。
粘贴到某些编辑器时可能带入多余包裹标签。
**建议**: 和 `handleCopyForWechat` 保持一致，只复制 `<div id="nice">...</div>` 的内容。

---

## 📋 修复优先级建议

| 优先级 | 问题 | 影响 |
|--------|------|------|
| P0 | GitHub CDN URL 错误 | 图床功能完全不可用 |
| P0 | autoSpace 破坏属性/URL | 开启间距后链接/图片可能损坏 |
| P1 | iframe 预览重建 | 大文档卡顿、闪屏 |
| P1 | appendMd prefixText 死代码 | 代码冗余，可清理 |
| P2 | compressImage PNG 透明丢失 | 影响带透明图的上传 |
| P2 | 复制成功状态冲突 | 体验问题 |
| P3 | prismCSS 外提 | 微优化 |
| P3 | Token 明文存储 | 安全建议 |
