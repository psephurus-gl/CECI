import { Page } from '../types';
import { walkTree } from './componentTreeUtils';

export interface LinkEdge {
  id: string;
  sourcePageId: string;
  sourceBlockId: string;
  sourceElement: string;
  targetPageId: string;
}

/** Collect every navigation link (buttons, select options, table rows) between pages. */
export function extractPageEdges(pages: Page[]): LinkEdge[] {
  const edges: LinkEdge[] = [];

  for (const page of pages) {
    if (!page.rootNode) continue;

    const addEdge = (nodeId: string, suffix: string, sourceElement: string, targetPageId: string) =>
      edges.push({
        id: `${page.id}-${nodeId}-${suffix}`,
        sourcePageId: page.id,
        sourceBlockId: nodeId,
        sourceElement,
        targetPageId,
      });

    walkTree(page.rootNode, (node) => {
      const props = node.props ?? {};

      if (node.type === 'button' && props.targetPageId) {
        addEdge(node.id, 'btn', `Button: ${props.label || node.name}`, props.targetPageId);
      }

      if (node.type === 'select' && Array.isArray(props.options)) {
        props.options.forEach((opt: { label?: string; targetPageId?: string }, idx: number) => {
          if (opt.targetPageId) {
            addEdge(node.id, `opt-${idx}`, `Select: ${opt.label || 'Option'}`, opt.targetPageId);
          }
        });
      }

      if (node.type === 'table' && props.rowTargetPages) {
        Object.entries(props.rowTargetPages).forEach(([rowIdx, pageId]) => {
          if (pageId && typeof pageId === 'string') {
            addEdge(node.id, `row-${rowIdx}`, `Table Row ${Number(rowIdx) + 1}`, pageId);
          }
        });
      }
    });
  }

  return edges;
}
