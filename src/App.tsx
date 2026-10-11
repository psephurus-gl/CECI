import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PanelLeftClose } from 'lucide-react';
import {
  AppMode,
  BuilderSubMode,
  KIOSK_PRESETS,
  KioskPresetId,
  LeftDockTab,
} from './types';
import { INITIAL_PROJECT } from './data/defaultProject';
import { COMPONENT_PRIMITIVES, PrimitiveTemplateMeta } from './data/componentLibrary';
import { createBlankProject } from './data/stationFactory';
import { findNode } from './utils/componentTreeUtils';
import { hasSavedProject } from './utils/projectStorage';
import { useProject } from './hooks/useProject';
import { useOperatorRuntime } from './hooks/useOperatorRuntime';
import { useToast } from './hooks/useToast';
import { LandingPage } from './components/LandingPage';
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
import { Toast } from './components/Toast';

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2.0;
const WORKBENCH_PADDING = 80;
const DEFAULT_KIOSK_PRESET: KioskPresetId = '1280x800';

/** A URL hash (e.g. `#ctc-carrier`) deep-links straight into the published view. */
const hasPublishedDeepLink = () => window.location.hash.length > 1;

export default function App() {
  // Capture before `useProject` mounts and persists anything, so the landing page
  // only offers "Continue" for projects the visitor really saved earlier.
  const [hasPreviousProject, setHasPreviousProject] = useState(hasSavedProject);
  const [showLanding, setShowLanding] = useState(() => !hasPublishedDeepLink());

  const { toastMessage, showToast } = useToast();
  const projectApi = useProject(showToast);
  const { project, activePage, theme } = projectApi;

  const [mode, setMode] = useState<AppMode>(() =>
    hasPublishedDeepLink() ? 'published' : 'editor'
  );
  const [builderMode, setBuilderMode] = useState<BuilderSubMode>('design');
  const [kioskPresetId, setKioskPresetId] = useState<KioskPresetId>(DEFAULT_KIOSK_PRESET);
  const [zoom, setZoom] = useState(1.0);
  const [activeLeftTab, setActiveLeftTab] = useState<LeftDockTab>('library');
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);

  const workbenchContainerRef = useRef<HTMLDivElement>(null);

  const selectedNode = selectedNodeId ? findNode(activePage.rootNode, selectedNodeId) : null;

  // --- Operator (test run) runtime -----------------------------------------

  const handleSelectPage = useCallback(
    (pageId: string) => {
      projectApi.selectPage(pageId);
      setSelectedNodeId(null);
    },
    [projectApi.selectPage]
  );

  const handleExitOperator = useCallback(() => {
    setBuilderMode('design');
    showToast('Exited Operator Mode to Editor.');
  }, [showToast]);

  const runtime = useOperatorRuntime({
    station: activePage,
    notify: showToast,
    onExit: handleExitOperator,
    onNavigate: handleSelectPage,
  });

  // --- Canvas viewport -------------------------------------------------------

  const handleZoomToFit = () => {
    const container = workbenchContainerRef.current;
    if (!container) return;
    const preset = KIOSK_PRESETS[kioskPresetId] ?? KIOSK_PRESETS[DEFAULT_KIOSK_PRESET];
    const scaleX = (container.clientWidth - WORKBENCH_PADDING) / preset.width;
    const scaleY = (container.clientHeight - WORKBENCH_PADDING) / preset.height;
    const fitScale = Math.min(scaleX, scaleY, 1.0);
    setZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(fitScale * 100) / 100)));
  };

  // --- Node editing ----------------------------------------------------------

  const handleSelectNode = (nodeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedNodeId(nodeId);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (projectApi.deleteNode(nodeId) && selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  const handleRepositionNode = (sourceId: string, targetContainerId: string, targetIndex?: number) => {
    projectApi.repositionNode(sourceId, targetContainerId, targetIndex);
    setSelectedNodeId(sourceId);
  };

  const handleAddChildToContainer = (
    containerId: string,
    template: PrimitiveTemplateMeta = COMPONENT_PRIMITIVES[0]
  ) => {
    setSelectedNodeId(projectApi.addNode(containerId, template).id);
  };

  const handleAddComponentFromPalette = (template: PrimitiveTemplateMeta) => {
    const target = projectApi.resolveInsertTarget(selectedNodeId);
    const node = projectApi.addNode(target, template);
    setSelectedNodeId(node.id);
    showToast(`Added ${node.name}`);
  };

  const handleDropChild = (containerId: string, templateTitle: string) => {
    const template = COMPONENT_PRIMITIVES.find((t) => t.title === templateTitle);
    if (template) handleAddChildToContainer(containerId, template);
  };

  const handleClearToBlankCanvas = () => {
    projectApi.clearActivePage();
    setSelectedNodeId(null);
  };

  const handleLoadCtcTemplate = () => {
    projectApi.loadCtcTemplate();
    setSelectedNodeId(null);
  };

  // --- Station management ----------------------------------------------------

  const handleAddPage = (data: Parameters<typeof projectApi.addPage>[0]) => {
    projectApi.addPage(data);
    setSelectedNodeId(null);
  };

  const handleDeletePage = (pageId: string) => {
    projectApi.deletePage(pageId);
    setSelectedNodeId(null);
  };

  const handleDuplicatePage = (pageId: string) => {
    projectApi.duplicatePage(pageId);
    setSelectedNodeId(null);
  };

  // --- Landing page ----------------------------------------------------------

  const enterStudio = () => {
    setHasPreviousProject(true);
    setSelectedNodeId(null);
    setMode('editor');
    setBuilderMode('design');
    setShowLanding(false);
  };

  const handleOpenSample = () => {
    projectApi.replaceProject(INITIAL_PROJECT);
    enterStudio();
  };

  const handleStartBlank = () => {
    projectApi.replaceProject(createBlankProject());
    enterStudio();
  };

  // Keyboard shortcut: Alt+ArrowUp / Alt+ArrowDown nudges the selected node.
  useEffect(() => {
    if (showLanding) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedNodeId || builderMode !== 'design' || !e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        projectApi.moveNode(selectedNodeId, e.key === 'ArrowUp' ? 'up' : 'down');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLanding, selectedNodeId, builderMode, projectApi.moveNode]);

  if (showLanding) {
    return (
      <LandingPage
        savedProjectName={hasPreviousProject ? project.name : null}
        onContinue={enterStudio}
        onOpenSample={handleOpenSample}
        onStartBlank={handleStartBlank}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#121316] text-stone-100 overflow-hidden font-sans">
      <TopNavbar
        project={project}
        mode={mode}
        isInspectorOpen={isInspectorOpen}
        productionLogsCount={runtime.productionLogs.length}
        onOpenLogs={() => setIsLogDrawerOpen(true)}
        onSetMode={setMode}
        onToggleInspector={() => setIsInspectorOpen((open) => !open)}
        onPublishClick={() => setIsPublishModalOpen(true)}
        onUpdateProjectName={projectApi.setProjectName}
        onGoHome={() => setShowLanding(true)}
        builderMode={builderMode}
        onSetBuilderMode={setBuilderMode}
        kioskPresetId={kioskPresetId}
        onSetKioskPresetId={setKioskPresetId}
        zoom={zoom}
        onSetZoom={setZoom}
        onZoomToFit={handleZoomToFit}
        currentTheme={theme}
        onSetTheme={projectApi.setTheme}
        onClearToBlankCanvas={handleClearToBlankCanvas}
        onLoadCtcTemplate={handleLoadCtcTemplate}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {mode === 'editor' && (
          <ActivityRail
            activeTab={activeLeftTab}
            isDrawerOpen={isLeftDrawerOpen}
            onSelectTab={(tab) => {
              setActiveLeftTab(tab);
              setIsLeftDrawerOpen(true);
            }}
            onToggleDrawer={() => setIsLeftDrawerOpen((open) => !open)}
            mode={mode}
            onSetMode={setMode}
            productionLogsCount={runtime.productionLogs.length}
            onOpenLogs={() => setIsLogDrawerOpen(true)}
          />
        )}

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
                onUpdatePage={projectApi.updatePage}
                onReorderPages={projectApi.reorderPages}
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
                  onDuplicateNode={projectApi.duplicateNode}
                  onMoveNode={projectApi.moveNode}
                  onAddChildToContainer={(id) => handleAddChildToContainer(id)}
                />
              </div>
            )}
          </aside>
        )}

        <main className="flex-1 flex overflow-hidden relative">
          {mode === 'editor' && (
            <Canvas
              activePage={activePage}
              pages={project.pages}
              builderMode={builderMode}
              kioskPresetId={kioskPresetId}
              zoom={zoom}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              onUpdateNodeProps={projectApi.updateNodeProps}
              onUpdateNodeStyle={projectApi.updateNodeStyle}
              onNavigate={handleSelectPage}
              onActionTrigger={runtime.triggerAction}
              onDropChild={handleDropChild}
              onDuplicateNode={projectApi.duplicateNode}
              onDeleteNode={handleDeleteNode}
              onMoveNode={projectApi.moveNode}
              onRepositionNode={handleRepositionNode}
              runtimeValues={runtime.runtimeValues}
              onRuntimeValueChange={runtime.setRuntimeValue}
              onResetRuntimeValues={runtime.resetRuntimeValues}
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
              onLinkPages={projectApi.linkPages}
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

        {mode === 'editor' && isInspectorOpen && (
          <aside className="w-[300px] shrink-0 z-20 bg-stone-900 border-l border-stone-800 flex flex-col overflow-hidden">
            <InspectorPanel
              rootNode={activePage.rootNode}
              selectedNode={selectedNode}
              pages={project.pages}
              onSelectNode={handleSelectNode}
              onUpdateNode={projectApi.updateNode}
              onDeleteNode={handleDeleteNode}
              onDuplicateNode={projectApi.duplicateNode}
              onMoveNode={projectApi.moveNode}
              onClose={() => setIsInspectorOpen(false)}
            />
          </aside>
        )}
      </div>

      <ProductionLogDrawer
        isOpen={isLogDrawerOpen}
        logs={runtime.productionLogs}
        onClose={() => setIsLogDrawerOpen(false)}
        onClearLogs={runtime.clearLogs}
      />

      <PublishModal
        project={project}
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onViewLive={() => {
          setIsPublishModalOpen(false);
          setMode('published');
        }}
      />

      <Toast message={toastMessage} />
    </div>
  );
}
