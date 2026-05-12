import { useState, useEffect, useCallback, useRef } from 'react';

const THEME_CSS: Record<string, string> = {
  default: `/* 全局属性 */
#nice { font-size: 15px; color: #333333; line-height: 1.75; word-spacing: 1px; letter-spacing: 1px; word-break: break-word; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; max-width: 680px; margin: 0 auto; }
#nice p { margin: 10px 0; color: #4a4a4a; line-height: 1.8; font-size: 15px; }
#nice h1 { font-size: 24px; font-weight: bold; color: #1a1a1a; text-align: center; margin-top: 30px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #f5a623; line-height: 1.4; }
#nice h2 { font-size: 20px; font-weight: bold; color: #1a1a1a; margin-top: 25px; margin-bottom: 15px; padding-left: 12px; border-left: 4px solid #f5a623; line-height: 1.4; }
#nice h3 { font-size: 17px; font-weight: bold; color: #333333; margin-top: 20px; margin-bottom: 10px; line-height: 1.4; }
#nice h4 { font-size: 16px; font-weight: bold; color: #444444; margin-top: 15px; margin-bottom: 8px; }
#nice h5, #nice h6 { font-size: 15px; font-weight: bold; color: #555555; margin-top: 12px; margin-bottom: 6px; }
#nice blockquote.nice-quote { margin: 20px 0; padding: 15px 20px; background-color: #fff9f0; border-left: 4px solid #f5a623; color: #666666; font-size: 14px; line-height: 1.8; border-radius: 0 4px 4px 0; }
#nice blockquote.nice-quote p { margin: 0; color: #666666; }
#nice pre.code-block { margin: 20px 0; padding: 16px; background-color: #f8f9fa; border-radius: 6px; overflow-x: auto; font-size: 13px; line-height: 1.6; border: 1px solid #eaeaea; }
#nice pre.code-block code { font-family: "SFMono-Regular", Consolas, monospace; background-color: transparent; padding: 0; font-size: 13px; }
#nice code.inline-code { background-color: #fff5f5; color: #e53935; padding: 2px 6px; border-radius: 3px; font-size: 13px; font-family: "SFMono-Regular", Consolas, monospace; }
#nice a { color: #f5a623; text-decoration: none; border-bottom: 1px solid #f5a623; }
#nice ul.nice-ul, #nice ol.nice-ol { margin: 10px 0; padding-left: 24px; }
#nice ul.nice-ul li, #nice ol.nice-ol li { margin: 6px 0; line-height: 1.8; color: #4a4a4a; }
#nice table.nice-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; line-height: 1.6; }
#nice table.nice-table thead { background-color: #f5a623; color: #ffffff; }
#nice table.nice-table th, #nice table.nice-table td { padding: 10px 12px; border: 1px solid #e0e0e0; text-align: left; }
#nice table.nice-table tbody tr:nth-child(even) { background-color: #fafafa; }
#nice table.nice-table tbody tr:hover { background-color: #f5f5f5; }
#nice img { max-width: 100%; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
#nice hr.nice-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, #e0e0e0, transparent); margin: 30px 0; }
#nice strong { color: #1a1a1a; font-weight: bold; }
#nice em { color: #555555; font-style: italic; }
#nice del { color: #999999; }`,

  elegant: `#nice { font-size: 15px; color: #2c3e50; line-height: 1.8; word-spacing: 0.5px; letter-spacing: 0.5px; font-family: "PingFang SC", "Microsoft YaHei", sans-serif; padding: 24px; max-width: 680px; margin: 0 auto; }
#nice p { margin: 12px 0; color: #34495e; line-height: 1.9; font-size: 15px; }
#nice h1 { font-size: 26px; font-weight: 600; color: #1a252f; text-align: left; margin-top: 32px; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 1px solid #ecf0f1; }
#nice h2 { font-size: 21px; font-weight: 600; color: #1a252f; margin-top: 28px; margin-bottom: 14px; padding-bottom: 6px; border-bottom: 1px solid #ecf0f1; }
#nice h3 { font-size: 18px; font-weight: 600; color: #2c3e50; margin-top: 22px; margin-bottom: 10px; }
#nice h4, #nice h5, #nice h6 { font-size: 15px; font-weight: 600; color: #34495e; margin-top: 16px; margin-bottom: 8px; }
#nice blockquote.nice-quote { margin: 20px 0; padding: 16px 20px; background-color: #f8f9fa; border-left: 3px solid #2c3e50; color: #5d6d7e; font-size: 14px; line-height: 1.8; }
#nice pre.code-block { margin: 20px 0; padding: 16px; background-color: #f4f6f7; border-radius: 4px; overflow-x: auto; font-size: 13px; line-height: 1.6; }
#nice code.inline-code { background-color: #ecf0f1; color: #c0392b; padding: 2px 5px; border-radius: 3px; font-size: 13px; }
#nice a { color: #2980b9; text-decoration: none; border-bottom: 1px solid #2980b9; }
#nice ul.nice-ul, #nice ol.nice-ol { margin: 12px 0; padding-left: 28px; }
#nice ul.nice-ul li, #nice ol.nice-ol li { margin: 8px 0; line-height: 1.8; color: #34495e; }
#nice table.nice-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
#nice table.nice-table thead { background-color: #2c3e50; color: #ffffff; }
#nice table.nice-table th, #nice table.nice-table td { padding: 10px 12px; border: 1px solid #dce4ec; text-align: left; }
#nice table.nice-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
#nice img { max-width: 100%; border-radius: 4px; }
#nice hr.nice-hr { border: none; height: 1px; background: #ecf0f1; margin: 28px 0; }
#nice strong { color: #1a252f; }`,

  tech: `#nice { font-size: 15px; color: #333333; line-height: 1.75; word-spacing: 1px; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; max-width: 680px; margin: 0 auto; }
#nice p { margin: 10px 0; color: #444444; line-height: 1.8; font-size: 15px; }
#nice h1 { font-size: 24px; font-weight: bold; color: #00b894; text-align: center; margin-top: 30px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #00b894; }
#nice h2 { font-size: 20px; font-weight: bold; color: #00b894; margin-top: 25px; margin-bottom: 15px; padding-left: 10px; border-left: 4px solid #00b894; }
#nice h3 { font-size: 17px; font-weight: bold; color: #2d3436; margin-top: 20px; margin-bottom: 10px; }
#nice h4, #nice h5, #nice h6 { font-size: 15px; font-weight: bold; color: #636e72; margin-top: 12px; margin-bottom: 6px; }
#nice blockquote.nice-quote { margin: 20px 0; padding: 15px 20px; background-color: #f0f9f6; border-left: 4px solid #00b894; color: #555555; font-size: 14px; line-height: 1.8; border-radius: 0 4px 4px 0; }
#nice pre.code-block { margin: 20px 0; padding: 16px; background-color: #2d3436; border-radius: 6px; overflow-x: auto; font-size: 13px; line-height: 1.6; color: #dfe6e9; }
#nice pre.code-block code { color: #dfe6e9; background-color: transparent; }
#nice code.inline-code { background-color: #e8f8f5; color: #00b894; padding: 2px 6px; border-radius: 3px; font-size: 13px; font-family: "SFMono-Regular", Consolas, monospace; }
#nice a { color: #00b894; text-decoration: none; border-bottom: 1px solid #00b894; }
#nice ul.nice-ul, #nice ol.nice-ol { margin: 10px 0; padding-left: 24px; }
#nice ul.nice-ul li, #nice ol.nice-ol li { margin: 6px 0; line-height: 1.8; color: #444444; }
#nice table.nice-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
#nice table.nice-table thead { background-color: #00b894; color: #ffffff; }
#nice table.nice-table th, #nice table.nice-table td { padding: 10px 12px; border: 1px solid #dfe6e9; text-align: left; }
#nice table.nice-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
#nice img { max-width: 100%; border-radius: 4px; }
#nice hr.nice-hr { border: none; height: 1px; background: linear-gradient(to right, transparent, #b2bec3, transparent); margin: 30px 0; }
#nice strong { color: #2d3436; }`,

  poetic: `#nice { font-size: 16px; color: #3e2723; line-height: 1.85; word-spacing: 2px; letter-spacing: 1px; font-family: "Noto Serif SC", "Songti SC", "SimSun", serif; padding: 24px; max-width: 680px; margin: 0 auto; }
#nice p { margin: 12px 0; color: #4e342e; line-height: 2; font-size: 16px; text-indent: 2em; }
#nice h1 { font-size: 26px; font-weight: bold; color: #3e2723; text-align: center; margin-top: 36px; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #8d6e63; font-family: "Noto Serif SC", "SimSun", serif; }
#nice h2 { font-size: 21px; font-weight: bold; color: #4e342e; margin-top: 28px; margin-bottom: 16px; padding-bottom: 6px; border-bottom: 1px solid #d7ccc8; }
#nice h3 { font-size: 18px; font-weight: bold; color: #5d4037; margin-top: 22px; margin-bottom: 12px; }
#nice h4, #nice h5, #nice h6 { font-size: 16px; font-weight: bold; color: #6d4c41; margin-top: 16px; margin-bottom: 8px; }
#nice blockquote.nice-quote { margin: 24px 0; padding: 20px 24px; background-color: #faf7f5; border-left: 3px solid #8d6e63; color: #5d4037; font-size: 15px; line-height: 1.9; font-style: italic; }
#nice pre.code-block { margin: 20px 0; padding: 16px; background-color: #faf7f5; border-radius: 4px; overflow-x: auto; font-size: 13px; line-height: 1.6; border: 1px solid #efebe9; }
#nice code.inline-code { background-color: #faf7f5; color: #bf360c; padding: 2px 5px; border-radius: 3px; font-size: 14px; }
#nice a { color: #8d6e63; text-decoration: none; border-bottom: 1px dashed #8d6e63; }
#nice ul.nice-ul, #nice ol.nice-ol { margin: 12px 0; padding-left: 32px; }
#nice ul.nice-ul li, #nice ol.nice-ol li { margin: 8px 0; line-height: 1.9; color: #4e342e; }
#nice table.nice-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
#nice table.nice-table thead { background-color: #8d6e63; color: #ffffff; }
#nice table.nice-table th, #nice table.nice-table td { padding: 10px 12px; border: 1px solid #d7ccc8; text-align: left; }
#nice table.nice-table tbody tr:nth-child(even) { background-color: #faf7f5; }
#nice img { max-width: 100%; border-radius: 2px; }
#nice hr.nice-hr { border: none; height: 1px; background: #d7ccc8; margin: 32px 0; }
#nice strong { color: #3e2723; }`
};

const DEFAULT_MD = `# Markdown Nice 排版演示

> 这是一段引用文字，用来展示引用块的样式效果。在微信公众号文章中，合理的引用可以突出重点内容。

## 一、基础排版

这是一段普通正文。**这是加粗文字**，*这是斜体文字*，~~这是删除线~~。微信公众号文章的理想行高是 1.75，字号 15px，每行约 21 个汉字，这样的阅读体验最为舒适。

### 1.1 列表演示

无序列表：
- 支持自定义样式的 Markdown 编辑器
- 一键排版，复制即可粘贴到公众号
- 支持代码高亮、数学公式、脚注

有序列表：
1. 打开编辑器，粘贴 Markdown 内容
2. 选择合适的主题风格
3. 点击复制按钮，粘贴到公众号

### 1.2 链接与图片

[访问 MdNice 官网](https://mdnice.com/)

![示例图片](https://picsum.photos/600/300)

## 二、高级元素

### 2.1 代码块

行内代码：\`npm install md-to-wechat\`

JavaScript 代码块：
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return {
    message: "欢迎使用 Markdown 转公众号排版系统",
    timestamp: Date.now()
  };
}
\`\`\`

Python 代码块：
\`\`\`python
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

print(calculate_fibonacci(10))
\`\`\`

### 2.2 表格

| 功能 | 描述 | 支持平台 |
|------|------|----------|
| 一键排版 | 自动渲染主题样式 | 微信公众号 |
| 代码高亮 | 支持 30+ 语言 | 全平台 |
| 数学公式 | LaTeX 公式转图片 | 微信公众号 |
| 脚注转换 | 外链自动转脚注 | 微信公众号 |

### 2.3 分割线

---

## 三、结语

以上就是 Markdown 转公众号排版系统的完整演示。你可以左侧编辑 Markdown，右侧实时预览效果。选择合适的主题后，复制到微信公众号编辑器即可！
`;

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function simpleMarkdownToHtml(md: string): string {
  let html = md;
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'plaintext';
    return `<pre class="code-block" data-lang="${language}"><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
  });
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;display:block;margin:16px auto;border-radius:4px;" data-ratio="0.5" data-type="png"/>');
  html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  // 处理引用块：支持多行连续引用，包括空引用行
  // 匹配连续的 > 行（包括只有 > 的空引用行）
  html = html.replace(/((?:^>\s*.+\n?)+)/gm, (match) => {
    const lines = match.trim().split('\n').map(line => {
      // 移除行首的 > 和可能的空格
      return line.replace(/^>\s*/, '');
    }).filter(line => line.trim()); // 过滤掉空行
    if (lines.length === 0) return ''; // 如果全是空引用行，返回空
    // 将多行内容合并为段落
    const content = lines.join('<br/>');
    return `<blockquote class="nice-quote"><p>${content}</p></blockquote>`;
  });
  // 清理残留的空引用行（只有 > 没有内容的行）
  html = html.replace(/^>\s*$/gm, '');
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<em><strong>$1</strong></em>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" data-external="true">$1</a>');
  html = html.replace(/((?:\|.*\|\n)+)/g, (match) => {
    const rows = match.trim().split('\n').filter(r => r.trim());
    if (rows.length < 2) return match;
    let table = '<table class="nice-table"><thead><tr>';
    const headers = rows[0].split('|').filter(c => c.trim());
    headers.forEach(h => table += `<th>${h.trim()}</th>`);
    table += '</tr></thead><tbody>';
    for (let i = 2; i < rows.length; i++) {
      table += '<tr>';
      rows[i].split('|').filter(c => c.trim()).forEach(c => table += `<td>${c.trim()}</td>`);
      table += '</tr>';
    }
    table += '</tbody></table>';
    return table;
  });
  html = html.replace(/((?:^\s*[-*+] .+\n)+)/gm, (match) => {
    const items = match.trim().split('\n').map(line => `<li>${line.replace(/^\s*[-*+]\s*/, '')}</li>`).join('');
    return `<ul class="nice-ul">${items}</ul>`;
  });
  html = html.replace(/((?:^\s*\d+\. .+\n)+)/gm, (match) => {
    const items = match.trim().split('\n').map(line => `<li>${line.replace(/^\s*\d+\.\s*/, '')}</li>`).join('');
    return `<ol class="nice-ol">${items}</ol>`;
  });
  html = html.replace(/^---+$/gm, '<hr class="nice-hr"/>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/^(.+)$/gm, (match) => {
    if (match.startsWith('<')) return match;
    return `<p>${match}</p>`;
  });
  html = html.replace(/<p><\/p>/g, '');
  return html;
}

function adaptForWechat(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="nice">${html}</div>`, 'text/html');
  const nice = doc.getElementById('nice')!;

  const links = nice.querySelectorAll('a[data-external="true"]');
  const footnotes: { index: number; text: string; href: string }[] = [];
  links.forEach((a, i) => {
    const el = a as HTMLAnchorElement;
    footnotes.push({ index: i + 1, text: el.textContent || '', href: el.href });
    const span = doc.createElement('span');
    span.innerHTML = `<span style="color:#f5a623;font-weight:bold;">${el.textContent}</span><sup style="color:#f5a623;font-size:12px;">[${i + 1}]</sup>`;
    el.replaceWith(span);
  });

  if (footnotes.length > 0) {
    const hr = doc.createElement('hr');
    hr.className = 'nice-hr';
    nice.appendChild(hr);
    const section = doc.createElement('div');
    section.style.cssText = 'margin-top:20px;padding:16px;background-color:#fafafa;border-radius:6px;';
    let fnHtml = '<h4 style="font-size:15px;font-weight:bold;color:#333;margin-bottom:12px;">参考资料</h4><ol style="padding-left:20px;margin:0;">';
    footnotes.forEach(fn => {
      fnHtml += `<li style="font-size:13px;color:#666;line-height:1.8;margin:6px 0;">${fn.text}: <span style="color:#888;word-break:break-all;">${fn.href}</span></li>`;
    });
    fnHtml += '</ol>';
    section.innerHTML = fnHtml;
    nice.appendChild(section);
  }

  const all = nice.querySelectorAll('*');
  all.forEach(el => {
    const style = (el as HTMLElement).style;
    if (style.color === 'rgb(0, 0, 0)' || style.color === '#000000' || style.color === '#000') {
      style.color = '#333333';
    }
  });

  return nice.innerHTML;
}

function generateOutputHtml(md: string, themeId: string, mode: string): string {
  let html = simpleMarkdownToHtml(md);
  if (mode === 'wechat') {
    html = adaptForWechat(html);
  }
  const css = (THEME_CSS as any)[themeId] || (THEME_CSS as any).default;
  return `<style>${css}</style>\n<div id="nice">${html}</div>`;
}

export default function App() {
  const [md, setMd] = useState(DEFAULT_MD);
  const [theme, setTheme] = useState('default');
  const [mode, setMode] = useState('preview');
  const [toast, setToast] = useState<string | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const updatePreview = useCallback(() => {
    let html = simpleMarkdownToHtml(md);
    if (mode === 'wechat') {
      html = adaptForWechat(html);
    }
    const css = (THEME_CSS as any)[theme] || (THEME_CSS as any).default;
    const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>${css}</style>
</head><body><div id="nice">${html}</div></body></html>`;
    if (previewRef.current) {
      previewRef.current.srcdoc = fullHtml;
    }
  }, [md, theme, mode]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setMd(content);
      showToast(`已导入文件: ${file.name}`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopy = async () => {
    const output = generateOutputHtml(md, theme, mode);
    try {
      await navigator.clipboard.writeText(output);
      showToast('已复制 HTML 到剪贴板！');
    } catch {
      showToast('复制失败，请手动复制');
    }
  };

  const handleCopyForWechat = async () => {
    const output = generateOutputHtml(md, theme, 'wechat');
    try {
      await navigator.clipboard.writeText(output);
      showToast('已复制到公众号格式！直接粘贴到公众号编辑器即可');
    } catch {
      showToast('复制失败，请手动复制');
    }
  };

  const handleDownload = () => {
    const output = generateOutputHtml(md, theme, mode);
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${output}</body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article.html';
    a.click();
    URL.revokeObjectURL(url);
    showToast('已下载 article.html');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-gray-800 text-white text-sm rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold text-gray-800">MD to WeChat</div>
          <span className="text-xs text-gray-400">Markdown 公众号排版编辑器</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".md,.markdown,.txt"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 transition-colors"
          >
            导入 MD
          </button>

          <select
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={theme}
            onChange={e => setTheme(e.target.value)}
          >
            <option value="default">默认主题（橙心）</option>
            <option value="elegant">优雅极简</option>
            <option value="tech">极客科技</option>
            <option value="poetic">诗意国风</option>
          </select>

          <div className="flex bg-gray-100 rounded-md p-0.5">
            <button
              className={`px-3 py-1 text-sm rounded ${mode === 'preview' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
              onClick={() => setMode('preview')}
            >
              预览模式
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${mode === 'wechat' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
              onClick={() => setMode('wechat')}
            >
              公众号模式
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-md transition-colors"
          >
            复制 HTML
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-md transition-colors"
          >
            下载
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 flex justify-between">
            <span>Markdown 编辑</span>
            <span>{md.length} 字符</span>
          </div>
          <textarea
            className="flex-1 w-full p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed text-gray-700"
            value={md}
            onChange={e => setMd(e.target.value)}
            spellCheck={false}
            placeholder="在此输入 Markdown 内容，或点击上方「导入 MD」按钮导入文件..."
          />
        </div>

        <div className="w-1/2 flex flex-col bg-gray-100" id="preview">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 flex justify-between items-center">
            <span>{mode === 'preview' ? '实时预览' : '公众号适配预览（外链转脚注、纯黑过滤等）'}</span>
            <div className="flex items-center gap-2">
              <span>主题: {theme}</span>
              <button
                onClick={handleCopyForWechat}
                className="ml-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                title="自动转换为公众号格式并复制"
              >
                复制到公众号
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div id="preview-content" className="rounded-lg">
              <iframe
                ref={previewRef}
                className="w-full h-full border-0"
                style={{ minHeight: '600px' }}
                title="preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
