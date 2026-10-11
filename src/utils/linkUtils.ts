import { ComponentNode, Page, SiteProject } from '../types';

export interface LinkEdge {
  id: string;
  sourcePageId: string;
  sourceBlockId: string;
  sourceElement: string;
  targetPageId: string;
}

export function extractPageEdges(pages: Page[]): LinkEdge[] {
  const edges: LinkEdge[] = [];

  pages.forEach((page) => {
    if (page.rootNode) {
      function traverse(node: ComponentNode) {
        if (node.type === 'button' && node.props?.targetPageId) {
          edges.push({
            id: `${page.id}-${node.id}-btn`,
            sourcePageId: page.id,
            sourceBlockId: node.id,
            sourceElement: `Button: ${node.props.label || node.name}`,
            targetPageId: node.props.targetPageId,
          });
        }
        if (node.type === 'select' && Array.isArray(node.props?.options)) {
          node.props.options.forEach((opt: any, idx: number) => {
            if (opt.targetPageId) {
              edges.push({
                id: `${page.id}-${node.id}-opt-${idx}`,
                sourcePageId: page.id,
                sourceBlockId: node.id,
                sourceElement: `Select: ${opt.label || 'Option'}`,
                targetPageId: opt.targetPageId,
              });
            }
          });
        }
        if (node.type === 'table' && node.props?.rowTargetPages) {
          Object.entries(node.props.rowTargetPages).forEach(([rIdx, pageId]) => {
            if (pageId && typeof pageId === 'string') {
              edges.push({
                id: `${page.id}-${node.id}-row-${rIdx}`,
                sourcePageId: page.id,
                sourceBlockId: node.id,
                sourceElement: `Table Row ${Number(rIdx) + 1}`,
                targetPageId: pageId,
              });
            }
          });
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      }
      traverse(page.rootNode);
    }
  });

  return edges;
}

export function getPageSlugUrl(page: Page, isPublishedMode: boolean = false): string {
  if (isPublishedMode) {
    return `#${page.slug}`;
  }
  return `?page=${page.slug}`;
}

export function exportSiteStandaloneHtml(project: SiteProject): string {
  const jsonProject = JSON.stringify(project).replace(/<\/script>/g, '<\\/script>');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${project.name}</title>
  <meta name="description" content="${project.description || project.name}" />
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
    const PROJECT = ${jsonProject};
    let activeId = PROJECT.activePageId || PROJECT.pages[0]?.id;

    function renderNode(node) {
      if (node.type === 'container') {
        const s = node.style || {};
        const isGrid = s.display === 'grid';
        let cls = isGrid ? 'grid gap-3 p-3 rounded-lg border border-slate-800' : 'flex flex-col gap-3 p-3 rounded-lg border border-slate-800';
        if (isGrid && s.gridCols === 2) cls += ' md:grid-cols-2';
        if (isGrid && s.gridCols === 3) cls += ' md:grid-cols-3';
        if (isGrid && s.gridCols === 4) cls += ' sm:grid-cols-2 md:grid-cols-4';
        if (s.flexDirection === 'row') cls = 'flex flex-row items-center justify-between gap-3 p-3 rounded-lg border border-slate-800';
        const childrenHtml = (node.children || []).map(renderNode).join('');
        return '<div class="' + cls + '" style="background-color:' + (s.backgroundColor || 'transparent') + '">' + childrenHtml + '</div>';
      }
      if (node.type === 'input') {
        const p = node.props || {};
        const v = p.validation || {};
        return '<div class="p-3 bg-slate-900 border border-slate-800 rounded-lg"><div class="flex justify-between text-xs font-semibold text-slate-200 mb-1"><span>' + (p.label || '') + '</span>' + (v.lsl ? '<span class="font-mono text-slate-400">Spec: ' + v.lsl + ' - ' + v.usl + ' ' + (p.unit || '') + '</span>' : '') + '</div><div class="relative"><input type="' + (p.inputType === 'number' ? 'number' : 'text') + '" value="' + (p.defaultValue || '') + '" class="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded text-sm text-slate-100 font-mono" />' + (p.unit ? '<span class="absolute right-3 top-2 text-xs text-slate-400 font-mono">[' + p.unit + ']</span>' : '') + '</div></div>';
      }
      if (node.type === 'metric') {
        const p = node.props || {};
        return '<div class="p-4 bg-slate-900 border border-slate-800 rounded-lg"><div class="text-xs text-slate-400 mb-1">' + (p.label || '') + '</div><div class="text-2xl font-bold font-mono text-white">' + (p.value || '0') + ' <span class="text-xs text-slate-400">' + (p.unit || '') + '</span></div></div>';
      }
      if (node.type === 'button') {
        const p = node.props || {};
        const target = p.targetPageId ? "navigateTo('" + p.targetPageId + "')" : "";
        return '<button onclick="' + target + '" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500">' + (p.label || 'Action') + '</button>';
      }
      if (node.type === 'statusBadge') {
        const p = node.props || {};
        return '<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded text-xs font-mono font-bold"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>' + (p.label || 'RUNNING') + '</span>';
      }
      if (node.type === 'text') {
        const p = node.props || {};
        return '<p class="text-slate-100 font-bold text-base">' + (p.content || '') + '</p>';
      }
      if (node.type === 'divider') {
        return '<div class="w-full h-px bg-slate-800 my-2"></div>';
      }
      return '';
    }

    function render() {
      const page = PROJECT.pages.find(p => p.id === activeId) || PROJECT.pages[0];
      if (!page) return;
      document.title = page.title || PROJECT.name;
      let html = '<header class="flex justify-between items-center border-b border-slate-800 pb-4 mb-6"><div><h1 class="text-lg font-bold text-white">' + PROJECT.name + '</h1><p class="text-xs text-slate-400">' + page.name + '</p></div><nav class="flex gap-2">';
      PROJECT.pages.forEach(pg => {
        html += '<button onclick="navigateTo(\\'' + pg.id + '\\')" class="px-3 py-1 text-xs rounded ' + (pg.id === activeId ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white') + '">' + pg.name + '</button>';
      });
      html += '</nav></header>';
      if (page.rootNode) {
        html += renderNode(page.rootNode);
      }
      document.getElementById('site-root').innerHTML = html;
    }

    function navigateTo(id) {
      activeId = id;
      render();
    }

    render();
  </script>
</body>
</html>`;
}
