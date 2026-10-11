import { useCallback, useEffect, useMemo, useState } from 'react';
import { ComponentNode, IsaHmiTheme, Page, SiteProject } from '../types';
import { INITIAL_PROJECT } from '../data/defaultProject';
import { PrimitiveTemplateMeta } from '../data/componentLibrary';
import { createBlankStation } from '../data/stationFactory';
import { DEFAULT_THEME, THEME_BACKGROUNDS, THEME_LABELS } from '../data/themes';
import {
  cloneNodeWithFreshIds,
  duplicateNodeInTree,
  findNode,
  insertNodeIntoTree,
  moveNodeInTree,
  removeNodeFromTree,
  repositionNodeInTree,
  updateNodeInTree,
} from '../utils/componentTreeUtils';
import { createId } from '../utils/id';
import { loadProject, saveProject } from '../utils/projectStorage';

type Notify = (message: string) => void;

/**
 * Owns the site project: persistence, theme, station (page) management and every
 * edit applied to the active station's component tree.
 */
export function useProject(notify: Notify) {
  const [project, setProject] = useState<SiteProject>(loadProject);

  useEffect(() => {
    saveProject(project);
  }, [project]);

  const activePage: Page = useMemo(
    () => project.pages.find((p) => p.id === project.activePageId) ?? project.pages[0],
    [project.pages, project.activePageId]
  );

  const theme: IsaHmiTheme = project.theme.mode || DEFAULT_THEME;

  /** Apply a transformation to the root of the currently active station. */
  const updateActiveRoot = useCallback((transform: (root: ComponentNode) => ComponentNode) => {
    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((page) =>
        page.id === prev.activePageId ? { ...page, rootNode: transform(page.rootNode) } : page
      ),
    }));
  }, []);

  const replaceProject = useCallback((next: SiteProject) => setProject(next), []);

  const setProjectName = useCallback(
    (name: string) => setProject((prev) => ({ ...prev, name })),
    []
  );

  const setTheme = useCallback(
    (mode: IsaHmiTheme) => {
      const background = THEME_BACKGROUNDS[mode];
      setProject((prev) => ({
        ...prev,
        theme: { ...prev.theme, mode },
        pages: prev.pages.map((page) => ({
          ...page,
          rootNode: {
            ...page.rootNode,
            style: { ...page.rootNode.style, backgroundColor: background },
          },
        })),
      }));
      notify(`Switched theme to ${THEME_LABELS[mode]}`);
    },
    [notify]
  );

  // --- Station (page) management -------------------------------------------

  const selectPage = useCallback((pageId: string) => {
    setProject((prev) => ({ ...prev, activePageId: pageId }));
  }, []);

  const addPage = useCallback(
    (data: Partial<Page>) => {
      const page = createBlankStation({
        name: data.name,
        slug: data.slug,
        title: data.title,
        description: data.description,
        projectName: project.name,
        theme,
      });
      setProject((prev) => ({ ...prev, pages: [...prev.pages, page], activePageId: page.id }));
      notify(`Created blank ${page.name}`);
    },
    [project.name, theme, notify]
  );

  const deletePage = useCallback((pageId: string) => {
    setProject((prev) => {
      if (prev.pages.length <= 1) return prev;
      const remaining = prev.pages.filter((p) => p.id !== pageId);
      const activePageId = prev.activePageId === pageId ? remaining[0].id : prev.activePageId;
      return { ...prev, pages: remaining, activePageId };
    });
  }, []);

  const duplicatePage = useCallback((pageId: string) => {
    setProject((prev) => {
      const source = prev.pages.find((p) => p.id === pageId);
      if (!source) return prev;
      const copy: Page = {
        ...source,
        id: createId('station'),
        name: `${source.name} Copy`,
        slug: `${source.slug}-copy`,
        isHome: false,
        rootNode: cloneNodeWithFreshIds(source.rootNode),
      };
      return { ...prev, pages: [...prev.pages, copy], activePageId: copy.id };
    });
  }, []);

  const updatePage = useCallback((pageId: string, updates: Partial<Page>) => {
    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.id === pageId ? { ...p, ...updates } : p)),
    }));
  }, []);

  const reorderPages = useCallback((startIndex: number, endIndex: number) => {
    setProject((prev) => {
      const pages = [...prev.pages];
      const [moved] = pages.splice(startIndex, 1);
      pages.splice(endIndex, 0, moved);
      return { ...prev, pages };
    });
  }, []);

  /** Add a navigation button on the source page that routes to the target page. */
  const linkPages = useCallback(
    (sourcePageId: string, targetPageId: string) => {
      const target = project.pages.find((p) => p.id === targetPageId);
      if (!target) return;

      const button: ComponentNode = {
        id: createId('node'),
        name: `Route to ${target.name}`,
        type: 'button',
        style: { width: 'auto' },
        props: {
          label: `ROUTE: ${target.name} →`,
          colorScheme: 'blue_action',
          variant: 'solid',
          shape: 'square',
          touchHeight: 48,
          actionType: 'navigate',
          targetPageId,
          icon: 'arrow',
        },
      };

      setProject((prev) => ({
        ...prev,
        pages: prev.pages.map((page) =>
          page.id === sourcePageId
            ? { ...page, rootNode: insertNodeIntoTree(page.rootNode, page.rootNode.id, button) }
            : page
        ),
      }));
      notify(`Linked to ${target.name}!`);
    },
    [project.pages, notify]
  );

  // --- Component tree editing on the active station ------------------------

  const updateNode = useCallback(
    (nodeId: string, updates: Partial<ComponentNode>) =>
      updateActiveRoot((root) => updateNodeInTree(root, nodeId, (node) => ({ ...node, ...updates }))),
    [updateActiveRoot]
  );

  const updateNodeProps = useCallback(
    (nodeId: string, props: ComponentNode['props']) => updateNode(nodeId, { props }),
    [updateNode]
  );

  const updateNodeStyle = useCallback(
    (nodeId: string, style: ComponentNode['style']) => updateNode(nodeId, { style }),
    [updateNode]
  );

  /** Returns false when the node is the (undeletable) station root. */
  const deleteNode = useCallback(
    (nodeId: string): boolean => {
      if (nodeId === activePage.rootNode.id) {
        notify('Cannot delete root station container.');
        return false;
      }
      updateActiveRoot((root) => removeNodeFromTree(root, nodeId));
      return true;
    },
    [activePage.rootNode.id, updateActiveRoot, notify]
  );

  const duplicateNode = useCallback(
    (nodeId: string) => {
      if (nodeId === activePage.rootNode.id) return;
      updateActiveRoot((root) => duplicateNodeInTree(root, nodeId));
    },
    [activePage.rootNode.id, updateActiveRoot]
  );

  const moveNode = useCallback(
    (nodeId: string, direction: 'up' | 'down') => {
      if (nodeId === activePage.rootNode.id) return;
      updateActiveRoot((root) => moveNodeInTree(root, nodeId, direction));
    },
    [activePage.rootNode.id, updateActiveRoot]
  );

  const repositionNode = useCallback(
    (sourceId: string, targetContainerId: string, targetIndex?: number) => {
      if (sourceId === activePage.rootNode.id) return;
      updateActiveRoot((root) => repositionNodeInTree(root, sourceId, targetContainerId, targetIndex));
    },
    [activePage.rootNode.id, updateActiveRoot]
  );

  /** Insert a new component into a container and return the created node. */
  const addNode = useCallback(
    (containerId: string, template: PrimitiveTemplateMeta): ComponentNode => {
      const node = template.createNode();
      updateActiveRoot((root) => insertNodeIntoTree(root, containerId, node));
      return node;
    },
    [updateActiveRoot]
  );

  /** Resolve the container that new palette items should land in (selected container or root). */
  const resolveInsertTarget = useCallback(
    (selectedNodeId: string | null): string => {
      const selected = selectedNodeId ? findNode(activePage.rootNode, selectedNodeId) : null;
      return selected?.type === 'container' ? selected.id : activePage.rootNode.id;
    },
    [activePage.rootNode]
  );

  const clearActivePage = useCallback(() => {
    updateActiveRoot((root) => ({ ...root, children: [] }));
    notify('Canvas cleared to blank.');
  }, [updateActiveRoot, notify]);

  const loadCtcTemplate = useCallback(() => {
    updateActiveRoot(() => cloneNodeWithFreshIds(INITIAL_PROJECT.pages[0].rootNode));
    notify('Loaded CTC Auto Log screen.');
  }, [updateActiveRoot, notify]);

  return {
    project,
    activePage,
    theme,
    replaceProject,
    setProjectName,
    setTheme,
    selectPage,
    addPage,
    deletePage,
    duplicatePage,
    updatePage,
    reorderPages,
    linkPages,
    updateNode,
    updateNodeProps,
    updateNodeStyle,
    deleteNode,
    duplicateNode,
    moveNode,
    repositionNode,
    addNode,
    resolveInsertTarget,
    clearActivePage,
    loadCtcTemplate,
  };
}
