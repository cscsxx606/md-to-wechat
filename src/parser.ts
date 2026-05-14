/**
 * parser.ts — Markdown → 公众号 HTML 解析器（基于 markdown-it）
 * v3.1: 新增图片排版（对齐/尺寸/图注/画廊）
 */

import MarkdownIt from 'markdown-it';
import Prism from 'prismjs';

import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-nginx';
import 'prismjs/components/prism-graphql';

// ─── 中英文自动间距 ───────────────────────────────────

export function autoSpaceText(html: string): string {
  // 按 HTML 标签拆分，只处理标签外的文本节点，避免破坏属性和 URL
  const parts = html.split(/(<[^>]+>)/g);
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith('<')) continue; // 跳过标签
    let text = parts[i];
    text = text.replace(/([\u4e00-\u9fff\u3400-\u4dbf])([a-zA-Z0-9$])/g, '$1\u2009$2');
    text = text.replace(/([a-zA-Z0-9$])([\u4e00-\u9fff\u3400-\u4dbf])/g, '$1\u2009$2');
    text = text.replace(/([\u4e00-\u9fff\u3400-\u4dbf])([\(\[])/g, '$1\u2009$2');
    text = text.replace(/([\)\]])([\u4e00-\u9fff\u3400-\u4dbf])/g, '$1\u2009$2');
    parts[i] = text;
  }
  return parts.join('');
}

// ─── 语言别名 ──────────────────────────────────────────

const LANG_ALIAS: Record<string, string> = {
  js: 'javascript', ts: 'typescript', py: 'python',
  sh: 'bash', zsh: 'bash', shell: 'bash',
  rb: 'ruby', yml: 'yaml', md: 'markdown',
  dockerfile: 'docker', conf: 'nginx',
  cpp: 'cpp', cs: 'csharp', kt: 'kotlin',
};

function getPrismLang(lang: string): string {
  const normalized = (lang || '').toLowerCase().trim();
  const mapped = LANG_ALIAS[normalized] ?? normalized;
  if (mapped && Prism.languages[mapped]) return mapped;
  return '';
}

// ─── 图片排版语法解析 ────────────────────────────────

/**
 * 支持的图片语法扩展:
 *   ![alt](url)              — 标准图片
 *   ![alt](url#center)       — 居中
 *   ![alt](url#right)        — 右对齐
 *   ![alt](url#300)          — 指定宽度 300px（自动等比缩放）
 *   ![alt](url#center-300)   — 居中 + 300px 宽
 *   ![alt](url#300x200)      — 指定宽高 300×200
 *   
 *   [img-gallery]  ... [/img-gallery] — 图片画廊（2-3 列网格）
 *   ![图注文字](url) → <figure> 包装，显示图注
 */

interface ImageLayout {
  align?: 'center' | 'right';
  width?: number;
  height?: number;
}

function parseImageLayout(url: string): { cleanUrl: string; layout: ImageLayout } {
  const hashIdx = url.indexOf('#');
  if (hashIdx === -1) return { cleanUrl: url, layout: {} };
  
  const cleanUrl = url.slice(0, hashIdx);
  const fragment = url.slice(hashIdx + 1);
  const layout: ImageLayout = {};
  const parts = fragment.split('-');
  
  for (const part of parts) {
    if (part === 'center') layout.align = 'center';
    else if (part === 'right') layout.align = 'right';
    else {
      const sizeMatch = part.match(/^(\d+)x(\d+)$/);
      if (sizeMatch) {
        layout.width = parseInt(sizeMatch[1]);
        layout.height = parseInt(sizeMatch[2]);
      } else {
        const wMatch = part.match(/^(\d+)$/);
        if (wMatch) layout.width = parseInt(wMatch[1]);
      }
    }
  }
  
  return { cleanUrl, layout };
}

function renderImageFigure(alt: string, src: string, layout: ImageLayout): string {
  const styles: string[] = ['max-width:100%', 'height:auto'];
  
  if (layout.width) styles.push(`width:${layout.width}px`);
  if (layout.align === 'center') styles.push('display:block', 'margin:0 auto');
  else if (layout.align === 'right') styles.push('float:right', 'margin-left:12px');
  
  const style = styles.join(';');
  const imgHtml = `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" style="${style}" loading="lazy" />`;
  
  // 有 alt 文本 → 显示图注
  if (alt && !alt.startsWith('图片') && !alt.match(/^image\d*$/i)) {
    return `<figure class="nice-figure" style="margin:16px 0;text-align:${layout.align || 'center'};">
      ${imgHtml}
      <figcaption class="nice-figcaption" style="font-size:13px;color:#888;margin-top:6px;line-height:1.6;">${escapeHtml(alt)}</figcaption>
    </figure>`;
  }
  
  // 无图注但需要对齐
  if (layout.align === 'center') {
    return `<div style="text-align:center;margin:16px 0;">${imgHtml}</div>`;
  }
  if (layout.align === 'right') {
    return `<div style="text-align:right;margin:16px 0;">${imgHtml}</div>`;
  }
  
  return `<div style="margin:16px 0;">${imgHtml}</div>`;
}

function escapeAttr(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── 图片画廊处理 ────────────────────────────────────

function processImageGallery(html: string): string {
  return html.replace(
    /\[img-gallery\]\s*([\s\S]*?)\s*\[\/img-gallery\]/g,
    (_match, content: string) => {
      const images = content.trim().split('\n').filter(Boolean);
      const count = images.length;
      const cols = count <= 2 ? 2 : 3;
      const gapPx = 8;
      
      let galleryHtml = `<div class="nice-gallery" style="display:flex;flex-wrap:wrap;gap:${gapPx}px;margin:16px 0;">`;
      for (const img of images) {
        galleryHtml += `<div style="flex:0 0 calc(${100 / cols}% - ${gapPx}px);min-width:120px;">${img.trim()}</div>`;
      }
      galleryHtml += '</div>';
      return galleryHtml;
    }
  );
}

// ─── markdown-it 实例 ──────────────────────────────────

const md: MarkdownIt = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
  langPrefix: 'language-',
  highlight: (str: string, lang: string): string => {
    const prismLang = getPrismLang(lang);
    if (prismLang) {
      try {
        const highlighted = Prism.highlight(str, Prism.languages[prismLang], prismLang);
        return `<pre class="nice-code language-${prismLang}"><code class="language-${prismLang}">${highlighted}</code></pre>`;
      } catch { /* fall through */ }
    }
    return `<pre class="nice-code"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

// ─── 自定义渲染规则 ──────────────────────────────────

md.renderer.rules.table_open = () => '<div class="table-wrap"><table class="nice-table">';
md.renderer.rules.table_close = () => '</table></div>';
md.renderer.rules.blockquote_open = () => '<blockquote class="nice-quote">\n';
md.renderer.rules.bullet_list_open = () => '<ul class="nice-ul">\n';
md.renderer.rules.ordered_list_open = (tokens, idx) => {
  const token = tokens[idx];
  const start = token.attrGet('start');
  return start && start !== '1'
    ? `<ol class="nice-ol" start="${start}">\n`
    : '<ol class="nice-ol">\n';
};
md.renderer.rules.hr = () => '<hr class="nice-hr" />\n';
md.renderer.rules.code_inline = (tokens, idx) => {
  const content = md.utils.escapeHtml(tokens[idx].content);
  return `<code class="inline-code">${content}</code>`;
};

// ── 图片渲染（核心：支持排版语法）──
md.renderer.rules.image = (tokens, idx) => {
  const token = tokens[idx];
  const src = token.attrGet('src') || '';
  const alt = token.content || '';
  
  const { cleanUrl, layout } = parseImageLayout(src);
  
  // 更新 src 为干净的 URL
  token.attrSet('src', cleanUrl);
  
  return renderImageFigure(alt, cleanUrl, layout);
};

// ─── TOC ──────────────────────────────────────────────

export interface TocItem {
  level: number;
  text: string;
  id: string;
}

export function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '');
    items.push({ level, text, id });
  }
  return items;
}

export function renderToc(items: TocItem[]): string {
  if (items.length === 0) return '';
  let html = '<div class="nice-toc"><div class="nice-toc-title">📑 目录</div><ul>';
  for (const item of items) {
    const cls = item.level === 2 ? 'toc-h2' : item.level === 3 ? 'toc-h3' : '';
    html += `<li class="${cls}"><a href="#${item.id}">${escapeHtml(item.text)}</a></li>`;
  }
  html += '</ul></div>';
  return html;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── 主解析函数 ──────────────────────────────────────

function addHeadingIds(html: string): string {
  return html.replace(
    /<(h[1-3])([^>]*)>(.+?)<\/h[1-3]>/gi,
    (_match, tag: string, attrs: string, content: string) => {
      const id = content.replace(/<[^>]+>/g, '').toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '');
      return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
    }
  );
}

function injectToc(html: string, markdown: string): string {
  const tocItems = extractToc(markdown);
  if (tocItems.length < 2) return html;
  const tocHtml = renderToc(tocItems);
  const firstHeading = html.match(/<h[123][ >]/);
  if (firstHeading?.index !== undefined) {
    return html.slice(0, firstHeading.index) + tocHtml + '\n' + html.slice(firstHeading.index);
  }
  return tocHtml + '\n' + html;
}

export interface ParseOptions {
  autoSpace?: boolean;
  showToc?: boolean;
  firstIndent?: boolean;
}

/**
 * 在渲染前把引用式 base64 图片展开为内联图片，并移除引用定义。
 * 左侧编辑器保持 ![alt][refId] 的清爽引用语法，
 * 右侧预览/复制时展开为完整内联 base64，确保 markdown-it 正确渲染且不留残留文本。
 */
function expandBase64Refs(markdown: string): string {
  const refs: Record<string, string> = {};

  // 1. 收集所有 data URI 引用定义
  markdown.replace(
    /^\[([^\]]+)\]:\s+(data:image\/[a-zA-Z0-9.+]+;base64,[A-Za-z0-9+/=]+)$/gm,
    (_match, refId, url) => {
      refs[refId] = url;
      return _match;
    }
  );

  // 2. 先移除所有 base64 引用定义行（避免残留为普通文本）
  let cleaned = markdown.replace(
    /^\[([^\]]+)\]:\s+(data:image\/[a-zA-Z0-9.+]+;base64,[A-Za-z0-9+/=]+)\n?/gm,
    ''
  );

  // 3. 把 ![alt][refId] 展开为 ![alt](data:...)
  cleaned = cleaned.replace(/!\[([^\]]*)\]\[([^\]]*)\]/g, (match, alt, refId) => {
    const url = refs[refId];
    if (url) return `![${alt}](${url})`;
    return match;
  });

  // 4. 清理可能产生的多余空行
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned;
}

export function parseMarkdown(markdown: string, options: ParseOptions = {}): string {
  markdown = expandBase64Refs(markdown);
  let html = md.render(markdown);
  html = addHeadingIds(html);
  html = processImageGallery(html);
  if (options.showToc) html = injectToc(html, markdown);
  if (options.autoSpace) html = autoSpaceText(html);
  if (options.firstIndent) html = html.replace(/<p>/g, '<p class="nice-indent">');
  return html;
}

// ─── 字数统计 ──────────────────────────────────────

export function countWords(markdown: string) {
  const clean = markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
  const text = clean.replace(/[#*>\-\[\]()|!_~]/g, '').trim();
  const chinese = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  const english = (text.match(/[a-zA-Z]+/g) || []).reduce((sum, w) => sum + w.length, 0);
  return { chinese, english, total: chinese + english };
}

export function estimateReadingTime(markdown: string): number {
  const { chinese, english } = countWords(markdown);
  return Math.max(1, Math.ceil(chinese / 300 + english / 200));
}
