/**
 * wechat-adapter.ts — 微信公众号编辑器适配
 */

/** 适配微信编辑器 */
export function adaptForWechat(html: string): string {
  let adapted = html;
  adapted = convertLinksToFootnotes(adapted);
  adapted = stripUnsupportedCSS(adapted);
  adapted = ensureImageAlt(adapted);
  return adapted;
}

function convertLinksToFootnotes(html: string): string {
  let footnoteIndex = 0;
  const footnotes: string[] = [];

  html = html.replace(
    /<a\s+(?:[^>]*?\s)?href="(https?:\/\/[^"]+)"[^>]*>(.*?)<\/a>/gi,
    (match, url: string, text: string) => {
      if (url.startsWith('#')) return match;
      footnoteIndex++;
      footnotes.push(`<span id="fn${footnoteIndex}">[${footnoteIndex}] ${url}</span>`);
      return `<span style="color:#576b95;">${text}[${footnoteIndex}]</span>`;
    }
  );

  if (footnotes.length > 0) {
    html += '\n<hr class="nice-hr" />\n';
    html += '<div class="nice-footnotes" style="font-size:12px;color:#888;">';
    html += '<p style="font-weight:bold;">参考资料</p>';
    html += footnotes.join('<br/>');
    html += '</div>';
  }
  return html;
}

function stripUnsupportedCSS(html: string): string {
  // 只替换 style 属性内的 max-width/box-shadow，避免误伤 data: URI
  return html
    .replace(/(style="[^"]*)max-width:\s*[^;"]+[;"']?/gi, '$1')
    .replace(/(style="[^"]*)box-shadow:\s*[^;"]+[;"']?/gi, '$1');
}

function ensureImageAlt(html: string): string {
  return html.replace(
    /<img\s+([^>]*?)>/gi,
    (match, attrs: string) => {
      if (!/alt\s*=/.test(attrs)) return match.replace('<img ', '<img alt="图片" ');
      return match;
    }
  );
}

/** 复制 HTML 到剪贴板（保留图片和格式） */
export async function copyToClipboard(html: string): Promise<boolean> {
  // 方案1: Clipboard API with text/html — 现代浏览器标准方式
  try {
    const blob = new Blob([html], { type: 'text/html' });
    // Chrome requires ClipboardItem to receive a record of MIME→Promise<Blob>
    const item = new ClipboardItem({ 'text/html': Promise.resolve(blob) });
    await navigator.clipboard.write([item]);
    return true;
  } catch {
    // 方案2: ClipboardItem with raw Blob (Safari fallback)
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const item = new ClipboardItem({ 'text/html': blob });
      await navigator.clipboard.write([item]);
      return true;
    } catch {
      // 方案3: execCommand 回退 + 临时元素（兼容微信开发者工具等环境）
      try {
        const container = document.createElement('div');
        container.innerHTML = html;
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        document.body.appendChild(container);

        const range = document.createRange();
        range.selectNodeContents(container);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);

        const success = document.execCommand('copy');
        document.body.removeChild(container);
        sel?.removeAllRanges();

        if (success) return true;
      } catch { /* fall through */ }

      // 方案4: 纯文本回退（丢失图片但保留文字）
      try {
        const div = document.createElement('div');
        div.innerHTML = html;
        await navigator.clipboard.writeText(div.textContent || '');
        return true;
      } catch {
        return false;
      }
    }
  }
}
