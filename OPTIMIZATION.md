# MD to WeChat 代码优化清单

## ✅ 已修复（2026-05-14）

### 1. ~~GitHub 图床 CDN URL 构造错误~~
**状态**: ✅ 已在之前版本修复
**修复**: `fileName` 变量统一用于上传路径和 CDN URL

### 2. ~~`autoSpaceText` 破坏 HTML 属性 / URL~~
**状态**: ✅ 已在之前版本修复
**修复**: 使用 `split(/(<[^>]+>)/g)` 拆分标签，只处理文本节点

### 3. ~~iframe 预览每次输入都销毁重建~~
**状态**: ✅ 已修复
**修复**: 分离样式初始化（theme 变化时）和内容更新（md 变化时）为两个独立 useEffect

### 4. ~~`renderHtml` 中 `prismCSS` 每次重建~~
**状态**: ✅ 已修复
**修复**: 提取为 `PRISM_CSS(isDark: boolean)` 常量函数

### 5. ~~PNG 透明丢失~~
**状态**: ✅ 已修复
**修复**: 添加 `hasTransparency()` 检测函数，有透明像素时使用 PNG 格式输出

---

## 🟡 可选优化（低优先级）

### 6. `extractImageRefs` 全量扫描
**状态**: 可优化
**建议**: 改为维护 ref 数组状态而非每次从文本解析

### 7. GitHub Token 明文存 sessionStorage
**状态**: 已知风险，用户需自行权衡
**建议**: 添加风险提示 UI，或改用内存存储

### 8. 复制成功提示拆分
**状态**: 已拆分为 `copySuccessWechat` 和 `copySuccessHtml`

---

## 📋 修复记录

| 日期 | 修复项 | 影响 |
|------|--------|------|
| 2026-05-14 | iframe 预览优化 | 大文档性能提升，减少卡顿闪屏 |
| 2026-05-14 | PRISM_CSS 常量提取 | 减少每次 render 的字符串重建 |
| 2026-05-14 | PNG 透明度保留 | 带透明 PNG 图片正确上传 |

---

## 🚀 构建结果

```
✓ 138 modules transformed
dist/index.html                  1.00 kB │ gzip: 0.58 kB
dist/assets/index-Bgmxdl9Y.js  373.61 kB │ gzip: 124.14 kB
✓ built in 1.24s
```