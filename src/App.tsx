import React, { useState, useEffect, useRef } from 'react';
import {
  SiteProject,
  Page,
  ComponentNode,
  DeviceViewport,
  AppMode,
  BuilderSubMode,
  ProductionLogRecord,
  IsaHmiTheme,
  KioskPresetId,
  KIOSK_PRESETS,
} from './types';
import { INITIAL_PROJECT } from './data/defaultProject';
import { COMPONENT_PRIMITIVES, PrimitiveTemplateMeta } from './data/componentLibrary';
import {
  findNode,
  updateNodeInTree,
  insertNodeIntoTree,
  removeNodeFromTree,
  moveNodeInTree,
  repositionNodeInTree,
  duplicateNodeInTree,
  cloneNodeWithFreshIds,
} from './utils/componentTreeUtils';
import { TopNavbar } from './components/TopNavbar';
import { ActivityRail } from './components/ActivityRail';
import { PagesPanel } from './components/PagesPanel';
import { BlockLibraryPanel } from './components/BlockLibraryPanel';
import { LayersTreePanel } from './components/LayersTreePanel';
import { Canvas } from './components/Canvas';
import { InspectorPanel } from './components/InspectorPanel';
import { VisualLinkGraph } from './components/VisualLinkGraph';
import { PublishedView } from './components/PublishedView';
import { PublishModal } from './components/PublishModal';
import { ProductionLogDrawer } from './components/ProductionLogDrawer';
import { PanelLeftClose, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'pagedraft_isa101_project_v3';

export default function App() {
  const [project, setProject] = useState<SiteProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pages?.[0]?.rootNode) {
          // Auto-migrate legacy brownish-gray (#71717A) to deep dark industrial slate (#18181B)
          if (parsed.pages) {
            parsed.pages = parsed.pages.map((p: any) => {
              if (p.rootNode?.style?.backgroundColor === '#71717A') {
                return {
                  ...p,
                  rootNode: {
                    ...p.rootNode,
                    style: { ...p.rootNode.style, backgroundColor: '#18181B' },
                  },
                };
              }
              return p;
            });
          }
          if (parsed.theme?.mode === 'isa_day_gray') {
            parsed.theme.mode = 'isa_slate_dark';
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed reading from local storage', err);
    }
    return INITIAL_PROJECT;
  });

  const [mode, setMode] = useState<AppMode>(() => {
    if (window.location.hash && window.location.hash.length > 1) {
      return 'published';
    }
    return 'editor';
  });

  const [builderMode, setBuilderMode] = useState<BuilderSubMode>('design');
  const [viewport, setViewport] = useState<DeviceViewport>('desktop');
  const [kioskPresetId, setKioskPresetId] = useState<KioskPresetId>('1280x800');
  const [zoom, setZoom] = useState<number>(1.0);
  const [activeLeftTab, setActiveLeftTab] = useState<'pages' | 'library' | 'layers'>('library');
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Operator Mode Runtime State
  const [runtimeValues, setRuntimeValues] = useState<Record<string, any>>({});
  const [productionLogs, setProductionLogs] = useState<ProductionLogRecord[]>([]);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const workbenchContainerRef = useRef<HTMLDivElement>(null);

  // Zoom to Fit screen calculation
  const handleZoomToFit = () => {
    if (!workbenchContainerRef.current) return;
    const preset = KIOSK_PRESETS[kioskPresetId] || KIOSK_PRESETS['1280x800'];
    const containerWidth = workbenchContainerRef.current.clientWidth - 80;
    const containerHeight = workbenchContainerRef.current.clientHeight - 80;

    const scaleX = containerWidth / preset.width;
    const scaleY = containerHeight / preset.height;
    const fitScale = Math.min(scaleX, scaleY, 1.0);
    setZoom(Math.min(2.0, Math.max(0.4, Math.round(fitScale * 100) / 100)));
  };

  // Persist project changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (err) {
      console.error('Storage save error', err);
    }
  }, [project]);

  // Active station
  const activePage =
    project.pages.find((p) => p.id === project.activePageId) || project.pages[0];

  // Selected component node
  const selectedNode =
    activePage?.rootNode && selectedNodeId
      ? findNode(activePage.rootNode, selectedNodeId)
      : null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Switch Theme (Slate Dark vs Day Gray vs Night Charcoal)
  const handleSetTheme = (themeMode: IsaHmiTheme) => {
    const bgMap: Record<IsaHmiTheme, string> = {
      isa_slate_dark: '#18181B',
      isa_day_gray: '#27272A',
      isa_night_charcoal: '#0F172A',
      clean_light: '#F4F4F5',
    };
    const targetBg = bgMap[themeMode] || '#18181B';

    setProject((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        mode: themeMode,
      },
      pages: prev.pages.map((p) => ({
        ...p,
        rootNode: {
          ...p.rootNode,
          style: {
            ...p.rootNode.style,
            backgroundColor: targetBg,
          },
        },
      })),
    }));
    const label =
      themeMode === 'isa_slate_dark'
        ? 'Deep Slate Dark'
        : themeMode === 'isa_night_charcoal'
        ? 'Night Charcoal'
        : 'Day Zinc';
    showToast(`Switched theme to ${label}`);
  };

  // Station navigation handler
  const handleSelectPage = (pageId: string) => {
    setProject((prev) => ({
      ...prev,
      activePageId: pageId,
    }));
    setSelectedNodeId(null);
  };

  // Node selection handler - Does not force inspector open!
  const handleSelectNode = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedNodeId(nodeId);
  };

  // Update node in the active station's component tree
  const handleUpdateNode = (nodeId: string, updates: Partial<ComponentNode>) => {
    if (!activePage) return;
    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          rootNode: updateNodeInTree(p.rootNode, nodeId, (existing) => ({
            ...existing,
            ...updates,
          })),
        };
      }),
    }));
  };

  const handleUpdateNodeProps = (nodeId: string, newProps: any) => {
    handleUpdateNode(nodeId, { props: newProps });
  };

  const handleUpdateNodeStyle = (nodeId: string, newStyle: any) => {
    handleUpdateNode(nodeId, { style: newStyle });
  };

  // Delete node
  const handleDeleteNode = (nodeId: string) => {
    if (!activePage) return;
    if (nodeId === activePage.rootNode.id) {
      showToast('Cannot delete root station container.');
      return;
    }

    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          rootNode: removeNodeFromTree(p.rootNode, nodeId),
        };
      }),
    }));

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // Duplicate node
  const handleDuplicateNode = (nodeId: string) => {
    if (!activePage) return;
    if (nodeId === activePage.rootNode.id) return;

    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          rootNode: duplicateNodeInTree(p.rootNode, nodeId),
        };
      }),
    }));
  };

  // Move sibling up or down
  const handleMoveNode = (nodeId: string, direction: 'up' | 'down') => {
    if (!activePage) return;
    if (nodeId === activePage.rootNode.id) return;

    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          rootNode: moveNodeInTree(p.rootNode, nodeId, direction),
        };
      }),
    }));
  };

  // Reposition node (reorder within same container or move across different containers/frames)
  const handleRepositionNode = (
    sourceId: string,
    targetContainerId: string,
    targetIndex?: number
  ) => {
    if (!activePage) return;
    if (sourceId === activePage.rootNode.id) return;

    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          rootNode: repositionNodeInTree(p.rootNode, sourceId, targetContainerId, targetIndex),
        };
      }),
    }));
    setSelectedNodeId(sourceId);
  };

  // Keyboard shortcut: Alt+ArrowUp / Alt+ArrowDown to nudge selected node up/down
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedNodeId || builderMode !== 'design') return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        handleMoveNode(selectedNodeId, 'up');
      } else if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        handleMoveNode(selectedNodeId, 'down');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, activePage, builderMode]);

  // Add child to a container
  const handleAddChildToContainer = (containerId: string, primitive?: PrimitiveTemplateMeta) => {
    if (!activePage) return;
    const template = primitive || COMPONENT_PRIMITIVES[0];
    const newNode = template.createNode();

    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          rootNode: insertNodeIntoTree(p.rootNode, containerId, newNode),
        };
      }),
    }));

    setSelectedNodeId(newNode.id);
  };

  // Add component from palette
  const handleAddComponentFromPalette = (template: PrimitiveTemplateMeta) => {
    if (!activePage) return;
    const newNode = template.createNode();

    let targetContainerId = activePage.rootNode.id;
    if (selectedNode && selectedNode.type === 'container') {
      targetContainerId = selectedNode.id;
    }

    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          rootNode: insertNodeIntoTree(p.rootNode, targetContainerId, newNode),
        };
      }),
    }));

    setSelectedNodeId(newNode.id);
    showToast(`Added ${newNode.name}`);
  };

  // Drop child into container on canvas
  const handleDropChild = (targetContainerId: string, templateTitle: string) => {
    const template = COMPONENT_PRIMITIVES.find((t) => t.title === templateTitle);
    if (!template || !activePage) return;

    const newNode = template.createNode();
    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          rootNode: insertNodeIntoTree(p.rootNode, targetContainerId, newNode),
        };
      }),
    }));

    setSelectedNodeId(newNode.id);
  };

  // Reset to blank canvas
  const handleClearToBlankCanvas = () => {
    if (!activePage) return;
    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          rootNode: {
            ...p.rootNode,
            children: [],
          },
        };
      }),
    }));
    setSelectedNodeId(null);
    showToast('Canvas cleared to blank.');
  };

  // Load CTC Auto Log (PD3) template from screenshot
  const handleLoadCtcTemplate = () => {
    if (!activePage) return;
    const ctcStation = INITIAL_PROJECT.pages[0];
    const clonedRoot = cloneNodeWithFreshIds(ctcStation.rootNode);

    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          rootNode: clonedRoot,
        };
      }),
    }));
    setSelectedNodeId(null);
    showToast('Loaded CTC Auto Log screen.');
  };

  // Link two pages from the topology graph
  const handleLinkPages = (sourcePageId: string, targetPageId: string) => {
    const targetPage = project.pages.find((p) => p.id === targetPageId);
    if (!targetPage) return;

    const newBtnNode: ComponentNode = {
      id: 'node-' + Math.random().toString(36).slice(2, 9),
      name: `Route to ${targetPage.name}`,
      type: 'button',
      style: { width: 'auto' },
      props: {
        label: `ROUTE: ${targetPage.name} →`,
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
      pages: prev.pages.map((p) => {
        if (p.id !== sourcePageId) return p;
        return {
          ...p,
          rootNode: insertNodeIntoTree(p.rootNode, p.rootNode.id, newBtnNode),
        };
      }),
    }));

    showToast(`Linked to ${targetPage.name}!`);
  };

  // Add new station page
  const handleAddPage = (newPageData: Partial<Page>) => {
    const id = 'station-' + Math.random().toString(36).slice(2, 9);
    const bg = project.theme.mode === 'isa_night_charcoal' ? '#0F172A' : '#18181B';

    const newStationRoot: ComponentNode = {
      id: 'root-' + id,
      name: `${newPageData.name || 'New Station'} Viewport`,
      type: 'container',
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'between',
        padding: 6,
        width: 'full',
        minHeight: '520px',
        backgroundColor: bg,
      },
      props: {},
      children: [], // Starts completely blank by default as requested!
    };

    const newPage: Page = {
      id,
      name: newPageData.name || 'New Station',
      slug: newPageData.slug || 'station',
      title: newPageData.title || `${newPageData.name || 'New Station'} — ${project.name}`,
      description: newPageData.description || 'ISA-101 Operator Terminal.',
      isHome: false,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      rootNode: newStationRoot,
    };

    setProject((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
      activePageId: id,
    }));

    setSelectedNodeId(null);
    showToast(`Created blank ${newPage.name}`);
  };

  // Delete station page
  const handleDeletePage = (pageId: string) => {
    if (project.pages.length <= 1) return;
    setProject((prev) => {
      const remaining = prev.pages.filter((p) => p.id !== pageId);
      const nextActiveId =
        prev.activePageId === pageId ? remaining[0].id : prev.activePageId;
      return {
        ...prev,
        pages: remaining,
        activePageId: nextActiveId,
      };
    });
    setSelectedNodeId(null);
  };

  // Duplicate station page
  const handleDuplicatePage = (pageId: string) => {
    const source = project.pages.find((p) => p.id === pageId);
    if (!source) return;

    const copyId = 'station-' + Math.random().toString(36).slice(2, 9);
    const copyRoot = cloneNodeWithFreshIds(source.rootNode);

    const copyPage: Page = {
      ...source,
      id: copyId,
      name: `${source.name} Copy`,
      slug: `${source.slug}-copy`,
      isHome: false,
      rootNode: copyRoot,
    };

    setProject((prev) => ({
      ...prev,
      pages: [...prev.pages, copyPage],
      activePageId: copyId,
    }));
    setSelectedNodeId(null);
  };

  // Update station metadata
  const handleUpdatePage = (pageId: string, updates: Partial<Page>) => {
    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.id === pageId ? { ...p, ...updates } : p)),
    }));
  };

  // Reorder station pages
  const handleReorderPages = (startIndex: number, endIndex: number) => {
    setProject((prev) => {
      const nextPages = [...prev.pages];
      const [removed] = nextPages.splice(startIndex, 1);
      nextPages.splice(endIndex, 0, removed);
      return { ...prev, pages: nextPages };
    });
  };

  // Operator Action Trigger
  const handleActionTrigger = (actionType: string, meta?: any) => {
    if (actionType === 'exit') {
      setBuilderMode('design');
      showToast('Exited Operator Mode to Editor.');
    } else if (actionType === 'submit_log') {
      const newRecord: ProductionLogRecord = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        stationId: activePage.id,
        stationName: activePage.name,
        workOrderId: 'WO-8842',
        lotNumber: runtimeValues['carrier-barcode-input'] || 'SN-7849-B2',
        operatorId: runtimeValues['operator-id'] || 'OP-402',
        status: 'PASS',
        data: { ...runtimeValues },
      };

      setProductionLogs((prev) => [newRecord, ...prev]);
      showToast(`Batch recorded: ${newRecord.lotNumber}`);

      if (meta?.targetPageId) {
        setTimeout(() => {
          handleSelectPage(meta.targetPageId);
        }, 350);
      }
    } else if (actionType === 'toggle_hold') {
      showToast('Station placed ON HOLD.');
    } else if (actionType === 'clear_inputs') {
      setRuntimeValues({});
      showToast('Station input reset.');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#121316] text-stone-100 overflow-hidden font-sans">
      {/* Top Application Bar - Sleek Single Unified Header */}
      <TopNavbar
        project={project}
        mode={mode}
        isInspectorOpen={isInspectorOpen}
        productionLogsCount={productionLogs.length}
        onOpenLogs={() => setIsLogDrawerOpen(true)}
        onSetMode={setMode}
        onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
        onPublishClick={() => setIsPublishModalOpen(true)}
        onUpdateProjectName={(name) => setProject((prev) => ({ ...prev, name }))}
        builderMode={builderMode}
        onSetBuilderMode={setBuilderMode}
        kioskPresetId={kioskPresetId}
        onSetKioskPresetId={setKioskPresetId}
        zoom={zoom}
        onSetZoom={setZoom}
        onZoomToFit={handleZoomToFit}
        currentTheme={project.theme.mode || 'isa_slate_dark'}
        onSetTheme={handleSetTheme}
        onClearToBlankCanvas={handleClearToBlankCanvas}
        onLoadCtcTemplate={handleLoadCtcTemplate}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Permanent 48px Activity Rail on far left - CSS Selector 4 */}
        {mode === 'editor' && (
          <ActivityRail
            activeTab={activeLeftTab}
            isDrawerOpen={isLeftDrawerOpen}
            onSelectTab={(tab) => {
              setActiveLeftTab(tab);
              if (!isLeftDrawerOpen) setIsLeftDrawerOpen(true);
            }}
            onToggleDrawer={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}
            mode={mode}
            onSetMode={setMode}
            productionLogsCount={productionLogs.length}
            onOpenLogs={() => setIsLogDrawerOpen(true)}
          />
        )}

        {/* Collapsible Left Flyout Dock (280px) - CSS Selectors 7 & 8 */}
        {mode === 'editor' && isLeftDrawerOpen && (
          <aside className="w-[280px] shrink-0 bg-stone-900 border-r border-stone-800 flex flex-col z-20 overflow-hidden">
            {activeLeftTab === 'pages' && (
              <PagesPanel
                pages={project.pages}
                activePageId={project.activePageId}
                onSelectPage={handleSelectPage}
                onAddPage={handleAddPage}
                onDeletePage={handleDeletePage}
                onDuplicatePage={handleDuplicatePage}
                onUpdatePage={handleUpdatePage}
                onReorderPages={handleReorderPages}
                onToggleCollapse={() => setIsLeftDrawerOpen(false)}
              />
            )}

            {activeLeftTab === 'library' && (
              <BlockLibraryPanel
                onAddComponent={handleAddComponentFromPalette}
                onToggleCollapse={() => setIsLeftDrawerOpen(false)}
              />
            )}

            {activeLeftTab === 'layers' && (
              <div className="flex flex-col h-full bg-stone-900 text-stone-200 select-none">
                <div className="px-3 py-2.5 border-b border-stone-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white tracking-tight">Layers Hierarchy</span>
                  <button
                    type="button"
                    onClick={() => setIsLeftDrawerOpen(false)}
                    className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                    title="Collapse Left Dock"
                  >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                  </button>
                </div>
                <LayersTreePanel
                  rootNode={activePage.rootNode}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={(id) => handleSelectNode(id)}
                  onDeleteNode={handleDeleteNode}
                  onDuplicateNode={handleDuplicateNode}
                  onMoveNode={handleMoveNode}
                  onAddChildToContainer={(id) => handleAddChildToContainer(id)}
                />
              </div>
            )}
          </aside>
        )}

        {/* Center Canvas / Topology Graph / Visitor Mode - CSS Selector 2 */}
        <main className="flex-1 flex overflow-hidden relative">
          {mode === 'editor' && (
            <Canvas
              activePage={activePage}
              pages={project.pages}
              viewport={viewport}
              builderMode={builderMode}
              currentTheme={project.theme.mode || 'isa_slate_dark'}
              kioskPresetId={kioskPresetId}
              zoom={zoom}
              onSetTheme={handleSetTheme}
              onSetBuilderMode={setBuilderMode}
              onSetViewport={setViewport}
              onSetKioskPresetId={setKioskPresetId}
              onSetZoom={setZoom}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              onUpdateNodeProps={handleUpdateNodeProps}
              onUpdateNodeStyle={handleUpdateNodeStyle}
              onNavigate={handleSelectPage}
              onActionTrigger={handleActionTrigger}
              onDropChild={handleDropChild}
              onDuplicateNode={handleDuplicateNode}
              onDeleteNode={handleDeleteNode}
              onMoveNode={handleMoveNode}
              onRepositionNode={handleRepositionNode}
              runtimeValues={runtimeValues}
              onRuntimeValueChange={(nodeId, val) =>
                setRuntimeValues((prev) => ({ ...prev, [nodeId]: val }))
              }
              onResetRuntimeValues={() => setRuntimeValues({})}
              onClearToBlankCanvas={handleClearToBlankCanvas}
              onLoadCtcTemplate={handleLoadCtcTemplate}
              workbenchContainerRef={workbenchContainerRef}
            />
          )}

          {mode === 'graph' && (
            <VisualLinkGraph
              pages={project.pages}
              activePageId={project.activePageId}
              onSelectPage={(pageId) => {
                handleSelectPage(pageId);
                setMode('editor');
              }}
              onLinkPages={handleLinkPages}
              onAddPage={() => handleAddPage({ name: 'Station ' + (project.pages.length + 1) })}
            />
          )}

          {mode === 'published' && (
            <PublishedView
              project={project}
              initialPageId={project.activePageId}
              onExitPublished={() => setMode('editor')}
              onOpenPublishModal={() => setIsPublishModalOpen(true)}
            />
          )}
        </main>

        {/* Right Inspector Panel - CSS Selectors 1 & 6 */}
        {mode === 'editor' && isInspectorOpen && (
          <aside className="w-[300px] shrink-0 z-20 bg-stone-900 border-l border-stone-800 flex flex-col overflow-hidden">
            <InspectorPanel
              rootNode={activePage.rootNode}
              selectedNode={selectedNode}
              pages={project.pages}
              onSelectNode={handleSelectNode}
              onUpdateNode={handleUpdateNode}
              onDeleteNode={handleDeleteNode}
              onDuplicateNode={handleDuplicateNode}
              onMoveNode={handleMoveNode}
              onClose={() => setIsInspectorOpen(false)}
            />
          </aside>
        )}
      </div>

      {/* Production Batch Data Log Drawer */}
      <ProductionLogDrawer
        isOpen={isLogDrawerOpen}
        logs={productionLogs}
        onClose={() => setIsLogDrawerOpen(false)}
        onClearLogs={() => setProductionLogs([])}
      />

      {/* Publish Settings Modal */}
      <PublishModal
        project={project}
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onViewLive={() => {
          setIsPublishModalOpen(false);
          setMode('published');
        }}
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-stone-900 border-2 border-stone-700 text-white text-xs font-bold shadow-2xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
