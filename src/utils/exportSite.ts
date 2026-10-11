import { SiteProject } from '../types';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/**
 * Client-side renderer embedded in the exported file. Every user-provided string
 * goes through `esc()` and navigation uses data attributes instead of inline JS,
 * so labels and page names can never break out of the markup.
 */
const RUNTIME_SCRIPT = `
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  let activeId = PROJECT.activePageId || PROJECT.pages[0]?.id;

  function renderContainer(node) {
    const s = node.style || {};
    const isGrid = s.display === 'grid';
    let cls = 'gap-3 p-3 rounded-lg border border-slate-800 ';
    if (s.flexDirection === 'row') cls += 'flex flex-row items-center justify-between';
    else if (isGrid) cls += 'grid';
    else cls += 'flex flex-col';
    if (isGrid && s.gridCols === 2) cls += ' md:grid-cols-2';
    if (isGrid && s.gridCols === 3) cls += ' md:grid-cols-3';
    if (isGrid && s.gridCols === 4) cls += ' sm:grid-cols-2 md:grid-cols-4';
    const bg = /^#[0-9a-fA-F]{3,8}$/.test(s.backgroundColor || '') ? s.backgroundColor : 'transparent';
    return '<div class="' + cls + '" style="background-color:' + bg + '">'
      + (node.children || []).map(renderNode).join('') + '</div>';
  }

  function renderInput(p) {
    const spec = p.validation || {};
    const specLabel = spec.lsl
      ? '<span class="font-mono text-slate-400">Spec: ' + esc(spec.lsl) + ' - ' + esc(spec.usl) + ' ' + esc(p.unit) + '</span>'
      : '';
    const unit = p.unit
      ? '<span class="absolute right-3 top-2 text-xs text-slate-400 font-mono">[' + esc(p.unit) + ']</span>'
      : '';
    return '<div class="p-3 bg-slate-900 border border-slate-800 rounded-lg">'
      + '<div class="flex justify-between text-xs font-semibold text-slate-200 mb-1"><span>' + esc(p.label) + '</span>' + specLabel + '</div>'
      + '<div class="relative"><input type="' + (p.inputType === 'number' ? 'number' : 'text') + '" value="' + esc(p.defaultValue) + '" '
      + 'class="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded text-sm text-slate-100 font-mono" />' + unit + '</div></div>';
  }

  function renderNode(node) {
    const p = node.props || {};
    switch (node.type) {
      case 'container':
        return renderContainer(node);
      case 'input':
        return renderInput(p);
      case 'metric':
        return '<div class="p-4 bg-slate-900 border border-slate-800 rounded-lg"><div class="text-xs text-slate-400 mb-1">' + esc(p.label)
          + '</div><div class="text-2xl font-bold font-mono text-white">' + esc(p.value || '0')
          + ' <span class="text-xs text-slate-400">' + esc(p.unit) + '</span></div></div>';
      case 'button': {
        const nav = p.targetPageId ? ' data-page="' + esc(p.targetPageId) + '"' : '';
        return '<button' + nav + ' class="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500">' + esc(p.label || 'Action') + '</button>';
      }
      case 'statusBadge':
        return '<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded text-xs font-mono font-bold">'
          + '<span class="w-2 h-2 rounded-full bg-emerald-500"></span>' + esc(p.label || 'RUNNING') + '</span>';
      case 'text':
        return '<p class="text-slate-100 font-bold text-base">' + esc(p.content) + '</p>';
      case 'divider':
        return '<div class="w-full h-px bg-slate-800 my-2"></div>';
      default:
        return '';
    }
  }

  function render() {
    const page = PROJECT.pages.find((p) => p.id === activeId) || PROJECT.pages[0];
    if (!page) return;
    document.title = page.title || PROJECT.name;
    const nav = PROJECT.pages.map((pg) =>
      '<button data-page="' + esc(pg.id) + '" class="px-3 py-1 text-xs rounded '
      + (pg.id === activeId ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white') + '">' + esc(pg.name) + '</button>'
    ).join('');
    document.getElementById('site-root').innerHTML =
      '<header class="flex justify-between items-center border-b border-slate-800 pb-4 mb-6"><div>'
      + '<h1 class="text-lg font-bold text-white">' + esc(PROJECT.name) + '</h1>'
      + '<p class="text-xs text-slate-400">' + esc(page.name) + '</p></div>'
      + '<nav class="flex gap-2">' + nav + '</nav></header>'
      + (page.rootNode ? renderNode(page.rootNode) : '');
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-page]');
    if (!target) return;
    activeId = target.dataset.page;
    render();
  });

  render();
`;

/** Build a self-contained HTML file that renders the whole project offline. */
export function exportSiteStandaloneHtml(project: SiteProject): string {
  const projectJson = JSON.stringify(project).replace(/</g, '\\u003c');
  const name = escapeHtml(project.name);
  const description = escapeHtml(project.description || project.name);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name}</title>
  <meta name="description" content="${description}" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <div id="site-root" class="max-w-5xl mx-auto px-4 py-8"></div>
  <script>
    const PROJECT = ${projectJson};
${RUNTIME_SCRIPT}
  </script>
</body>
</html>`;
}
