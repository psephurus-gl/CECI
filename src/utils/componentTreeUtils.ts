import { ComponentNode } from '../types';
import { createId } from './id';

/** Visit every node in the tree depth-first (parents before children). */
export function walkTree(root: ComponentNode, visit: (node: ComponentNode) => void): void {
  visit(root);
  root.children?.forEach((child) => walkTree(child, visit));
}

/**
 * Recursively find a node by its ID in the component tree
 */
export function findNode(root: ComponentNode, id: string): ComponentNode | null {
  if (root.id === id) return root;
  if (root.children && root.children.length > 0) {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Recursively find parent node and child index of a node
 */
export function findParentNode(
  root: ComponentNode,
  id: string
): { parent: ComponentNode; index: number } | null {
  if (!root.children) return null;
  const index = root.children.findIndex((c) => c.id === id);
  if (index !== -1) {
    return { parent: root, index };
  }
  for (const child of root.children) {
    const res = findParentNode(child, id);
    if (res) return res;
  }
  return null;
}

/**
 * Get path array of nodes from root down to the target node for breadcrumb navigation
 */
export function getNodePath(root: ComponentNode, id: string): ComponentNode[] {
  if (root.id === id) return [root];
  if (root.children) {
    for (const child of root.children) {
      const path = getNodePath(child, id);
      if (path.length > 0) {
        return [root, ...path];
      }
    }
  }
  return [];
}

/**
 * Immutably update a node anywhere in the tree
 */
export function updateNodeInTree(
  root: ComponentNode,
  id: string,
  updater: (node: ComponentNode) => ComponentNode
): ComponentNode {
  if (root.id === id) {
    return updater(root);
  }
  if (!root.children || root.children.length === 0) {
    return root;
  }
  return {
    ...root,
    children: root.children.map((child) => updateNodeInTree(child, id, updater)),
  };
}

/**
 * Insert a new node into a container node
 */
export function insertNodeIntoTree(
  root: ComponentNode,
  targetContainerId: string,
  newNode: ComponentNode,
  targetIndex?: number
): ComponentNode {
  if (root.id === targetContainerId) {
    const existing = root.children ? [...root.children] : [];
    if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= existing.length) {
      existing.splice(targetIndex, 0, newNode);
    } else {
      existing.push(newNode);
    }
    return {
      ...root,
      children: existing,
    };
  }

  if (!root.children || root.children.length === 0) {
    return root;
  }

  return {
    ...root,
    children: root.children.map((child) =>
      insertNodeIntoTree(child, targetContainerId, newNode, targetIndex)
    ),
  };
}

/**
 * Remove a node from the tree
 */
export function removeNodeFromTree(root: ComponentNode, id: string): ComponentNode {
  if (!root.children || root.children.length === 0) {
    return root;
  }
  return {
    ...root,
    children: root.children
      .filter((child) => child.id !== id)
      .map((child) => removeNodeFromTree(child, id)),
  };
}

/**
 * Move a sibling node up or down in its parent's children array
 */
export function moveNodeInTree(
  root: ComponentNode,
  id: string,
  direction: 'up' | 'down'
): ComponentNode {
  const found = findParentNode(root, id);
  if (!found) return root;

  const { parent, index } = found;
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (!parent.children || newIndex < 0 || newIndex >= parent.children.length) {
    return root;
  }

  const updatedChildren = [...parent.children];
  const [removed] = updatedChildren.splice(index, 1);
  updatedChildren.splice(newIndex, 0, removed);

  return updateNodeInTree(root, parent.id, (p) => ({
    ...p,
    children: updatedChildren,
  }));
}

/**
 * Deep clone a node with fresh random IDs
 */
export function cloneNodeWithFreshIds(node: ComponentNode): ComponentNode {
  const freshId = createId('node');
  return {
    ...node,
    id: freshId,
    name: `${node.name} (Copy)`,
    children: node.children ? node.children.map(cloneNodeWithFreshIds) : undefined,
  };
}

/**
 * Duplicate a node in place as a sibling
 */
export function duplicateNodeInTree(root: ComponentNode, id: string): ComponentNode {
  const found = findParentNode(root, id);
  if (!found) return root;

  const { parent, index } = found;
  const targetNode = parent.children![index];
  const duplicated = cloneNodeWithFreshIds(targetNode);

  const updatedChildren = [...parent.children!];
  updatedChildren.splice(index + 1, 0, duplicated);

  return updateNodeInTree(root, parent.id, (p) => ({
    ...p,
    children: updatedChildren,
  }));
}

/**
 * Reposition a node: either reordering within the same container,
 * or moving across different containers/frames to a specific targetIndex
 */
export function repositionNodeInTree(
  root: ComponentNode,
  sourceNodeId: string,
  targetContainerId: string,
  targetIndex?: number
): ComponentNode {
  // Cannot move root or move a node inside itself
  if (root.id === sourceNodeId || sourceNodeId === targetContainerId) {
    return root;
  }

  // Find source node and its parent
  const sourceNode = findNode(root, sourceNodeId);
  const sourceParentInfo = findParentNode(root, sourceNodeId);
  if (!sourceNode || !sourceParentInfo) {
    return root;
  }

  // Check if targetContainerId is a descendant of sourceNode (prevent cyclical tree)
  const isDescendant = !!findNode(sourceNode, targetContainerId);
  if (isDescendant) {
    return root;
  }

  // Same container reordering
  if (sourceParentInfo.parent.id === targetContainerId) {
    const parent = sourceParentInfo.parent;
    const oldIndex = sourceParentInfo.index;
    const children = [...(parent.children || [])];

    const [moved] = children.splice(oldIndex, 1);
    if (!moved) return root;

    let destIndex = typeof targetIndex === 'number' ? targetIndex : children.length;
    if (oldIndex < destIndex) {
      destIndex = Math.max(0, destIndex - 1);
    }
    destIndex = Math.max(0, Math.min(destIndex, children.length));
    children.splice(destIndex, 0, moved);

    return updateNodeInTree(root, parent.id, (p) => ({
      ...p,
      children,
    }));
  }

  // Cross-container move:
  // Step 1: Remove node from old parent
  const treeWithoutSource = removeNodeFromTree(root, sourceNodeId);

  // Step 2: Insert into new container at targetIndex
  return insertNodeIntoTree(treeWithoutSource, targetContainerId, sourceNode, targetIndex);
}
