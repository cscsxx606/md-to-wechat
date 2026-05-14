/**
 * themes.ts — 12 款公众号排版主题 CSS
 * 每种主题定义：文字、标题、引用、代码、表格、链接、列表等样式
 */

export type ThemeId =
  | 'default' | 'elegant' | 'tech' | 'poetic'
  | 'mint' | 'ocean' | 'sakura' | 'dark'
  | 'retro' | 'violet' | 'graphite' | 'sunshine';

export interface ThemeMeta {
  name: string;
  description: string;
}

export const THEME_META: Record<ThemeId, ThemeMeta> = {
  default:  { name: '橙心',     description: '暖橙主调，现代感，通用性最强' },
  elegant:  { name: '优雅极简', description: '深蓝灰，极简干净，适合严肃内容' },
  tech:     { name: '极客科技', description: '绿色科技风，适合技术教程' },
  poetic:   { name: '诗意国风', description: '棕色宋体，文艺古典，适合散文' },
  mint:     { name: '薄荷清新', description: '浅绿清新，适合生活方式类' },
  ocean:    { name: '深海蓝',   description: '深海蓝调，适合深度长文' },
  sakura:   { name: '樱花粉',   description: '柔和粉色，适合情感/女性向' },
  dark:     { name: '暗夜黑',   description: '深黑底白字，暗色模式' },
  retro:    { name: '砖红复古', description: '砖红暖调，适合怀旧/历史' },
  violet:   { name: '紫罗兰',   description: '紫色优雅，适合创作/艺术' },
  graphite: { name: '石墨灰',   description: '灰黑工业风，适合商业分析' },
  sunshine: { name: '阳光金',   description: '明亮金色，适合正能量/励志' },
};

/* ================================================================
   THEME CSS — 每个主题的完整 CSS 定义
   ================================================================ */

export const THEME_CSS: Record<ThemeId, string> = {

  /* ── 1. 橙心 ── */
  default: `#nice { font-size: 15px; color: #333; line-height: 1.75; word-spacing:1px; letter-spacing:1px; word-break:break-word; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; padding:20px; max-width:680px; margin:0 auto; }
#nice p { margin:10px 0; color:#4a4a4a; line-height:1.8; font-size:15px; }
#nice h1 { font-size:24px; font-weight:bold; color:#1a1a1a; text-align:center; margin:30px 0 20px; padding-bottom:10px; border-bottom:2px solid #f5a623; line-height:1.4; }
#nice h2 { font-size:20px; font-weight:bold; color:#1a1a1a; margin:25px 0 15px; padding-left:12px; border-left:4px solid #f5a623; line-height:1.4; }
#nice h3 { font-size:17px; font-weight:bold; color:#333; margin:20px 0 10px; line-height:1.4; }
#nice h4,#nice h5,#nice h6 { font-size:15px; font-weight:bold; color:#555; margin:12px 0 6px; }
#nice blockquote.nice-quote { margin:20px 0; padding:15px 20px; background:#fff9f0; border-left:4px solid #f5a623; color:#666; font-size:14px; line-height:1.8; border-radius:0 4px 4px 0; }
#nice blockquote.nice-quote p { margin:0; color:#666; }
#nice pre.nice-code { margin:20px 0; padding:16px; background:#f8f9fa; border-radius:6px; overflow-x:auto; font-size:13px; line-height:1.6; border:1px solid #eaeaea; }
#nice code.inline-code { background:#fff5f5; color:#e53935; padding:2px 6px; border-radius:3px; font-size:13px; font-family:"SFMono-Regular",Consolas,monospace; }
#nice a { color:#f5a623; text-decoration:none; border-bottom:1px solid #f5a623; }
#nice ul.nice-ul,#nice ol.nice-ol { margin:10px 0; padding-left:24px; }
#nice ul.nice-ul li,#nice ol.nice-ol li { margin:6px 0; line-height:1.8; color:#4a4a4a; }
#nice table.nice-table { width:100%; border-collapse:collapse; margin:20px 0; font-size:14px; line-height:1.6; }
#nice table.nice-table thead { background:#f5a623; color:#fff; }
#nice table.nice-table th,#nice table.nice-table td { padding:10px 12px; border:1px solid #e0e0e0; text-align:left; }
#nice table.nice-table tbody tr:nth-child(even) { background:#fafafa; }
#nice img { max-width:100%; border-radius:4px; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
#nice hr.nice-hr { border:none; height:1px; background:linear-gradient(to right,transparent,#e0e0e0,transparent); margin:30px 0; }
#nice strong { color:#1a1a1a; font-weight:bold; }
#nice em { color:#555; font-style:italic; }
#nice .nice-toc { background:#fafafa; padding:16px 20px; border-radius:8px; margin:20px 0; font-size:14px; }
#nice .nice-toc-title { font-weight:bold; font-size:16px; margin-bottom:10px; color:#1a1a1a; }
#nice .nice-toc a { color:#f5a623; border:none; }
#nice .nice-toc ul { list-style:none; padding-left:0; }
#nice .nice-toc li { margin:4px 0; }
#nice .nice-toc li.toc-h2 { font-weight:600; }
#nice .nice-toc li.toc-h3 { padding-left:16px; font-size:13px; color:#666; }
#nice .nice-figure { margin:16px 0; text-align:center; }
#nice .nice-figcaption { font-size:13px; color:#888; margin-top:6px; line-height:1.6; }
#nice .nice-gallery { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
#nice .nice-gallery img { width:100%; height:auto; object-fit:cover; border-radius:4px; }`,

  /* ── 2. 优雅极简 ── */
  elegant: `#nice { font-size:15px; color:#2c3e50; line-height:1.8; word-spacing:0.5px; letter-spacing:0.5px; font-family:"PingFang SC","Microsoft YaHei",sans-serif; padding:24px; max-width:680px; margin:0 auto; }
#nice p { margin:12px 0; color:#34495e; line-height:1.9; font-size:15px; }
#nice h1 { font-size:26px; font-weight:600; color:#1a252f; text-align:left; margin:32px 0 20px; padding-bottom:8px; border-bottom:1px solid #ecf0f1; }
#nice h2 { font-size:21px; font-weight:600; color:#1a252f; margin:28px 0 14px; padding-bottom:6px; border-bottom:1px solid #ecf0f1; }
#nice h3 { font-size:18px; font-weight:600; color:#2c3e50; margin:22px 0 10px; }
#nice h4,#nice h5,#nice h6 { font-size:15px; font-weight:600; color:#34495e; margin:16px 0 8px; }
#nice blockquote.nice-quote { margin:20px 0; padding:16px 20px; background:#f8f9fa; border-left:3px solid #2c3e50; color:#5d6d7e; font-size:14px; line-height:1.8; }
#nice pre.nice-code { margin:20px 0; padding:16px; background:#f4f6f7; border-radius:4px; overflow-x:auto; font-size:13px; line-height:1.6; }
#nice code.inline-code { background:#ecf0f1; color:#c0392b; padding:2px 5px; border-radius:3px; font-size:13px; }
#nice a { color:#2980b9; text-decoration:none; border-bottom:1px solid #2980b9; }
#nice ul.nice-ul,#nice ol.nice-ol { margin:12px 0; padding-left:28px; }
#nice ul.nice-ul li,#nice ol.nice-ol li { margin:8px 0; line-height:1.8; color:#34495e; }
#nice table.nice-table { width:100%; border-collapse:collapse; margin:20px 0; font-size:14px; }
#nice table.nice-table thead { background:#2c3e50; color:#fff; }
#nice table.nice-table th,#nice table.nice-table td { padding:10px 12px; border:1px solid #dce4ec; text-align:left; }
#nice table.nice-table tbody tr:nth-child(even) { background:#f8f9fa; }
#nice img { max-width:100%; border-radius:4px; }
#nice hr.nice-hr { border:none; height:1px; background:#ecf0f1; margin:28px 0; }
#nice .nice-toc { background:#f8f9fa; padding:16px 20px; border-radius:4px; margin:20px 0; font-size:14px; }
#nice .nice-toc-title { font-weight:600; font-size:16px; margin-bottom:10px; color:#1a252f; }
#nice .nice-toc a { color:#2980b9; border:none; }
#nice .nice-toc ul { list-style:none; padding-left:0; }
#nice .nice-toc li { margin:4px 0; }
#nice .nice-toc li.toc-h2 { font-weight:600; }
#nice .nice-toc li.toc-h3 { padding-left:16px; font-size:13px; color:#5d6d7e; }
#nice .nice-figure { margin:16px 0; text-align:center; }
#nice .nice-figcaption { font-size:13px; color:#888; margin-top:6px; line-height:1.6; }
#nice .nice-gallery { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
#nice .nice-gallery img { width:100%; height:auto; object-fit:cover; border-radius:4px; }
`,

  /* ── 3. 极客科技 ── */
  tech: `#nice { font-size:15px; color:#333; line-height:1.75; word-spacing:1px; letter-spacing:0.5px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; padding:20px; max-width:680px; margin:0 auto; }
#nice p { margin:10px 0; color:#444; line-height:1.8; font-size:15px; }
#nice h1 { font-size:24px; font-weight:bold; color:#00b894; text-align:center; margin:30px 0 20px; padding-bottom:10px; border-bottom:2px solid #00b894; }
#nice h2 { font-size:20px; font-weight:bold; color:#00b894; margin:25px 0 15px; padding-left:10px; border-left:4px solid #00b894; }
#nice h3 { font-size:17px; font-weight:bold; color:#2d3436; margin:20px 0 10px; }
#nice h4,#nice h5,#nice h6 { font-size:15px; font-weight:bold; color:#636e72; margin:12px 0 6px; }
#nice blockquote.nice-quote { margin:20px 0; padding:15px 20px; background:#f0f9f6; border-left:4px solid #00b894; color:#555; font-size:14px; line-height:1.8; border-radius:0 4px 4px 0; }
#nice pre.nice-code { margin:20px 0; padding:16px; background:#2d3436; border-radius:6px; overflow-x:auto; font-size:13px; line-height:1.6; color:#dfe6e9; }
#nice code.inline-code { background:#e8f8f5; color:#00b894; padding:2px 6px; border-radius:3px; font-size:13px; font-family:"SFMono-Regular",Consolas,monospace; }
#nice a { color:#00b894; text-decoration:none; border-bottom:1px solid #00b894; }
#nice ul.nice-ul,#nice ol.nice-ol { margin:10px 0; padding-left:24px; }
#nice ul.nice-ul li,#nice ol.nice-ol li { margin:6px 0; line-height:1.8; color:#444; }
#nice table.nice-table { width:100%; border-collapse:collapse; margin:20px 0; font-size:14px; }
#nice table.nice-table thead { background:#00b894; color:#fff; }
#nice table.nice-table th,#nice table.nice-table td { padding:10px 12px; border:1px solid #dfe6e9; text-align:left; }
#nice table.nice-table tbody tr:nth-child(even) { background:#f8f9fa; }
#nice img { max-width:100%; border-radius:4px; }
#nice hr.nice-hr { border:none; height:1px; background:linear-gradient(to right,transparent,#b2bec3,transparent); margin:30px 0; }
#nice .nice-toc { background:#f0f9f6; padding:16px 20px; border-radius:6px; margin:20px 0; font-size:14px; }
#nice .nice-toc-title { font-weight:bold; font-size:16px; margin-bottom:10px; color:#2d3436; }
#nice .nice-toc a { color:#00b894; border:none; }
#nice .nice-toc ul { list-style:none; padding-left:0; }
#nice .nice-toc li { margin:4px 0; }
#nice .nice-toc li.toc-h2 { font-weight:600; }
#nice .nice-toc li.toc-h3 { padding-left:16px; font-size:13px; color:#555; }
#nice .nice-figure { margin:16px 0; text-align:center; }
#nice .nice-figcaption { font-size:13px; color:#888; margin-top:6px; line-height:1.6; }
#nice .nice-gallery { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
#nice .nice-gallery img { width:100%; height:auto; object-fit:cover; border-radius:4px; }
`,

  /* ── 4. 诗意国风 ── */
  poetic: `#nice { font-size:16px; color:#3e2723; line-height:1.85; word-spacing:2px; letter-spacing:1px; font-family:"Noto Serif SC","Songti SC","SimSun",serif; padding:24px; max-width:680px; margin:0 auto; }
#nice p { margin:12px 0; color:#4e342e; line-height:2; font-size:16px; text-indent:2em; }
#nice h1 { font-size:26px; font-weight:bold; color:#3e2723; text-align:center; margin:36px 0 24px; padding-bottom:12px; border-bottom:2px solid #8d6e63; font-family:"Noto Serif SC","SimSun",serif; }
#nice h2 { font-size:21px; font-weight:bold; color:#4e342e; margin:28px 0 16px; padding-bottom:6px; border-bottom:1px solid #d7ccc8; }
#nice h3 { font-size:18px; font-weight:bold; color:#5d4037; margin:22px 0 12px; }
#nice h4,#nice h5,#nice h6 { font-size:16px; font-weight:bold; color:#6d4c41; margin:16px 0 8px; }
#nice blockquote.nice-quote { margin:24px 0; padding:20px 24px; background:#faf7f5; border-left:3px solid #8d6e63; color:#5d4037; font-size:15px; line-height:1.9; font-style:italic; }
#nice pre.nice-code { margin:20px 0; padding:16px; background:#faf7f5; border-radius:4px; overflow-x:auto; font-size:13px; line-height:1.6; border:1px solid #efebe9; }
#nice code.inline-code { background:#faf7f5; color:#bf360c; padding:2px 5px; border-radius:3px; font-size:14px; }
#nice a { color:#8d6e63; text-decoration:none; border-bottom:1px dashed #8d6e63; }
#nice ul.nice-ul,#nice ol.nice-ol { margin:12px 0; padding-left:32px; }
#nice ul.nice-ul li,#nice ol.nice-ol li { margin:8px 0; line-height:1.9; color:#4e342e; }
#nice table.nice-table { width:100%; border-collapse:collapse; margin:20px 0; font-size:14px; }
#nice table.nice-table thead { background:#8d6e63; color:#fff; }
#nice table.nice-table th,#nice table.nice-table td { padding:10px 12px; border:1px solid #d7ccc8; text-align:left; }
#nice table.nice-table tbody tr:nth-child(even) { background:#faf7f5; }
#nice img { max-width:100%; border-radius:2px; }
#nice hr.nice-hr { border:none; height:1px; background:#d7ccc8; margin:32px 0; }
#nice .nice-toc { background:#faf7f5; padding:18px 22px; border-radius:2px; margin:24px 0; font-size:15px; border:1px solid #efebe9; }
#nice .nice-toc-title { font-weight:bold; font-size:17px; margin-bottom:12px; color:#3e2723; }
#nice .nice-toc a { color:#8d6e63; border:none; }
#nice .nice-toc ul { list-style:none; padding-left:0; }
#nice .nice-toc li { margin:5px 0; }
#nice .nice-toc li.toc-h2 { font-weight:600; }
#nice .nice-toc li.toc-h3 { padding-left:18px; font-size:14px; color:#5d4037; }
#nice .nice-figure { margin:16px 0; text-align:center; }
#nice .nice-figcaption { font-size:13px; color:#888; margin-top:6px; line-height:1.6; }
#nice .nice-gallery { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
#nice .nice-gallery img { width:100%; height:auto; object-fit:cover; border-radius:4px; }
`,

  /* ── 5. 薄荷清新 ── */
  mint: `#nice { font-size:15px; color:#2d3e36; line-height:1.8; word-spacing:1px; letter-spacing:0.5px; word-break:break-word; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; padding:24px; max-width:680px; margin:0 auto; }
#nice p { margin:12px 0; color:#3d5a4c; line-height:1.85; font-size:15px; }
#nice h1 { font-size:25px; font-weight:bold; color:#1b4332; text-align:center; margin:32px 0 20px; padding-bottom:12px; border-bottom:2px solid #52b788; }
#nice h2 { font-size:21px; font-weight:bold; color:#1b4332; margin:28px 0 14px; padding-left:14px; border-left:4px solid #52b788; }
#nice h3 { font-size:18px; font-weight:bold; color:#2d6a4f; margin:22px 0 10px; padding-left:10px; border-left:2px solid #95d5b2; }
#nice h4,#nice h5,#nice h6 { font-size:15px; font-weight:bold; color:#52b788; margin:12px 0 6px; }
#nice blockquote.nice-quote { margin:20px 0; padding:16px 20px; background:#f1f8f5; border-left:4px solid #52b788; color:#52796f; font-size:14px; line-height:1.8; border-radius:0 6px 6px 0; }
#nice pre.nice-code { margin:20px 0; padding:16px; background:#f1f8f5; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.6; border:1px solid #d8f3dc; }
#nice code.inline-code { background:#f1f8f5; color:#40916c; padding:2px 6px; border-radius:4px; font-size:13px; }
#nice a { color:#40916c; text-decoration:none; border-bottom:1px solid #95d5b2; }
#nice ul.nice-ul,#nice ol.nice-ol { margin:10px 0; padding-left:24px; }
#nice ul.nice-ul li,#nice ol.nice-ol li { margin:6px 0; line-height:1.8; color:#3d5a4c; }
#nice table.nice-table { width:100%; border-collapse:collapse; margin:20px 0; font-size:14px; }
#nice table.nice-table thead { background:#52b788; color:#fff; }
#nice table.nice-table th,#nice table.nice-table td { padding:10px 12px; border:1px solid #d8f3dc; }
#nice table.nice-table tbody tr:nth-child(even) { background:#f1f8f5; }
#nice img { max-width:100%; border-radius:6px; }
#nice hr.nice-hr { border:none; height:1px; background:linear-gradient(to right,transparent,#95d5b2,transparent); margin:28px 0; }
#nice .nice-toc { background:#f1f8f5; padding:16px 20px; border-radius:8px; margin:20px 0; font-size:14px; }
#nice .nice-toc-title { font-weight:bold; font-size:16px; margin-bottom:10px; color:#1b4332; }
#nice .nice-toc a { color:#40916c; border:none; }
#nice .nice-toc ul { list-style:none; padding-left:0; }
#nice .nice-toc li { margin:4px 0; }
#nice .nice-toc li.toc-h2 { font-weight:600; }
#nice .nice-toc li.toc-h3 { padding-left:16px; font-size:13px; color:#52796f; }
#nice .nice-figure { margin:16px 0; text-align:center; }
#nice .nice-figcaption { font-size:13px; color:#888; margin-top:6px; line-height:1.6; }
#nice .nice-gallery { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
#nice .nice-gallery img { width:100%; height:auto; object-fit:cover; border-radius:4px; }
`,

  /* ── 6. 深海蓝 ── */
  ocean: `#nice { font-size:15px; color:#1a2332; line-height:1.8; word-spacing:1px; letter-spacing:0.5px; font-family:"PingFang SC","Microsoft YaHei",sans-serif; padding:24px; max-width:680px; margin:0 auto; }
#nice p { margin:12px 0; color:#2c3e50; line-height:1.85; font-size:15px; }
#nice h1 { font-size:25px; font-weight:700; color:#0d1b2a; text-align:center; margin:32px 0 20px; padding-bottom:12px; border-bottom:2px solid #1565c0; }
#nice h2 { font-size:21px; font-weight:700; color:#0d1b2a; margin:28px 0 14px; padding-left:14px; border-left:4px solid #1976d2; }
#nice h3 { font-size:18px; font-weight:600; color:#1a237e; margin:22px 0 10px; }
#nice h4,#nice h5,#nice h6 { font-size:15px; font-weight:600; color:#283593; margin:12px 0 6px; }
#nice blockquote.nice-quote { margin:20px 0; padding:16px 20px; background:#e8eaf6; border-left:4px solid #1565c0; color:#37474f; font-size:14px; line-height:1.8; border-radius:0 6px 6px 0; }
#nice pre.nice-code { margin:20px 0; padding:16px; background:#e8eaf6; border-radius:6px; overflow-x:auto; font-size:13px; line-height:1.6; }
#nice code.inline-code { background:#e8eaf6; color:#1565c0; padding:2px 6px; border-radius:3px; font-size:13px; }
#nice a { color:#1565c0; text-decoration:none; border-bottom:1px solid #90caf9; }
#nice ul.nice-ul,#nice ol.nice-ol { margin:10px 0; padding-left:24px; }
#nice ul.nice-ul li,#nice ol.nice-ol li { margin:6px 0; line-height:1.8; color:#2c3e50; }
#nice table.nice-table { width:100%; border-collapse:collapse; margin:20px 0; font-size:14px; }
#nice table.nice-table thead { background:#1565c0; color:#fff; }
#nice table.nice-table th,#nice table.nice-table td { padding:10px 12px; border:1px solid #bbdefb; }
#nice table.nice-table tbody tr:nth-child(even) { background:#e8eaf6; }
#nice img { max-width:100%; border-radius:4px; }
#nice hr.nice-hr { border:none; height:1px; background:linear-gradient(to right,transparent,#90caf9,transparent); margin:30px 0; }
#nice .nice-toc { background:#e8eaf6; padding:16px 20px; border-radius:6px; margin:20px 0; font-size:14px; }
#nice .nice-toc-title { font-weight:700; font-size:16px; margin-bottom:10px; color:#0d1b2a; }
#nice .nice-toc a { color:#1565c0; border:none; }
#nice .nice-toc ul { list-style:none; padding-left:0; }
#nice .nice-toc li { margin:4px 0; }
#nice .nice-toc li.toc-h2 { font-weight:600; }
#nice .nice-toc li.toc-h3 { padding-left:16px; font-size:13px; color:#37474f; }
#nice .nice-figure { margin:16px 0; text-align:center; }
#nice .nice-figcaption { font-size:13px; color:#888; margin-top:6px; line-height:1.6; }
#nice .nice-gallery { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
#nice .nice-gallery img { width:100%; height:auto; object-fit:cover; border-radius:4px; }
`,

  /* ── 7. 樱花粉 ── */
  sakura: `#nice { font-size:15px; color:#4a2c3e; line-height:1.8; word-spacing:1px; letter-spacing:0.5px; font-family:"PingFang SC","Microsoft YaHei",sans-serif; padding:24px; max-width:680px; margin:0 auto; }
#nice p { margin:12px 0; color:#5d3a4e; line-height:1.85; font-size:15px; }
#nice h1 { font-size:25px; font-weight:700; color:#6b1d4a; text-align:center; margin:32px 0 20px; padding-bottom:12px; border-bottom:2px solid #e91e8c; }
#nice h2 { font-size:21px; font-weight:600; color:#6b1d4a; margin:28px 0 14px; padding-left:14px; border-left:4px solid #f06292; }
#nice h3 { font-size:18px; font-weight:600; color:#880e4f; margin:22px 0 10px; }
#nice h4,#nice h5,#nice h6 { font-size:15px; font-weight:600; color:#ad1457; margin:12px 0 6px; }
#nice blockquote.nice-quote { margin:20px 0; padding:16px 20px; background:#fce4ec; border-left:4px solid #ec407a; color:#6b1d4a; font-size:14px; line-height:1.8; border-radius:0 6px 6px 0; }
#nice pre.nice-code { margin:20px 0; padding:16px; background:#fce4ec; border-radius:6px; overflow-x:auto; font-size:13px; line-height:1.6; }
#nice code.inline-code { background:#fce4ec; color:#c2185b; padding:2px 6px; border-radius:4px; font-size:13px; }
#nice a { color:#c2185b; text-decoration:none; border-bottom:1px solid #f48fb1; }
#nice ul.nice-ul,#nice ol.nice-ol { margin:10px 0; padding-left:24px; }
#nice ul.nice-ul li,#nice ol.nice-ol li { margin:6px 0; line-height:1.8; color:#5d3a4e; }
#nice table.nice-table { width:100%; border-collapse:collapse; margin:20px 0; font-size:14px; }
#nice table.nice-table thead { background:#ec407a; color:#fff; }
#nice table.nice-table th,#nice table.nice-table td { padding:10px 12px; border:1px solid #f8bbd0; }
#nice table.nice-table tbody tr:nth-child(even) { background:#fce4ec; }
#nice img { max-width:100%; border-radius:6px; }
#nice hr.nice-hr { border:none; height:1px; background:linear-gradient(to right,transparent,#f48fb1,transparent); margin:28px 0; }
#nice .nice-toc { background:#fce4ec; padding:16px 20px; border-radius:6px; margin:20px 0; font-size:14px; }
#nice .nice-toc-title { font-weight:700; font-size:16px; margin-bottom:10px; color:#6b1d4a; }
#nice .nice-toc a { color:#c2185b; border:none; }
#nice .nice-toc ul { list-style:none; padding-left:0; }
#nice .nice-toc li { margin:4px 0; }
#nice .nice-toc li.toc-h2 { font-weight:600; }
#nice .nice-toc li.toc-h3 { padding-left:16px; font-size:13px; color:#6b1d4a; }
#nice .nice-figure { margin:16px 0; text-align:center; }
#nice .nice-figcaption { font-size:13px; color:#888; margin-top:6px; line-height:1.6; }
#nice .nice-gallery { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
#nice .nice-gallery img { width:100%; height:auto; object-fit:cover; border-radius:4px; }
`,

  /* ── 8. 暗夜黑 ── */
  dark: `#nice { font-size:15px; color:#e0e0e0; line-height:1.8; word-spacing:1px; letter-spacing:0.5px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; padding:24px; max-width:680px; margin:0 auto; background:#1a1a2e; border-radius:8px; }
#nice p { margin:12px 0; color:#bdbdbd; line-height:1.85; font-size:15px; }
#nice h1 { font-size:25px; font-weight:700; color:#ffffff; text-align:center; margin:32px 0 20px; padding-bottom:12px; border-bottom:2px solid #7c4dff; }
#nice h2 { font-size:21px; font-weight:700; color:#ffffff; margin:28px 0 14px; padding-left:14px; border-left:4px solid #7c4dff; }
#nice h3 { font-size:18px; font-weight:600; color:#e0e0e0; margin:22px 0 10px; }
#nice h4,#nice h5,#nice h6 { font-size:15px; font-weight:600; color:#bdbdbd; margin:12px 0 6px; }
#nice blockquote.nice-quote { margin:20px 0; padding:16px 20px; background:rgba(124,77,255,0.1); border-left:4px solid #7c4dff; color:#bdbdbd; font-size:14px; line-height:1.8; border-radius:0 6px 6px 0; }
#nice pre.nice-code { margin:20px 0; padding:16px; background:#0d0d1a; border-radius:6px; overflow-x:auto; font-size:13px; line-height:1.6; color:#bdbdbd; border:1px solid #333; }
#nice code.inline-code { background:rgba(124,77,255,0.15); color:#b388ff; padding:2px 6px; border-radius:3px; font-size:13px; }
#nice a { color:#b388ff; text-decoration:none; border-bottom:1px solid #7c4dff; }
#nice ul.nice-ul,#nice ol.nice-ol { margin:10px 0; padding-left:24px; }
#nice ul.nice-ul li,#nice ol.nice-ol li { margin:6px 0; line-height:1.8; color:#bdbdbd; }
#nice table.nice-table { width:100%; border-collapse:collapse; margin:20px 0; font-size:14px; }
#nice table.nice-table thead { background:#7c4dff; color:#fff; }
#nice table.nice-table th,#nice table.nice-table td { padding:10px 12px; border:1px solid #333; }
#nice table.nice-table tbody tr:nth-child(even) { background:rgba(255,255,255,0.03); }
#nice img { max-width:100%; border-radius:4px; }
#nice hr.nice-hr { border:none; height:1px; background:linear-gradient(to right,transparent,#333,transparent); margin:30px 0; }
#nice .nice-toc { background:rgba(124,77,255,0.08); padding:16px 20px; border-radius:6px; margin:20px 0; font-size:14px; }
#nice .nice-toc-title { font-weight:700; font-size:16px; margin-bottom:10px; color:#ffffff; }
#nice .nice-toc a { color:#b388ff; border:none; }
#nice .nice-toc ul { list-style:none; padding-left:0; }
#nice .nice-toc li { margin:4px 0; }
#nice .nice-toc li.toc-h2 { font-weight:600; }
#nice .nice-toc li.toc-h3 { padding-left:16px; font-size:13px; color:#bdbdbd; }
#nice .nice-figure { margin:16px 0; text-align:center; }
#nice .nice-figcaption { font-size:13px; color:#888; margin-top:6px; line-height:1.6; }
#nice .nice-gallery { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
#nice .nice-gallery img { width:100%; height:auto; object-fit:cover; border-radius:4px; }
`,

  /* ── 9. 砖红复古 ── */
  retro: `#nice { font-size:15px; color:#3e2723; line-height:1.8; word-spacing:1px; letter-spacing:0.5px; font-family:"PingFang SC","Microsoft YaHei",sans-serif; padding:24px; max-width:680px; margin:0 auto; }
#nice p { margin:12px 0; color:#4e342e; line-height:1.85; font-size:15px; }
#nice h1 { font-size:25px; font-weight:700; color:#bf360c; text-align:center; margin:32px 0 20px; padding-bottom:12px; border-bottom:2px solid #d84315; }
#nice h2 { font-size:21px; font-weight:700; color:#bf360c; margin:28px 0 14px; padding-left:14px; border-left:4px solid #d84315; }
#nice h3 { font-size:18px; font-weight:600; color:#3e2723; margin:22px 0 10px; }
#nice h4,#nice h5,#nice h6 { font-size:15px; font-weight:600; color:#4e342e; margin:12px 0 6px; }
#nice blockquote.nice-quote { margin:20px 0; padding:16px 20px; background:#fbe9e7; border-left:4px solid #d84315; color:#5d4037; font-size:14px; line-height:1.8; border-radius:0 6px 6px 0; }
#nice pre.nice-code { margin:20px 0; padding:16px; background:#fbe9e7; border-radius:4px; overflow-x:auto; font-size:13px; line-height:1.6; }
#nice code.inline-code { background:#fbe9e7; color:#bf360c; padding:2px 6px; border-radius:3px; font-size:13px; }
#nice a { color:#bf360c; text-decoration:none; border-bottom:1px solid #ffab91; }
#nice ul.nice-ul,#nice ol.nice-ol { margin:10px 0; padding-left:24px; }
#nice ul.nice-ul li,#nice ol.nice-ol li { margin:6px 0; line-height:1.8; color:#4e342e; }
#nice table.nice-table { width:100%; border-collapse:collapse; margin:20px 0; font-size:14px; }
#nice table.nice-table thead { background:#d84315; color:#fff; }
#nice table.nice-table th,#nice table.nice-table td { padding:10px 12px; border:1px solid #ffccbc; }
#nice table.nice-table tbody tr:nth-child(even) { background:#fbe9e7; }
#nice img { max-width:100%; border-radius:4px; }
#nice hr.nice-hr { border:none; height:1px; background:linear-gradient(to right,transparent,#ffab91,transparent); margin:30px 0; }
#nice .nice-toc { background:#fbe9e7; padding:16px 20px; border-radius:4px; margin:20px 0; font-size:14px; }
#nice .nice-toc-title { font-weight:700; font-size:16px; margin-bottom:10px; color:#3e2723; }
#nice .nice-toc a { color:#bf360c; border:none; }
#nice .nice-toc ul { list-style:none; padding-left:0; }
#nice .nice-toc li { margin:4px 0; }
#nice .nice-toc li.toc-h2 { font-weight:600; }
#nice .nice-toc li.toc-h3 { padding-left:16px; font-size:13px; color:#5d4037; }
#nice .nice-figure { margin:16px 0; text-align:center; }
#nice .nice-figcaption { font-size:13px; color:#888; margin-top:6px; line-height:1.6; }
#nice .nice-gallery { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
#nice .nice-gallery img { width:100%; height:auto; object-fit:cover; border-radius:4px; }
`,

  /* ── 10. 紫罗兰 ── */
  violet: `#nice { font-size:15px; color:#2d1b4e; line-height:1.8; word-spacing:1px; letter-spacing:0.5px; font-family:"PingFang SC","Microsoft YaHei",sans-serif; padding:24px; max-width:680px; margin:0 auto; }
#nice p { margin:12px 0; color:#3d2a5e; line-height:1.85; font-size:15px; }
#nice h1 { font-size:25px; font-weight:700; color:#4a148c; text-align:center; margin:32px 0 20px; padding-bottom:12px; border-bottom:2px solid #7c4dff; }
#nice h2 { font-size:21px; font-weight:700; color:#4a148c; margin:28px 0 14px; padding-left:14px; border-left:4px solid #7c4dff; }
#nice h3 { font-size:18px; font-weight:600; color:#6a1b9a; margin:22px 0 10px; }
#nice h4,#nice h5,#nice h6 { font-size:15px; font-weight:600; color:#7b1fa2; margin:12px 0 6px; }
#nice blockquote.nice-quote { margin:20px 0; padding:16px 20px; background:#f3e5f5; border-left:4px solid #7c4dff; color:#4a148c; font-size:14px; line-height:1.8; border-radius:0 6px 6px 0; }
#nice pre.nice-code { margin:20px 0; padding:16px; background:#f3e5f5; border-radius:6px; overflow-x:auto; font-size:13px; line-height:1.6; }
#nice code.inline-code { background:#f3e5f5; color:#6a1b9a; padding:2px 6px; border-radius:4px; font-size:13px; }
#nice a { color:#6a1b9a; text-decoration:none; border-bottom:1px solid #ce93d8; }
#nice ul.nice-ul,#nice ol.nice-ol { margin:10px 0; padding-left:24px; }
#nice ul.nice-ul li,#nice ol.nice-ol li { margin:6px 0; line-height:1.8; color:#3d2a5e; }
#nice table.nice-table { width:100%; border-collapse:collapse; margin:20px 0; font-size:14px; }
#nice table.nice-table thead { background:#7c4dff; color:#fff; }
#nice table.nice-table th,#nice table.nice-table td { padding:10px 12px; border:1px solid #e1bee7; }
#nice table.nice-table tbody tr:nth-child(even) { background:#f3e5f5; }
#nice img { max-width:100%; border-radius:6px; }
#nice hr.nice-hr { border:none; height:1px; background:linear-gradient(to right,transparent,#ce93d8,transparent); margin:30px 0; }
#nice .nice-toc { background:#f3e5f5; padding:16px 20px; border-radius:6px; margin:20px 0; font-size:14px; }
#nice .nice-toc-title { font-weight:700; font-size:16px; margin-bottom:10px; color:#4a148c; }
#nice .nice-toc a { color:#6a1b9a; border:none; }
#nice .nice-toc ul { list-style:none; padding-left:0; }
#nice .nice-toc li { margin:4px 0; }
#nice .nice-toc li.toc-h2 { font-weight:600; }
#nice .nice-toc li.toc-h3 { padding-left:16px; font-size:13px; color:#4a148c; }
#nice .nice-figure { margin:16px 0; text-align:center; }
#nice .nice-figcaption { font-size:13px; color:#888; margin-top:6px; line-height:1.6; }
#nice .nice-gallery { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
#nice .nice-gallery img { width:100%; height:auto; object-fit:cover; border-radius:4px; }
`,

  /* ── 11. 石墨灰 ── */
  graphite: `#nice { font-size:15px; color:#37474f; line-height:1.8; word-spacing:1px; letter-spacing:0.5px; font-family:"PingFang SC","Microsoft YaHei",sans-serif; padding:24px; max-width:680px; margin:0 auto; }
#nice p { margin:12px 0; color:#455a64; line-height:1.85; font-size:15px; }
#nice h1 { font-size:25px; font-weight:700; color:#263238; text-align:center; margin:32px 0 20px; padding-bottom:12px; border-bottom:2px solid #546e7a; }
#nice h2 { font-size:21px; font-weight:700; color:#263238; margin:28px 0 14px; padding-left:14px; border-left:4px solid #546e7a; }
#nice h3 { font-size:18px; font-weight:600; color:#37474f; margin:22px 0 10px; }
#nice h4,#nice h5,#nice h6 { font-size:15px; font-weight:600; color:#455a64; margin:12px 0 6px; }
#nice blockquote.nice-quote { margin:20px 0; padding:16px 20px; background:#eceff1; border-left:4px solid #546e7a; color:#546e7a; font-size:14px; line-height:1.8; border-radius:0 4px 4px 0; }
#nice pre.nice-code { margin:20px 0; padding:16px; background:#eceff1; border-radius:4px; overflow-x:auto; font-size:13px; line-height:1.6; }
#nice code.inline-code { background:#eceff1; color:#37474f; padding:2px 6px; border-radius:3px; font-size:13px; }
#nice a { color:#37474f; text-decoration:none; border-bottom:1px solid #90a4ae; }
#nice ul.nice-ul,#nice ol.nice-ol { margin:10px 0; padding-left:24px; }
#nice ul.nice-ul li,#nice ol.nice-ol li { margin:6px 0; line-height:1.8; color:#455a64; }
#nice table.nice-table { width:100%; border-collapse:collapse; margin:20px 0; font-size:14px; }
#nice table.nice-table thead { background:#546e7a; color:#fff; }
#nice table.nice-table th,#nice table.nice-table td { padding:10px 12px; border:1px solid #cfd8dc; }
#nice table.nice-table tbody tr:nth-child(even) { background:#eceff1; }
#nice img { max-width:100%; border-radius:4px; }
#nice hr.nice-hr { border:none; height:1px; background:linear-gradient(to right,transparent,#90a4ae,transparent); margin:30px 0; }
#nice .nice-toc { background:#eceff1; padding:16px 20px; border-radius:4px; margin:20px 0; font-size:14px; }
#nice .nice-toc-title { font-weight:700; font-size:16px; margin-bottom:10px; color:#263238; }
#nice .nice-toc a { color:#37474f; border:none; }
#nice .nice-toc ul { list-style:none; padding-left:0; }
#nice .nice-toc li { margin:4px 0; }
#nice .nice-toc li.toc-h2 { font-weight:600; }
#nice .nice-toc li.toc-h3 { padding-left:16px; font-size:13px; color:#546e7a; }
#nice .nice-figure { margin:16px 0; text-align:center; }
#nice .nice-figcaption { font-size:13px; color:#888; margin-top:6px; line-height:1.6; }
#nice .nice-gallery { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
#nice .nice-gallery img { width:100%; height:auto; object-fit:cover; border-radius:4px; }
`,

  /* ── 12. 阳光金 ── */
  sunshine: `#nice { font-size:15px; color:#3e2c0a; line-height:1.8; word-spacing:1px; letter-spacing:0.5px; font-family:"PingFang SC","Microsoft YaHei",sans-serif; padding:24px; max-width:680px; margin:0 auto; }
#nice p { margin:12px 0; color:#5d4037; line-height:1.85; font-size:15px; }
#nice h1 { font-size:25px; font-weight:700; color:#e65100; text-align:center; margin:32px 0 20px; padding-bottom:12px; border-bottom:2px solid #ff8f00; }
#nice h2 { font-size:21px; font-weight:700; color:#e65100; margin:28px 0 14px; padding-left:14px; border-left:4px solid #ff8f00; }
#nice h3 { font-size:18px; font-weight:600; color:#bf360c; margin:22px 0 10px; }
#nice h4,#nice h5,#nice h6 { font-size:15px; font-weight:600; color:#e65100; margin:12px 0 6px; }
#nice blockquote.nice-quote { margin:20px 0; padding:16px 20px; background:#fff8e1; border-left:4px solid #ff8f00; color:#5d4037; font-size:14px; line-height:1.8; border-radius:0 6px 6px 0; }
#nice pre.nice-code { margin:20px 0; padding:16px; background:#fff8e1; border-radius:6px; overflow-x:auto; font-size:13px; line-height:1.6; border:1px solid #ffecb3; }
#nice code.inline-code { background:#fff8e1; color:#e65100; padding:2px 6px; border-radius:4px; font-size:13px; }
#nice a { color:#e65100; text-decoration:none; border-bottom:1px solid #ffb74d; }
#nice ul.nice-ul,#nice ol.nice-ol { margin:10px 0; padding-left:24px; }
#nice ul.nice-ul li,#nice ol.nice-ol li { margin:6px 0; line-height:1.8; color:#5d4037; }
#nice table.nice-table { width:100%; border-collapse:collapse; margin:20px 0; font-size:14px; }
#nice table.nice-table thead { background:#ff8f00; color:#fff; }
#nice table.nice-table th,#nice table.nice-table td { padding:10px 12px; border:1px solid #ffecb3; }
#nice table.nice-table tbody tr:nth-child(even) { background:#fff8e1; }
#nice img { max-width:100%; border-radius:6px; }
#nice hr.nice-hr { border:none; height:1px; background:linear-gradient(to right,transparent,#ffcc80,transparent); margin:30px 0; }
#nice .nice-toc { background:#fff8e1; padding:16px 20px; border-radius:6px; margin:20px 0; font-size:14px; }
#nice .nice-toc-title { font-weight:700; font-size:16px; margin-bottom:10px; color:#3e2c0a; }
#nice .nice-toc a { color:#e65100; border:none; }
#nice .nice-toc ul { list-style:none; padding-left:0; }
#nice .nice-toc li { margin:4px 0; }
#nice .nice-toc li.toc-h2 { font-weight:600; }
#nice .nice-toc li.toc-h3 { padding-left:16px; font-size:13px; color:#5d4037; }
#nice .nice-figure { margin:16px 0; text-align:center; }
#nice .nice-figcaption { font-size:13px; color:#888; margin-top:6px; line-height:1.6; }
#nice .nice-gallery { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
#nice .nice-gallery img { width:100%; height:auto; object-fit:cover; border-radius:4px; }
`,
};
