/**
 * App.tsx — MD to WeChat 公众号排版编辑器 v3.2
 * 新增：自动保存草稿、Markdown工具栏、分屏拖拽、全屏编辑、段落间距
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { THEME_CSS, THEME_META, ThemeId } from './themes';
import { parseMarkdown, extractToc, countWords, estimateReadingTime } from './parser';
import { adaptForWechat, copyToClipboard } from './wechat-adapter';

const GITHUB_CDN_BASE = 'https://raw.githubusercontent.com/cscsxx606/md-to-wechat/main/images/';
const DRAFT_KEY = 'md2wx_draft';
const SPLIT_KEY = 'md2wx_split';

// ─── Prism.js 代码高亮 CSS（提取为常量，避免每次 render 重建）──
const PRISM_CSS = (isDark: boolean) => `<style>
  code[class*="language-"], pre[class*="language-"] { color:#333; background:0 0; font-family:"SFMono-Regular",Consolas,Monaco,monospace; font-size:13px; text-align:left; white-space:pre; word-spacing:normal; word-break:normal; word-wrap:normal; line-height:1.6; tab-size:4; hyphens:none; }
  pre[class*="language-"] { padding:1em; margin:.5em 0; overflow:auto; border-radius:4px; }
  :not(pre)>code[class*="language-"] { padding:.1em; border-radius:.3em; }
  .token.comment,.token.block-comment,.token.prolog,.token.doctype,.token.cdata { color:#7d8b99; }
  .token.punctuation { color:#5f6364; }
  .token.property,.token.tag,.token.boolean,.token.number,.token.function-name,.token.constant,.token.symbol,.token.deleted { color:#c92c2c; }
  .token.selector,.token.attr-name,.token.string,.token.char,.token.function,.token.builtin,.token.inserted { color:#2f9c0a; }
  .token.operator,.token.entity,.token.url,.token.variable { color:#a67f59; }
  .token.atrule,.token.attr-value,.token.keyword,.token.class-name { color:#1990b8; }
  .token.regex,.token.important { color:#e90; } .token.important,.token.bold { font-weight:700; } .token.italic { font-style:italic; } .token.entity { cursor:help; }
  ${isDark ? `
  code[class*="language-"], pre[class*="language-"] { color:#e0e0e0; }
  .token.comment { color:#6a737d; } .token.punctuation { color:#9e9e9e; }
  .token.property,.token.tag,.token.boolean,.token.number,.token.constant,.token.symbol,.token.deleted { color:#ff8a80; }
  .token.selector,.token.attr-name,.token.string,.token.char,.token.function,.token.builtin,.token.inserted { color:#69f0ae; }
  .token.operator,.token.entity,.token.url,.token.variable { color:#ffd54f; }
  .token.atrule,.token.attr-value,.token.keyword,.token.class-name { color:#82b1ff; }` : ''}
  .nice-code { background:#f8f9fa; border:1px solid #eaeaea; }
  .nice-footnotes { padding:12px 16px; background:#fafafa; border-radius:6px; margin-top:20px; }
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

// ─── Markdown 工具栏配置 ────────────────────────────
interface ToolbarAction {
  key: string;  label: string;  title: string;
  prefix: string;  suffix: string;  block?: boolean;
}

const TOOLBAR_ITEMS: ToolbarAction[] = [
  { key: 'bold', label: 'B', title: '粗体 (Ctrl+B)', prefix: '**', suffix: '**' },
  { key: 'italic', label: 'I', title: '斜体 (Ctrl+I)', prefix: '*', suffix: '*' },
  { key: 'strike', label: 'S', title: '删除线', prefix: '~~', suffix: '~~' },
  { key: 'code', label: '`', title: '行内代码', prefix: '`', suffix: '`' },
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

export default function App() {
  // ── 状态 ──
  const [md, setMd] = useState(() => {
    // 恢复草稿
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        // 恢复主题
        return parsed.md || DEFAULT_MD;
      }
    } catch {}
    return DEFAULT_MD;
  });
  const [theme, setTheme] = useState<ThemeId>(() => {
    try { const d = localStorage.getItem(DRAFT_KEY); return d ? JSON.parse(d).theme || 'default' : 'default'; } catch { return 'default'; }
  });
  const [mode, setMode] = useState<'preview' | 'wechat'>('preview');
  const [showToc, setShowToc] = useState(false);
  const [autoSpace, setAutoSpace] = useState(true);
  const [firstIndent, setFirstIndent] = useState(false);
  const [imageMode, setImageMode] = useState<ImageMode>('base64');
  const [dragOver, setDragOver] = useState(false);
  const [copySuccessWechat, setCopySuccessWechat] = useState(false);
  const [copySuccessHtml, setCopySuccessHtml] = useState(false);
  const [importedFileName, setImportedFileName] = useState('');
  const [showImageToolbar, setShowImageToolbar] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [draftRestored, setDraftRestored] = useState(() => {
    try { return !!localStorage.getItem(DRAFT_KEY); } catch { return false; }
  });
  const [spacing, setSpacing] = useState<'compact' | 'normal' | 'loose'>('normal');
  const [splitPct, setSplitPct] = useState(() => {
    try { const v = localStorage.getItem(SPLIT_KEY); return v ? parseInt(v) : 50; } catch { return 50; }
  });
  const [githubConfig, setGitHubConfig] = useState<GitHubConfig>(() => {
    try {
      const saved = sessionStorage.getItem('md2wx_github');
      return saved ? JSON.parse(saved) : { token: '', repo: '', branch: 'main' };
    } catch { return { token: '', repo: '', branch: 'main' }; }
  });
  const [showGithubConfig, setShowGithubConfig] = useState(false);
  const [showImagePanel, setShowImagePanel] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const imgRefCounter = useRef(0);

  // ── 提取内嵌 base64 图片引用 ──
  interface ImageRef {
    id: string;
    alt: string;
    url: string;
    sizeKB: number;
  }
  const extractImageRefs = useCallback((markdown: string): ImageRef[] => {
    const refs: ImageRef[] = [];
    const refDefRegex = /^\[([^\]]+)\]:\s+(data:image\/[a-zA-Z0-9.+]+;base64,[A-Za-z0-9+/=]+)$/gm;
    let match;
    while ((match = refDefRegex.exec(markdown)) !== null) {
      const id = match[1];
      const url = match[2];
      const altMatch = markdown.match(new RegExp(`!\\[([^\\]]*)\\]\\[${id}\\]`));
      const alt = altMatch ? altMatch[1] : '图片';
      const base64Part = url.split(',')[1];
      const sizeKB = base64Part ? Math.round((base64Part.length * 0.75) / 1024) : 0;
      refs.push({ id, alt, url, sizeKB });
    }
    return refs;
  }, []);
  const imageRefs = useMemo(() => extractImageRefs(md), [md, extractImageRefs]);

  const wordCount = useMemo(() => countWords(md), [md]);
  const readingTime = useMemo(() => estimateReadingTime(md), [md]);
  const tocItems = useMemo(() => extractToc(md), [md]);

  // ── 自动保存草稿（防抖 1 秒）──
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ md, theme })); } catch {}
    }, 1000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [md, theme]);

  // ── 渲染 HTML ──
  const renderHtml = useCallback((inputMd: string, inputTheme: ThemeId, inputMode: 'preview' | 'wechat') => {
    const css = THEME_CSS[inputTheme] || THEME_CSS.default;
    let extraCss = '';
    if (firstIndent) extraCss += `#nice p.nice-indent, #nice p { text-indent:2em; }`;
    // 段落间距
    const spacingMap = { compact: '6px', normal: '12px', loose: '20px' };
    extraCss += `#nice p { margin-top:${spacingMap[spacing]} !important; margin-bottom:${spacingMap[spacing]} !important; }`;
    // 公众号模式统一字号
    if (inputMode === 'wechat') {
      extraCss += `#nice, #nice p, #nice li, #nice td, #nice th { font-size:15px !important; }`;
    }

    let bodyHtml = parseMarkdown(inputMd, { autoSpace, showToc, firstIndent });
    if (inputMode === 'wechat') bodyHtml = adaptForWechat(bodyHtml);

    const wrapped = `<div id="nice">${bodyHtml}</div>`;

    const prismCSS = PRISM_CSS(inputTheme === 'dark');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>${css}${extraCss}${prismCSS}</style></head><body style="margin:0;padding:0;">${wrapped}</body></html>`;
  }, [autoSpace, showToc, firstIndent, spacing]);

  // ── iframe 预览优化：分离样式初始化和内容更新 ──
  // 初始化 iframe 样式（theme 变化时重建）
  useEffect(() => {
    const iframe = previewRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    const css = THEME_CSS[theme] || THEME_CSS.default;
    const prismCSS = PRISM_CSS(theme === 'dark');
    // 额外 CSS：段落间距、缩进等
    let extraCss = '';
    if (firstIndent) extraCss += `#nice p.nice-indent, #nice p { text-indent:2em; }`;    const spacingMap = { compact: '6px', normal: '12px', loose: '20px' };
    extraCss += `#nice p { margin-top:${spacingMap[spacing]} !important; margin-bottom:${spacingMap[spacing]} !important; }`;
    if (mode === 'wechat') extraCss += `#nice, #nice p, #nice li, #nice td, #nice th { font-size:15px !important; }`;    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>${css}${extraCss}${prismCSS}</style></head><body style="margin:0;padding:0;"></body></html>`);
    doc.close();
  }, [theme, spacing, firstIndent, mode]);

  // 内容变化时只更新 body（避免重建 iframe，优化性能）
  useEffect(() => {
    const doc = previewRef.current?.contentDocument;
    if (!doc || !doc.body) return;
    const bodyHtml = parseMarkdown(md, { autoSpace, showToc, firstIndent });
    const adapted = mode === 'wechat' ? adaptForWechat(bodyHtml) : bodyHtml;
    doc.body.innerHTML = `<div id="nice">${adapted}</div>`;
  }, [md, autoSpace, showToc, firstIndent, mode]);

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
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleDownload(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleDownload]);

  // ── 文本选区操作 ──
  const wrapSelection = useCallback((prefix: string, suffix: string, block?: boolean) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const text = ta.value;
    const sel = text.substring(start, end);

    if (block) {
      // 块级元素：整行或选中内容前插入前缀
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

  // ── 追加 Markdown ──
  const appendMd = useCallback((text: string, isBase64Image = false) => {
    if (isBase64Image) {
      // 从 text 中搜索 ![alt](url) 格式的图片（可能前面有压缩提示等前缀）
      const imgMatch = text.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (!imgMatch) {
        // fallback：当做普通文本
        setMd((prev: string) => prev + '\n' + text + '\n');
        return;
      }
      const [, alt, base64Src] = imgMatch;
      imgRefCounter.current++;
      const refId = `img-${imgRefCounter.current}`;
      const inlineImg = `![${alt || '图片'}][${refId}]`;
      const refDef = `\n[${refId}]: ${base64Src}`;
      setMd((prev: string) => {
        const ta = textareaRef.current;
        if (!ta) return prev + '\n' + inlineImg + refDef;
        const start = ta.selectionStart, end = ta.selectionEnd;
        const before = prev.slice(0, start), after = prev.slice(end);
        const newText = before + (before && !before.endsWith('\n') ? '\n' : '') + inlineImg + refDef + '\n' + after;
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

  // ── 提取内联 base64 图片为引用式链接（净化编辑器视图）──
  const extractInlineBase64Images = useCallback((markdown: string): string => {
    // 匹配 ![alt](data:image/xxx;base64,...) 内联图片
    const inlineBase64Regex = /!\[([^\]]*)\]\((data:image\/[a-zA-Z0-9.+]+;base64,[A-Za-z0-9+/=]+)\)/g;
    const refs: string[] = [];
    let counter = 0;
    let cleaned = markdown;

    cleaned = cleaned.replace(inlineBase64Regex, (_match, alt: string, dataUri: string) => {
      counter++;
      const refId = `img-${Date.now()}-${counter}`;
      refs.push(`[${refId}]: ${dataUri}`);
      return `![${alt || '图片'}][${refId}]`;
    });

    if (refs.length > 0) {
      // 确保文末有空行再追加引用定义
      cleaned = cleaned.trimEnd() + '\n\n' + refs.join('\n') + '\n';
    }

    return cleaned;
  }, []);

  // ── MD 文件导入 ──
  const handleMdImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      let content = reader.result as string;
      // 自动将内联 base64 图片提取为引用式链接，避免污染编辑器正文
      content = extractInlineBase64Images(content);
      setMd(content);
      setImportedFileName(file.name);
    };
    reader.readAsText(file, 'UTF-8');
  }, [extractInlineBase64Images]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleMdImport(file);
  }, [handleMdImport]);
  // ── 图片压缩（优化：保留 PNG 透明度）──
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
        
        // 检测是否有透明像素
        const hasTransparency = (): boolean => {
          if (file.type !== 'image/png') return false;
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;
          for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 255) return true;
          }
          return false;
        };
        
        const preservePNG = hasTransparency();
        if (preservePNG) {
          // PNG 有透明像素 → 使用 PNG 格式保留透明度
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('PNG 压缩失败'));
          }, 'image/png', 0.9);
        } else {
          // 无透明像素 → JPEG 压缩（更高效）
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

  // ── 图片上传 ──
  const uploadImage = useCallback(async (file: File) => {
    const MAX_BASE64_KB = 400;
    let blob: Blob = file;
    if (file.size > MAX_BASE64_KB * 1024) {
      try { blob = await compressImage(file, MAX_BASE64_KB, 1920); } catch {}
    }
    if (imageMode === 'base64') {
      const reader = new FileReader();
      reader.onload = () => {
        appendMd(`![](${reader.result as string})`, true);  // alt 为空，避免显示图注
      };
      reader.readAsDataURL(blob);
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
          if (res.ok) appendMd(`![](${GITHUB_CDN_BASE}${fileName})`);  // alt 为空，避免显示图注
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

  // 保存分屏比例
  useEffect(() => {
    try { localStorage.setItem(SPLIT_KEY, String(Math.round(splitPct))); } catch {}
  }, [splitPct]);

  const saveGithubConfig = () => {
    sessionStorage.setItem('md2wx_github', JSON.stringify(githubConfig));
    setShowGithubConfig(false);
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftRestored(false);
    setMd(DEFAULT_MD);
  };

  // ── 图片排版 ──
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

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight">MD <span className="text-amber-400">→</span> WeChat</h1>
          <span className="text-xs text-gray-400 hidden sm:inline">v3.2</span>
          {draftRestored && (
            <span className="flex items-center gap-1 text-xs">
              <span className="text-amber-400">📝 草稿已恢复</span>
              <button onClick={clearDraft} className="text-gray-500 hover:text-gray-300 underline">清除</button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* 段落间距 */}
          <select className="bg-gray-800 text-white text-xs border border-gray-700 rounded px-1.5 py-1" value={spacing} onChange={e => setSpacing(e.target.value as any)} title="段落间距">
            <option value="compact">紧凑</option>
            <option value="normal">标准</option>
            <option value="loose">宽松</option>
          </select>

          <label className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" checked={autoSpace} onChange={e => setAutoSpace(e.target.checked)} className="w-3 h-3" />间距
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" checked={showToc} onChange={e => setShowToc(e.target.checked)} className="w-3 h-3" />TOC
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" checked={firstIndent} onChange={e => setFirstIndent(e.target.checked)} className="w-3 h-3" />缩进
          </label>

          <select className="bg-gray-800 text-white text-xs border border-gray-700 rounded px-2 py-1" value={theme} onChange={e => setTheme(e.target.value as ThemeId)}>
            {(Object.keys(THEME_META) as ThemeId[]).map(id => <option key={id} value={id}>{THEME_META[id].name}</option>)}
          </select>

          <div className="flex bg-gray-800 rounded-md p-0.5">
            <button className={`px-2 py-0.5 text-xs rounded ${mode === 'preview' ? 'bg-gray-600 text-white' : 'text-gray-400'}`} onClick={() => setMode('preview')}>预览</button>
            <button className={`px-2 py-0.5 text-xs rounded ${mode === 'wechat' ? 'bg-gray-600 text-white' : 'text-gray-400'}`} onClick={() => setMode('wechat')}>公众号</button>
          </div>

          <button onClick={() => setFullscreen(!fullscreen)} className={`px-2 py-0.5 text-xs rounded ${fullscreen ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-white'}`} title="全屏编辑">
            {fullscreen ? '⊠' : '⛶'}
          </button>

          <button onClick={handleCopy} className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded transition-colors">{copySuccessHtml ? '✅ 已复制' : '复制HTML'}</button>
          <button onClick={handleCopyForWechat} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors">
            {copySuccessWechat ? '✅ 已复制' : '复制到公众号'}
          </button>
          <button onClick={handleDownload} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded transition-colors">下载</button>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden" ref={splitRef}>
        {/* Editor */}
        <div
          className={`flex flex-col border-r border-gray-200 bg-white relative ${fullscreen ? '' : ''} ${dragOver ? 'ring-2 ring-amber-400 ring-inset' : ''}`}
          style={{ width: fullscreen ? '100%' : `${splitPct}%` }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {/* 编辑区顶栏 */}
          <div className="px-3 py-1 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 flex justify-between items-center shrink-0">
            <span className="flex items-center gap-2">
              <span>Markdown</span>
              {importedFileName && <span className="text-amber-600 font-medium">📄 {importedFileName}</span>}
            </span>
            <span className="flex gap-2 items-center">
              <span>字:{wordCount.total} | ~{readingTime}min | H:{tocItems.length}</span>
              <button onClick={() => setShowImageToolbar(!showImageToolbar)} className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition-colors" title="图片排版">🖼️</button>
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 rounded-md shadow-sm hover:shadow transition-all" title="导入 Markdown 文件">
                <span>📄</span>
                <span>导入 MD</span>
              </button>
            </span>
          </div>

          {/* Markdown 工具栏 */}
          <div className="px-2 py-1 bg-gray-100 border-b border-gray-200 flex gap-0.5 flex-wrap shrink-0">
            {TOOLBAR_ITEMS.map(item => item.key.startsWith('divider')
              ? <span key={item.key} className="w-px bg-gray-300 mx-1" />
              : <button key={item.key} onClick={() => handleToolbar(item)}
                  className="px-1.5 py-0.5 text-xs hover:bg-gray-200 rounded transition-colors text-gray-600"
                  title={item.title}>{item.label}</button>
            )}
          </div>

          {/* 图片排版工具栏 */}
          {showImageToolbar && (
            <div className="px-3 py-1.5 bg-gray-100 border-b border-gray-200 flex gap-1.5 flex-wrap shrink-0">
              {imgLayouts.map(l => (
                <button key={l.key} onClick={() => insertImageLayout(l.key)}
                  className="px-2 py-0.5 text-xs bg-white border border-gray-300 hover:bg-amber-50 hover:border-amber-400 rounded transition-colors"
                  title={l.desc}>{l.label}</button>
              ))}
              <button onClick={() => setShowImageToolbar(false)} className="px-1.5 py-0.5 text-xs text-gray-400 hover:text-gray-600 ml-auto">✕</button>
            </div>
          )}

          {dragOver && (
            <div className="absolute inset-0 bg-amber-50/80 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-amber-600 font-medium text-lg">松开上传图片 / 导入 MD</div>
            </div>
          )}

          {/* 图床模式 */}
          <div className="px-3 py-1 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 flex items-center gap-2 shrink-0">
            <span>图床:</span>
            <button onClick={() => setImageMode('base64')} className={`px-1.5 py-0.5 rounded transition-colors ${imageMode === 'base64' ? 'bg-amber-100 text-amber-700 font-medium' : 'hover:bg-gray-200 text-gray-400'}`}>Base64</button>
            <button onClick={() => setImageMode('github')} className={`px-1.5 py-0.5 rounded transition-colors ${imageMode === 'github' ? 'bg-amber-100 text-amber-700 font-medium' : 'hover:bg-gray-200 text-gray-400'}`}>GitHub</button>
            {imageMode === 'github' && !githubConfig.token && (
              <button onClick={() => setShowGithubConfig(true)} className="text-amber-600 hover:underline">⚙️ Token</button>
            )}
            {imageMode === 'github' && githubConfig.token && <span className="text-green-600 text-xs">✅</span>}
          </div>

          <input ref={fileInputRef} type="file" accept=".md,.markdown,.txt" onChange={handleFileInputChange} className="hidden" />
          <textarea ref={textareaRef}
            className="flex-1 w-full p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed text-gray-700"
            value={md} onChange={e => setMd(e.target.value)} onPaste={handlePaste} spellCheck={false}
            placeholder="在此输入 Markdown...&#10;Ctrl+V 粘贴截图 | 拖拽上传/导入MD | Ctrl+S 下载"
          />

          {/* 内嵌图片折叠面板 */}
          {imageRefs.length > 0 && (
            <div className="shrink-0 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowImagePanel(p => !p)}
                className="w-full px-3 py-1.5 text-xs text-gray-600 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  📎 内嵌图片 ({imageRefs.length})
                </span>
                <span>{showImagePanel ? '▲' : '▼'}</span>
              </button>
              {showImagePanel && (
                <div className="max-h-48 overflow-y-auto px-3 py-2 space-y-2">
                  {imageRefs.map(ref => (
                    <div key={ref.id} className="flex items-center gap-2 text-xs">
                      <img src={ref.url} alt={ref.alt} className="w-10 h-10 object-cover rounded border border-gray-200 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-700 truncate">[{ref.id}] {ref.alt}</div>
                        <div className="text-gray-400">{ref.sizeKB} KB · Base64</div>
                      </div>
                      <button
                        onClick={() => {
                          setMd((prev: string) => {
                            // 删除引用标记和引用定义
                            let cleaned = prev
                              .replace(new RegExp(`!\\[([^\\]]*)\\]\\[${ref.id}\\]\\n?`, 'g'), '')
                              .replace(new RegExp(`\\n?\\[${ref.id}\\]:\\s+[^\\n]+\\n?`, 'g'), '');
                            // 清理多余空行
                            cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
                            return cleaned;
                          });
                        }}
                        className="text-red-400 hover:text-red-600 px-1 shrink-0"
                        title="删除"
                      >🗑</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 分屏拖拽手柄 */}
        {!fullscreen && (
          <div
            onMouseDown={handleSplitMouseDown}
            className="w-2 bg-gray-200 hover:bg-amber-400 cursor-col-resize shrink-0 transition-colors flex items-center justify-center"
            title="拖拽调整分屏"
          >
            <div className="w-0.5 h-8 bg-gray-400 rounded" />
          </div>
        )}

        {/* Preview */}
        {!fullscreen && (
          <div className="flex flex-col bg-gray-100" style={{ width: `${100 - splitPct}%` }}>
            <div className="px-3 py-1 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 flex justify-between items-center shrink-0">
              <span>{mode === 'preview' ? '实时预览' : '公众号适配（外链转脚注/字号统一）'}</span>
              <span className="text-gray-400">{THEME_META[theme]?.name}</span>
            </div>
            <div className="flex-1 overflow-hidden bg-white">
              <iframe ref={previewRef} className="w-full h-full border-0" title="preview" />
            </div>
          </div>
        )}
      </div>

      {/* GitHub Config Modal */}
      {showGithubConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-bold mb-4">GitHub 图床配置</h3>
            <input className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-sm" placeholder="Personal Access Token" type="password"
              value={githubConfig.token} onChange={e => setGitHubConfig(prev => ({ ...prev, token: e.target.value }))} />
            <input className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-sm" placeholder="仓库 (user/repo)"
              value={githubConfig.repo} onChange={e => setGitHubConfig(prev => ({ ...prev, repo: e.target.value }))} />
            <input className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm" placeholder="分支 (main)"
              value={githubConfig.branch} onChange={e => setGitHubConfig(prev => ({ ...prev, branch: e.target.value }))} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowGithubConfig(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">取消</button>
              <button onClick={saveGithubConfig} className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
