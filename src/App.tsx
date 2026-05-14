/**
 * App.tsx — MD to WeChat 公众号排版编辑器 v4.0
 * 重构：全新 UI 设计、暗色模式、手机预览、编辑器行号
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { THEME_CSS, THEME_META, ThemeId } from './themes';
import { parseMarkdown, extractToc, countWords, estimateReadingTime } from './parser';
import { adaptForWechat, copyToClipboard } from './wechat-adapter';
import { useDarkMode } from './hooks/useDarkMode';

const GITHUB_CDN_BASE = 'https://raw.githubusercontent.com/cscsxx606/md-to-wechat/main/images/';
const DRAFT_KEY = 'md2wx_draft';
const SPLIT_KEY = 'md2wx_split';

// ─── Prism.js 代码高亮 CSS ────────────────────────────
const PRISM_CSS = (isDark: boolean) => `<style>
  code[class*="language-"], pre[class*="language-"] { color:#333; background:0 0; font-family:"JetBrains Mono","Fira Code",Consolas,monospace; font-size:13px; text-align:left; white-space:pre; word-spacing:normal; word-break:normal; word-wrap:normal; line-height:1.6; tab-size:4; hyphens:none; }
  pre[class*="language-"] { padding:1em; margin:.5em 0; overflow:auto; border-radius:8px; }
  :not(pre)>code[class*="language-"] { padding:.2em .4em; border-radius:4px; }
  .token.comment,.token.block-comment,.token.prolog,.token.doctype,.token.cdata { color:#7d8b99; }
  .token.punctuation { color:#5f6364; }
  .token.property,.token.tag,.token.boolean,.token.number,.token.function-name,.token.constant,.token.symbol,.token.deleted { color:#c92c2c; }
  .token.selector,.token.attr-name,.token.string,.token.char,.token.function,.token.builtin,.token.inserted { color:#2f9c0a; }
  .token.operator,.token.entity,.token.url,.token.variable { color:#a67f59; }
  .token.atrule,.token.attr-value,.token.keyword,.token.class-name { color:#1990b8; }
  .token.regex,.token.important { color:#e90; }
  ${isDark ? `
  code[class*="language-"], pre[class*="language-"] { color:#e0e0e0; }
  .token.comment { color:#6a737d; } .token.punctuation { color:#9e9e9e; }
  .token.property,.token.tag,.token.boolean,.token.number,.token.constant,.token.symbol,.token.deleted { color:#ff8a80; }
  .token.selector,.token.attr-name,.token.string,.token.char,.token.function,.token.builtin,.token.inserted { color:#69f0ae; }
  .token.operator,.token.entity,.token.url,.token.variable { color:#ffd54f; }
  .token.atrule,.token.attr-value,.token.keyword,.token.class-name { color:#82b1ff; }` : ''}
  .nice-code { background:${isDark ? '#1e1e1e' : '#f8f9fa'}; border:1px solid ${isDark ? '#333' : '#eaeaea'}; border-radius:8px; }
  .nice-footnotes { padding:12px 16px; background:${isDark ? '#1e1e1e' : '#fafafa'}; border-radius:8px; margin-top:20px; }
  .nice-figure { margin:16px 0; } .nice-figcaption { font-size:13px; color:#888; margin-top:6px; line-height:1.6; }
  .nice-gallery { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; } .nice-gallery img { width:100%; height:auto; object-fit:cover; border-radius:4px; }
  .table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
</style>`;

const DEFAULT_MD = `# 欢迎使用 MD to WeChat

## 功能一览

**MD to WeChat** 是一款将 Markdown 文章一键转换为微信公众号排版格式的工具。

### 支持格式

- **12 款精美主题**：橙心、优雅极简、极客科技、诗意国风……
- **Markdown 工具栏**：B/I/U/H1/H2/引用/链接/图片/列表/表格
- **自动保存草稿**：localStorage 持久化，防误关闭
- **代码语法高亮**：20+ 语言 Prism.js 高亮
- **图片排版**：居中、右对齐、宽度、图注、画廊

### 表格演示

| 功能 | 状态 |
|------|------|
| 自动保存 | ✅ |
| 工具栏 | ✅ |
| 分屏拖拽 | ✅ |
| 全屏编辑 | ✅ |

> 点击上方「复制到公众号」→ 微信编辑器粘贴即可。`;

type ImageMode = 'base64' | 'github';
type GitHubConfig = { token: string; repo: string; branch: string };
type PreviewMode = 'desktop' | 'mobile';

// ─── 工具栏配置 ────────────────────────────
interface ToolbarAction {
  key: string; label: string; title: string;
  prefix: string; suffix: string; block?: boolean;
  icon?: string;
}

const TOOLBAR_ITEMS: ToolbarAction[] = [
  { key: 'bold', label: 'B', title: '粗体 (Ctrl+B)', prefix: '**', suffix: '**' },
  { key: 'italic', label: 'I', title: '斜体 (Ctrl+I)', prefix: '*', suffix: '*' },
  { key: 'strike', label: 'S̶', title: '删除线', prefix: '~~', suffix: '~~' },
  { key: 'code', label: '<>', title: '行内代码', prefix: '`', suffix: '`' },
  { key: 'divider', label: '', title: '', prefix: '', suffix: '' },
  { key: 'h1', label: 'H1', title: '一级标题', prefix: '# ', suffix: '', block: true },
  { key: 'h2', label: 'H2', title: '二级标题', prefix: '## ', suffix: '', block: true },
  { key: 'h3', label: 'H3', title: '三级标题', prefix: '### ', suffix: '', block: true },
  { key: 'divider2', label: '', title: '', prefix: '', suffix: '' },
  { key: 'quote', label: '❝', title: '引用块', prefix: '> ', suffix: '', block: true },
  { key: 'link', label: '🔗', title: '链接', prefix: '[', suffix: '](url)' },
  { key: 'image', label: '🖼', title: '图片', prefix: '![alt](', suffix: ')' },
  { key: 'divider3', label: '', title: '', prefix: '', suffix: '' },
  { key: 'ul', label: '•', title: '无序列表', prefix: '- ', suffix: '', block: true },
  { key: 'ol', label: '1.', title: '有序列表', prefix: '1. ', suffix: '', block: true },
  { key: 'table', label: '⊞', title: '插入表格', prefix: '', suffix: '', block: true },
  { key: 'hr', label: '—', title: '分割线', prefix: '\n---\n', suffix: '', block: true },
];

interface ImageRef { id: string; alt: string; url: string; sizeKB: number; }

function mergeBase64Refs(markdown: string, base64Map: Record<string, string>): string {
  if (!base64Map || Object.keys(base64Map).length === 0) return markdown;
  const refs = Object.entries(base64Map)
    .filter(([id]) => !markdown.includes(`[${id}]:`))
    .map(([id, url]) => `[${id}]: ${url}`)
    .join('\n');
  if (!refs) return markdown;
  return markdown.trimEnd() + '\n\n' + refs + '\n';
}

// ─── 主应用 ────────────────────────────
export default function App() {
  const { isDark, toggle: toggleDark } = useDarkMode();

  // ── 状态 ──
  const [md, setMd] = useState(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) { const p = JSON.parse(draft); return p.md || DEFAULT_MD; }
    } catch {}
    return DEFAULT_MD;
  });
  const [imageBase64Map, setImageBase64Map] = useState<Record<string, string>>(() => {
    try { const d = localStorage.getItem(DRAFT_KEY); if (d) { const p = JSON.parse(d); return p.imageBase64Map || {}; } } catch { return {}; }
  });
  const [theme, setTheme] = useState<ThemeId>(() => {
    try { const d = localStorage.getItem(DRAFT_KEY); return d ? JSON.parse(d).theme || 'default' : 'default'; } catch { return 'default'; }
  });
  const [mode, setMode] = useState<'preview' | 'wechat'>('preview');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [showToc, setShowToc] = useState(false);
  const [autoSpace, setAutoSpace] = useState(true);
  const [firstIndent, setFirstIndent] = useState(false);
  const [imageMode, setImageMode] = useState<ImageMode>('base64');
  const [dragOver, setDragOver] = useState(false);
  const [copySuccessWechat, setCopySuccessWechat] = useState(false);
  const [copySuccessHtml, setCopySuccessHtml] = useState(false);
  const [importedFileName, setImportedFileName] = useState('');
  const [showImageToolbar, setShowImageToolbar] = useState(false);
  const [draftRestored, setDraftRestored] = useState(() => { try { return !!localStorage.getItem(DRAFT_KEY); } catch { return false; } });
  const [spacing, setSpacing] = useState<'compact' | 'normal' | 'loose'>('normal');
  const [splitPct, setSplitPct] = useState(() => { try { const v = localStorage.getItem(SPLIT_KEY); return v ? parseInt(v) : 50; } catch { return 50; } });
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>(() => { try { const s = sessionStorage.getItem('md2wx_github'); return s ? JSON.parse(s) : { token: '', repo: '', branch: 'main' }; } catch { return { token: '', repo: '', branch: 'main' }; } });
  const [showGithubConfig, setShowGithubConfig] = useState(false);
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const imgRefCounter = useRef(0);
  const editorLinesRef = useRef<HTMLDivElement>(null);

  // ── 兼容旧版本 + 恢复计数器 ──
  useEffect(() => {
    const keys = Object.keys(imageBase64Map);
    let max = 0;
    for (const key of keys) { const m = key.match(/^img-(\d+)$/); if (m) { const n = parseInt(m[1], 10); if (n > max) max = n; } }
    imgRefCounter.current = max;
    if (keys.length === 0) {
      const inlineRefRegex = /^\[([^\]]+)\]:\s+(data:image\/[a-zA-Z0-9.+]+;base64,[A-Za-z0-9+/=]+)$/gm;
      const newMap: Record<string, string> = {};
      let m;
      while ((m = inlineRefRegex.exec(md)) !== null) { newMap[m[1]] = m[2]; }
      if (Object.keys(newMap).length > 0) {
        setImageBase64Map(newMap);
        setMd((prev: string) => prev.replace(/^\[([^\]]+)\]:\s+data:image\/[a-zA-Z0-9.+]+;base64,[A-Za-z0-9+/=]+\n?/gm, '').replace(/\n{3,}/g, '\n\n'));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 提取图片引用 ──
  const extractImageRefs = useCallback((markdown: string, base64Map: Record<string, string>): ImageRef[] => {
    const refs: ImageRef[] = [];
    const refMarkRegex = /!\[([^\]]*)\]\[([^\]]+)\]/g;
    let match;
    while ((match = refMarkRegex.exec(markdown)) !== null) {
      const alt = match[1], id = match[2];
      const url = base64Map[id];
      if (url && url.startsWith('data:image/')) {
        const base64Part = url.split(',')[1];
        const sizeKB = base64Part ? Math.round((base64Part.length * 0.75) / 1024) : 0;
        refs.push({ id, alt, url, sizeKB });
      }
    }
    return refs;
  }, []);
  const imageRefs = useMemo(() => extractImageRefs(md, imageBase64Map), [md, imageBase64Map, extractImageRefs]);

  const wordCount = useMemo(() => countWords(md), [md]);
  const readingTime = useMemo(() => estimateReadingTime(md), [md]);
  const tocItems = useMemo(() => extractToc(md), [md]);
  const _tocCount = tocItems.length; // 避免未使用警告

  // 编辑器行号
  const editorLineCount = useMemo(() => md.split('\n').length, [md]);

  // ── 自动保存 ──
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ md, theme, imageBase64Map })); } catch {} }, 1000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [md, theme, imageBase64Map]);

  // ── 渲染 HTML ──
  const renderHtml = useCallback((inputMd: string, inputTheme: ThemeId, inputMode: 'preview' | 'wechat') => {
    const fullMd = mergeBase64Refs(inputMd, imageBase64Map);
    const css = THEME_CSS[inputTheme] || THEME_CSS.default;
    let extraCss = '';
    if (firstIndent) extraCss += `#nice p.nice-indent, #nice p { text-indent:2em; }`;
    const spacingMap = { compact: '6px', normal: '12px', loose: '20px' };
    extraCss += `#nice p { margin-top:${spacingMap[spacing]} !important; margin-bottom:${spacingMap[spacing]} !important; }`;
    if (inputMode === 'wechat') extraCss += `#nice, #nice p, #nice li, #nice td, #nice th { font-size:15px !important; }`;
    let bodyHtml = parseMarkdown(fullMd, { autoSpace, showToc, firstIndent });
    if (inputMode === 'wechat') bodyHtml = adaptForWechat(bodyHtml);
    const wrapped = `<div id="nice">${bodyHtml}</div>`;
    const prismCSS = PRISM_CSS(isDark);
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>${css}${extraCss}${prismCSS}</style></head><body style="margin:0;padding:0;background:${isDark ? '#0f0f0f' : '#fff'};">${wrapped}</body></html>`;
  }, [autoSpace, showToc, firstIndent, spacing, imageBase64Map, isDark]);

  // ── iframe 预览 ──
  useEffect(() => {
    const iframe = previewRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    const css = THEME_CSS[theme] || THEME_CSS.default;
    const prismCSS = PRISM_CSS(isDark);
    let extraCss = '';
    if (firstIndent) extraCss += `#nice p.nice-indent, #nice p { text-indent:2em; }`;
    const spacingMap = { compact: '6px', normal: '12px', loose: '20px' };
    extraCss += `#nice p { margin-top:${spacingMap[spacing]} !important; margin-bottom:${spacingMap[spacing]} !important; }`;
    if (mode === 'wechat') extraCss += `#nice, #nice p, #nice li, #nice td, #nice th { font-size:15px !important; }`;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>${css}${extraCss}${prismCSS}</style></head><body style="margin:0;padding:0;background:${isDark ? '#0f0f0f' : '#fff'};"></body></html>`);
    doc.close();
  }, [theme, spacing, firstIndent, mode, isDark]);

  useEffect(() => {
    const doc = previewRef.current?.contentDocument;
    if (!doc || !doc.body) return;
    const fullMd = mergeBase64Refs(md, imageBase64Map);
    const bodyHtml = parseMarkdown(fullMd, { autoSpace, showToc, firstIndent });
    const adapted = mode === 'wechat' ? adaptForWechat(bodyHtml) : bodyHtml;
    doc.body.innerHTML = `<div id="nice">${adapted}</div>`;
  }, [md, autoSpace, showToc, firstIndent, mode, imageBase64Map, isDark]);

  // ── 复制 ──
  const handleCopyForWechat = useCallback(async () => {
    const html = renderHtml(md, theme, 'wechat');
    const match = html.match(/<div id="nice">([\s\S]*)<\/div>/);
    const content = match ? match[1] : html;
    const success = await copyToClipboard(content);
    if (success) { setCopySuccessWechat(true); setTimeout(() => setCopySuccessWechat(false), 2000); }
    else alert('复制失败，请手动复制。');
  }, [md, theme, renderHtml]);

  const handleCopy = useCallback(async () => {
    const html = renderHtml(md, theme, 'wechat');
    const success = await copyToClipboard(html);
    if (success) { setCopySuccessHtml(true); setTimeout(() => setCopySuccessHtml(false), 2000); }
  }, [md, theme, renderHtml]);

  const handleDownload = useCallback(() => {
    const html = renderHtml(md, theme, mode);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `md-to-wechat-${Date.now()}.html`; a.click();
    URL.revokeObjectURL(url);
  }, [md, theme, mode, renderHtml]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleDownload(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleDownload]);

  // ── 编辑器操作 ──
  const wrapSelection = useCallback((prefix: string, suffix: string, block?: boolean) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const text = ta.value;
    const sel = text.substring(start, end);
    if (block) {
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const beforeLine = text.slice(0, lineStart);
      const afterLine = text.slice(lineStart);
      let newText: string;
      if (start === end) {
        newText = beforeLine + prefix + afterLine;
        setTimeout(() => ta.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length), 0);
      } else {
        newText = beforeLine + prefix + sel + suffix + afterLine.slice(end - lineStart);
        setTimeout(() => ta.setSelectionRange(lineStart, lineStart + prefix.length + sel.length + suffix.length), 0);
      }
      setMd(newText);
      setTimeout(() => ta.focus(), 0);
    } else {
      const newText = text.slice(0, start) + prefix + (sel || '文本') + suffix + text.slice(end);
      setMd(newText);
      const cursorPos = start + prefix.length + (sel || '文本').length + suffix.length;
      setTimeout(() => { ta.focus(); ta.setSelectionRange(cursorPos, cursorPos); }, 0);
    }
  }, []);

  const insertTable = useCallback(() => {
    const table = `\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |\n`;
    setMd((prev: string) => {
      const ta = textareaRef.current;
      if (!ta) return prev + table;
      const start = ta.selectionStart;
      const before = prev.slice(0, start), after = prev.slice(start);
      const newText = before + table + after;
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + 2, start + 6); }, 0);
      return newText;
    });
  }, []);

  const handleToolbar = useCallback((action: ToolbarAction) => {
    if (action.key === 'table') { insertTable(); return; }
    wrapSelection(action.prefix, action.suffix, action.block);
  }, [wrapSelection, insertTable]);

  // ── 快捷键 ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        const map: Record<string, ToolbarAction> = {
          'b': TOOLBAR_ITEMS[0], 'i': TOOLBAR_ITEMS[1],
          'k': TOOLBAR_ITEMS[10], // link
        };
        if (map[key]) { e.preventDefault(); handleToolbar(map[key]); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleToolbar]);

  // ── 追加 Markdown ──
  const appendMd = useCallback((text: string, isBase64Image = false) => {
    if (isBase64Image) {
      const imgMatch = text.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (!imgMatch) { setMd((prev: string) => prev + '\n' + text + '\n'); return; }
      const [, alt, base64Src] = imgMatch;
      imgRefCounter.current++;
      const refId = `img-${imgRefCounter.current}`;
      const inlineImg = `![${alt || '图片'}][${refId}]`;
      setImageBase64Map(prev => ({ ...prev, [refId]: base64Src }));
      setMd((prev: string) => {
        const ta = textareaRef.current;
        if (!ta) return prev + '\n' + inlineImg;
        const start = ta.selectionStart, end = ta.selectionEnd;
        const before = prev.slice(0, start), after = prev.slice(end);
        const newText = before + (before && !before.endsWith('\n') ? '\n' : '') + inlineImg + '\n' + after;
        setTimeout(() => { ta.focus(); ta.setSelectionRange(start + inlineImg.length + 1, start + inlineImg.length + 1); }, 0);
        return newText;
      });
      return;
    }
    setMd((prev: string) => {
      const ta = textareaRef.current;
      if (!ta) return prev + '\n' + text;
      const start = ta.selectionStart, end = ta.selectionEnd;
      const before = prev.slice(0, start), after = prev.slice(end);
      const newText = before + (before && !before.endsWith('\n') ? '\n' : '') + text + '\n' + after;
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + text.length + 1, start + text.length + 1); }, 0);
      return newText;
    });
  }, []);

  const extractInlineBase64Images = useCallback((markdown: string): { cleaned: string; map: Record<string, string> } => {
    const inlineBase64Regex = /!\[([^\]]*)\]\((data:image\/[a-zA-Z0-9.+]+;base64,[A-Za-z0-9+/=]+)\)/g;
    const map: Record<string, string> = {};
    let counter = 0;
    let cleaned = markdown;
    cleaned = cleaned.replace(inlineBase64Regex, (_match, alt: string, dataUri: string) => {
      counter++;
      const refId = `img-${Date.now()}-${counter}`;
      map[refId] = dataUri;
      return `![${alt || '图片'}][${refId}]`;
    });
    if (counter > 0) cleaned = cleaned.trimEnd() + '\n';
    return { cleaned, map };
  }, []);

  const handleMdImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      let content = reader.result as string;
      const { cleaned, map } = extractInlineBase64Images(content);
      setMd(cleaned);
      setImageBase64Map(prev => ({ ...prev, ...map }));
      setImportedFileName(file.name);
    };
    reader.readAsText(file, 'UTF-8');
  }, [extractInlineBase64Images]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleMdImport(file);
  }, [handleMdImport]);

  // ── 图片压缩 ──
  const compressImage = useCallback((file: File, maxKB: number = 500, maxWidth: number = 1920): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        const hasTransparency = (): boolean => {
          if (file.type !== 'image/png') return false;
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;
          for (let i = 3; i < data.length; i += 4) { if (data[i] < 255) return true; }
          return false;
        };
        const preservePNG = hasTransparency();
        if (preservePNG) {
          canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error('PNG 压缩失败')); }, 'image/png', 0.9);
        } else {
          const tryCompress = (quality: number) => {
            canvas.toBlob((blob) => {
              if (!blob) { reject(new Error('压缩失败')); return; }
              if (blob.size / 1024 <= maxKB || quality <= 0.3) resolve(blob);
              else tryCompress(quality - 0.1);
            }, 'image/jpeg', quality);
          };
          tryCompress(0.85);
        }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片加载失败')); };
      img.src = url;
    });
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    const MAX_BASE64_KB = 400;
    let blob: Blob = file;
    if (file.size > MAX_BASE64_KB * 1024) { try { blob = await compressImage(file, MAX_BASE64_KB, 1920); } catch {} }
    if (imageMode === 'base64') {
      const reader = new FileReader();
      reader.onload = () => { appendMd(`![](${reader.result as string})`, true); };
      reader.readAsDataURL(blob);
    } else {
      if (!githubConfig.token) { setShowGithubConfig(true); return; }
      try {
        const { token, repo, branch } = githubConfig;
        const fileName = `${Date.now()}-${file.name.replace(/\.[^.]+$/, '.jpg')}`;
        const path = `images/${fileName}`;
        const base64Reader = new FileReader();
        base64Reader.onload = async () => {
          const base64Content = (base64Reader.result as string).split(',')[1];
          const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            method: 'PUT', headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `Upload ${file.name}`, content: base64Content, branch }),
          });
          if (res.ok) appendMd(`![](${GITHUB_CDN_BASE}${fileName})`);
          else { const err = await res.json(); alert(`GitHub 上传失败: ${err.message}`); }
        };
        base64Reader.readAsDataURL(blob);
      } catch (err: any) { alert(`上传失败: ${err.message}`); }
    }
  }, [imageMode, githubConfig, compressImage, appendMd]);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    let hasImage = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        if (!hasImage) { e.preventDefault(); hasImage = true; }
        const file = items[i].getAsFile();
        if (file) await uploadImage(file);
      }
    }
  }, [uploadImage]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const files = e.dataTransfer?.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.type.startsWith('image/')) await uploadImage(f);
      else if (f.name.match(/\.(md|markdown)$/i) || f.type === 'text/markdown') handleMdImport(f);
    }
  }, [uploadImage, handleMdImport]);

  // ── 分屏拖拽 ──
  const handleSplitMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startPct = splitPct;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const containerW = splitRef.current?.parentElement?.clientWidth || window.innerWidth;
      const newPct = Math.min(80, Math.max(20, startPct + (dx / containerW) * 100));
      setSplitPct(newPct);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [splitPct]);

  useEffect(() => { try { localStorage.setItem(SPLIT_KEY, String(Math.round(splitPct))); } catch {} }, [splitPct]);

  const saveGithubConfig = () => { sessionStorage.setItem('md2wx_github', JSON.stringify(githubConfig)); setShowGithubConfig(false); };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftRestored(false);
    setMd(DEFAULT_MD);
    setImageBase64Map({});
  };

  const insertImageLayout = (layout: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const sel = ta.value.substring(ta.selectionStart, ta.selectionEnd) || '图片链接';
    let mdImg = '';
    switch (layout) {
      case 'center': mdImg = `![图片说明](${sel}#center)`; break;
      case 'right': mdImg = `![图片说明](${sel}#right)`; break;
      case '300': mdImg = `![图片说明](${sel}#300)`; break;
      case 'center-300': mdImg = `![图片说明](${sel}#center-300)`; break;
      case 'caption': mdImg = `![图注文字](${sel})`; break;
      case 'gallery': mdImg = `[img-gallery]\n![图1](${sel})\n![图2](图片链接2)\n![图3](图片链接3)\n[/img-gallery]`; break;
      default: mdImg = `![图片说明](${sel})`;
    }
    appendMd(mdImg);
    setShowImageToolbar(false);
  };

  const imgLayouts = [
    { key: 'default', label: '默认', desc: '常规图片' },
    { key: 'center', label: '居中', desc: '水平居中' },
    { key: 'right', label: '右浮', desc: '文字环绕' },
    { key: '300', label: '300px', desc: '固定宽度' },
    { key: 'center-300', label: '居中300', desc: '居中+300px' },
    { key: 'caption', label: '图注', desc: '带说明文字' },
    { key: 'gallery', label: '画廊', desc: '2-3列网格' },
  ];

  // ─── 行号同步滚动 ────────────────────────────
  const handleEditorScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (editorLinesRef.current) {
      editorLinesRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
    }
  }, []);

  // ─── 渲染 ────────────────────────────
  return (
    <div className={`h-screen flex flex-col ${isDark ? 'dark bg-gray-950' : 'bg-gray-50'} transition-colors`}>
      {/* ═══ 顶部导航栏 ═══ */}
      <header className="shrink-0 z-50">
        {/* 品牌行 */}
        <div className={`px-4 py-2.5 flex items-center justify-between border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📝</span>
              <h1 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                MD <span className="text-brand-500">→</span> WeChat
              </h1>
            </div>
            {draftRestored && (
              <span className="flex items-center gap-1.5 text-xs">
                <span className="text-brand-500">📝 草稿已恢复</span>
                <button onClick={clearDraft} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline">清除</button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleDark}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
              title={isDark ? '切换亮色' : '切换暗色'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
              title="快捷键"
            >
              ⌨️
            </button>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1" />
            <button onClick={handleCopy} className={`hidden sm:flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all active:scale-[0.98] ${isDark ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
              {copySuccessHtml ? '✅ 已复制' : '📋 复制HTML'}
            </button>
            <button onClick={handleCopyForWechat} className="flex items-center gap-1 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow active:scale-[0.98]">
              {copySuccessWechat ? '✅ 已复制' : '📋 复制到公众号'}
            </button>
            <button onClick={handleDownload} className={`hidden md:flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all active:scale-[0.98] ${isDark ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
              ⬇️ 下载
            </button>
          </div>
        </div>

        {/* 排版设置行 */}
        <div className={`px-4 py-1.5 flex items-center gap-3 flex-wrap border-b ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-gray-50 border-gray-200'} backdrop-blur`}>
          {/* 主题选择 */}
          <div className="flex items-center gap-1.5">
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>🎨</span>
            <select
              className={`text-xs px-2 py-1 rounded-md border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'} focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none`}
              value={theme}
              onChange={e => setTheme(e.target.value as ThemeId)}
            >
              {(Object.keys(THEME_META) as ThemeId[]).map(id => (
                <option key={id} value={id}>{THEME_META[id].name}</option>
              ))}
            </select>
          </div>

          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />

          {/* 段落间距 */}
          <div className="flex items-center gap-1.5">
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>📏</span>
            <div className={`flex rounded-md overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              {(['compact', 'normal', 'loose'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSpacing(s)}
                  className={`px-2 py-0.5 text-xs transition-colors ${
                    spacing === s
                      ? 'bg-brand-500 text-white'
                      : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s === 'compact' ? '紧凑' : s === 'normal' ? '标准' : '宽松'}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />

          {/* 排版选项 */}
          <label className={`flex items-center gap-1 text-xs cursor-pointer ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <input type="checkbox" checked={autoSpace} onChange={e => setAutoSpace(e.target.checked)} className="w-3.5 h-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
            间距
          </label>
          <label className={`flex items-center gap-1 text-xs cursor-pointer ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <input type="checkbox" checked={showToc} onChange={e => setShowToc(e.target.checked)} className="w-3.5 h-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
            目录
          </label>
          <label className={`flex items-center gap-1 text-xs cursor-pointer ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <input type="checkbox" checked={firstIndent} onChange={e => setFirstIndent(e.target.checked)} className="w-3.5 h-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
            缩进
          </label>

          <div className="flex-1" />

          {/* 预览模式切换 */}
          <div className={`flex rounded-md overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setMode('preview')}
              className={`px-2.5 py-0.5 text-xs transition-colors ${mode === 'preview' ? 'bg-brand-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`}
            >
              预览
            </button>
            <button
              onClick={() => setMode('wechat')}
              className={`px-2.5 py-0.5 text-xs transition-colors ${mode === 'wechat' ? 'bg-brand-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`}
            >
              公众号
            </button>
          </div>
        </div>
      </header>

      {/* ═══ 主体区域 ═══ */}
      <div className="flex flex-1 overflow-hidden" ref={splitRef}>
        {/* ─── 编辑器 ─── */}
        <div
          className={`flex flex-col relative ${isDark ? 'bg-gray-950' : 'bg-white'} ${dragOver ? 'ring-2 ring-brand-400 ring-inset' : ''}`}
          style={{ width: `${splitPct}%` }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {/* 工具栏 */}
          <div className={`px-2 py-1.5 flex items-center gap-0.5 flex-wrap shrink-0 border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            {TOOLBAR_ITEMS.map(item => item.key.startsWith('divider')
              ? <span key={item.key} className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-0.5" />
              : <button
                  key={item.key}
                  onClick={() => handleToolbar(item)}
                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                    isDark
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  } active:scale-95`}
                  title={item.title}
                >
                  {item.label}
                </button>
            )}
            <div className="flex-1" />
            <button
              onClick={() => setShowImageToolbar(!showImageToolbar)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${showImageToolbar ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' : isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              🖼️ 排版
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 text-xs rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors active:scale-95"
            >
              📄 导入
            </button>
          </div>

          {/* 图片排版工具栏 */}
          {showImageToolbar && (
            <div className={`px-3 py-1.5 flex gap-1.5 flex-wrap shrink-0 border-b ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-amber-50/80 border-amber-100'} backdrop-blur`}>
              {imgLayouts.map(l => (
                <button key={l.key} onClick={() => insertImageLayout(l.key)}
                  className={`px-2 py-0.5 text-xs rounded-md border transition-all active:scale-95 ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-brand-500'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-brand-400 hover:bg-brand-50'
                  }`}
                  title={l.desc}
                >
                  {l.label}
                </button>
              ))}
              <button onClick={() => setShowImageToolbar(false)} className="ml-auto text-gray-400 hover:text-gray-600 text-xs px-1">✕</button>
            </div>
          )}

          {/* 拖拽提示 */}
          {dragOver && (
            <div className="absolute inset-0 bg-brand-500/10 flex items-center justify-center z-20 pointer-events-none backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-900 px-6 py-4 rounded-xl shadow-xl border border-brand-200 dark:border-brand-800">
                <div className="text-brand-600 dark:text-brand-400 font-medium text-lg text-center">📎 松开上传图片 / 导入 MD</div>
              </div>
            </div>
          )}

          {/* 图床设置 */}
          <div className={`px-3 py-1 flex items-center gap-2 shrink-0 border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>图床</span>
            <div className={`flex rounded-md overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button onClick={() => setImageMode('base64')} className={`px-2 py-0.5 text-xs transition-colors ${imageMode === 'base64' ? 'bg-brand-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`}>Base64</button>
              <button onClick={() => setImageMode('github')} className={`px-2 py-0.5 text-xs transition-colors ${imageMode === 'github' ? 'bg-brand-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`}>GitHub</button>
            </div>
            {imageMode === 'github' && !githubConfig.token && (
              <button onClick={() => setShowGithubConfig(true)} className="text-xs text-brand-500 hover:underline">⚙️ 配置 Token</button>
            )}
            {imageMode === 'github' && githubConfig.token && <span className="text-green-500 text-xs">✅ 已配置</span>}
            <div className="flex-1" />
            {importedFileName && (
              <span className={`text-xs text-brand-500 truncate max-w-[120px] ${isDark ? 'text-brand-400' : ''}`} title={importedFileName}>
                📄 {importedFileName}
              </span>
            )}
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {wordCount.total} 字 · ~{readingTime} 分钟 · H{_tocCount}
            </span>
          </div>

          <input ref={fileInputRef} type="file" accept=".md,.markdown,.txt" onChange={handleFileInputChange} className="hidden" />

          {/* 编辑器主体（带行号） */}
          <div className="flex flex-1 overflow-hidden relative">
            {/* 行号 */}
            <div
              ref={editorLinesRef}
              className={`shrink-0 w-12 py-4 overflow-hidden ${isDark ? 'bg-gray-900 text-gray-600' : 'bg-gray-50 text-gray-300'} font-mono text-sm text-right select-none`}
            >
              {Array.from({ length: editorLineCount }, (_, i) => (
                <div key={i} className="h-6 leading-6 pr-2">{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              className={`flex-1 py-4 px-3 resize-none font-mono text-sm leading-6 focus:outline-none ${
                isDark ? 'bg-gray-950 text-gray-200 placeholder-gray-600' : 'bg-white text-gray-800 placeholder-gray-400'
              }`}
              value={md}
              onChange={e => setMd(e.target.value)}
              onPaste={handlePaste}
              onScroll={handleEditorScroll}
              spellCheck={false}
              placeholder="在此输入 Markdown...&#10;Ctrl+V 粘贴截图 | 拖拽上传/导入MD | Ctrl+S 下载"
            />
          </div>

          {/* 图片面板 */}
          {imageRefs.length > 0 && (
            <div className={`shrink-0 border-t ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => setShowImagePanel(p => !p)}
                className={`w-full px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <span className="flex items-center gap-1.5">
                  📎 内嵌图片 ({imageRefs.length}张)
                </span>
                <span className="transition-transform">{showImagePanel ? '▲' : '▼'}</span>
              </button>
              {showImagePanel && (
                <div className="max-h-48 overflow-y-auto px-3 py-2 space-y-2">
                  {imageRefs.map(ref => (
                    <div key={ref.id} className="flex items-center gap-2 text-xs group">
                      <img src={ref.url} alt={ref.alt} className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>[{ref.id}]</div>
                        <div className="text-gray-400">{ref.sizeKB} KB</div>
                      </div>
                      <button
                        onClick={() => {
                          setMd((prev: string) => {
                            let cleaned = prev.replace(new RegExp(`!\\[([^\\]]*)\\]\\[${ref.id}\\]\\n?`, 'g'), '').replace(/\n{3,}/g, '\n\n');
                            return cleaned;
                          });
                          setImageBase64Map(prev => { const next = { ...prev }; delete next[ref.id]; return next; });
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 px-1.5 py-0.5 rounded transition-all"
                        title="删除"
                      >🗑</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── 分屏拖拽手柄 ─── */}
        <div
          onMouseDown={handleSplitMouseDown}
          className={`w-3 shrink-0 cursor-col-resize transition-colors flex items-center justify-center group ${isDark ? 'bg-gray-800 hover:bg-brand-600' : 'bg-gray-200 hover:bg-brand-400'}`}
        >
          <div className={`w-0.5 h-8 rounded-full transition-colors ${isDark ? 'bg-gray-600 group-hover:bg-white' : 'bg-gray-400 group-hover:bg-white'}`} />
        </div>

        {/* ─── 预览区域 ─── */}
          <div className={`flex flex-col ${isDark ? 'bg-gray-950' : 'bg-gray-100'}`} style={{ width: `${100 - splitPct}%` }}>
            {/* 预览工具栏 */}
            <div className={`px-3 py-1.5 flex items-center justify-between shrink-0 border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {mode === 'preview' ? '👁️ 实时预览' : '📱 公众号适配'}
                </span>
                <div className={`flex rounded-md overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-2 py-0.5 text-xs transition-colors ${previewMode === 'desktop' ? 'bg-brand-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`}
                    title="桌面预览"
                  >
                    🖥️
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-2 py-0.5 text-xs transition-colors ${previewMode === 'mobile' ? 'bg-brand-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`}
                    title="手机预览 (375px)"
                  >
                    📱
                  </button>
                </div>
              </div>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{THEME_META[theme]?.name}</span>
            </div>

            {/* 预览内容 */}
            <div className="flex-1 overflow-hidden flex items-start justify-center p-4">
              {previewMode === 'mobile' ? (
                <div className="relative">
                  {/* 手机外壳 */}
                  <div className={`w-[375px] h-[720px] rounded-[40px] p-2 shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-800'}`}>
                    <div className={`w-full h-full rounded-[32px] overflow-hidden ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
                      <iframe ref={previewRef} className="w-full h-full border-0" title="preview" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`w-full h-full rounded-xl overflow-hidden shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                  <iframe ref={previewRef} className="w-full h-full border-0" title="preview" />
                </div>
              )}
            </div>
          </div>
        </div>

      {/* ═══ GitHub 配置弹窗 ═══ */}
      {showGithubConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`rounded-xl p-6 w-96 shadow-2xl ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>GitHub 图床配置</h3>
            <input
              className={`w-full border rounded-lg px-3 py-2 mb-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'}`}
              placeholder="Personal Access Token"
              type="password"
              value={githubConfig.token}
              onChange={e => setGithubConfig(prev => ({ ...prev, token: e.target.value }))}
            />
            <input
              className={`w-full border rounded-lg px-3 py-2 mb-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'}`}
              placeholder="仓库 (user/repo)"
              value={githubConfig.repo}
              onChange={e => setGithubConfig(prev => ({ ...prev, repo: e.target.value }))}
            />
            <input
              className={`w-full border rounded-lg px-3 py-2 mb-4 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'}`}
              placeholder="分支 (main)"
              value={githubConfig.branch}
              onChange={e => setGithubConfig(prev => ({ ...prev, branch: e.target.value }))}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowGithubConfig(false)} className={`px-4 py-2 text-sm rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>取消</button>
              <button onClick={saveGithubConfig} className="px-4 py-2 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 快捷键帮助 ═══ */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
          <div className={`rounded-xl p-6 w-80 shadow-2xl ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>⌨️ 快捷键</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Ctrl + S', '下载 HTML'],
                ['Ctrl + B', '粗体'],
                ['Ctrl + I', '斜体'],
                ['Ctrl + K', '链接'],
              ].map(([key, desc]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{desc}</span>
                  <kbd className={`px-2 py-0.5 rounded text-xs font-mono ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{key}</kbd>
                </div>
              ))}
            </div>
            <button onClick={() => setShowShortcuts(false)} className="mt-4 w-full py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">知道了</button>
          </div>
        </div>
      )}
    </div>
  );
}
