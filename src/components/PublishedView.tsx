import React, { useState, useEffect } from 'react';
import { DeviceViewport, SiteProject } from '../types';
import { ComponentRenderer } from './ComponentRenderer';
import { ProductionLogDrawer } from './ProductionLogDrawer';
import { Toast } from './Toast';
import { useOperatorRuntime } from '../hooks/useOperatorRuntime';
import { useToast } from '../hooks/useToast';
import {
  Share2,
  Monitor,
  Tablet,
  Smartphone,
  Check,
  ArrowLeft,
  FileSpreadsheet,
} from 'lucide-react';

interface PublishedViewProps {
  project: SiteProject;
  initialPageId?: string;
  onExitPublished: () => void;
  onOpenPublishModal: () => void;
}

export const PublishedView: React.FC<PublishedViewProps> = ({
  project,
  initialPageId,
  onExitPublished,
  onOpenPublishModal,
}) => {
  const [activePageId, setActivePageId] = useState<string>(
    initialPageId || project.activePageId || project.pages[0]?.id
  );
  const [viewport, setViewport] = useState<DeviceViewport>('desktop');
  const [isCopied, setIsCopied] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const { toastMessage, showToast } = useToast();

  const activePage = project.pages.find((p) => p.id === activePageId) || project.pages[0];

  // Sync with URL hash
  useEffect(() => {
    const handleHash = () => {
      const hashSlug = window.location.hash.replace('#', '');
      if (hashSlug) {
        const matchingPage = project.pages.find((p) => p.slug === hashSlug);
        if (matchingPage) {
          setActivePageId(matchingPage.id);
        }
      }
    };

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [project.pages]);

  const handleNavigate = (pageId: string) => {
    const target = project.pages.find((p) => p.id === pageId);
    if (target) {
      setActivePageId(target.id);
      window.location.hash = target.slug;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const { runtimeValues, productionLogs, setRuntimeValue, clearLogs, triggerAction } =
    useOperatorRuntime({
      station: activePage,
      notify: showToast,
      onExit: onExitPublished,
      onNavigate: handleNavigate,
    });

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#${activePage.slug}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getViewportContainerClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-[420px] my-6 shadow-2xl border-2 border-stone-900 rounded-none overflow-hidden';
      case 'tablet':
        return 'w-[820px] my-6 shadow-2xl border-2 border-stone-900 rounded-none overflow-hidden';
      case 'desktop':
      default:
        return 'w-full max-w-5xl my-6 border-2 border-stone-900 rounded-none overflow-hidden shadow-2xl';
    }
  };

  return (
    <div className="min-h-screen bg-stone-800 flex flex-col items-center select-text">
      {/* Top Floating Visitor Toolbar */}
      <header className="sticky top-0 z-50 w-full bg-stone-900 border-b border-stone-700 px-4 py-2.5 flex items-center justify-between text-xs text-stone-300">
        {/* Left: Editor Switch & Active Station Selector */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitPublished}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors font-bold text-[11px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>

          <div className="h-4 w-px bg-stone-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-bold text-white truncate max-w-[140px] sm:max-w-none">
              {project.name}
            </span>
            <span className="text-stone-500 hidden sm:inline">/</span>
            <select
              value={activePageId}
              onChange={(e) => handleNavigate(e.target.value)}
              className="bg-stone-950 border border-stone-700 rounded-none px-2 py-0.5 text-xs text-stone-200 font-bold cursor-pointer focus:outline-none"
            >
              {project.pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (/{p.slug})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Viewport Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-stone-950 p-0.5 border border-stone-800">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`p-1.5 transition-colors ${
              viewport === 'desktop' ? 'bg-stone-700 text-white' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`p-1.5 transition-colors ${
              viewport === 'tablet' ? 'bg-stone-700 text-white' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Tablet View"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`p-1.5 transition-colors ${
              viewport === 'mobile' ? 'bg-stone-700 text-white' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Production Log Button, Share */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLogDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Logs ({productionLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2.5 py-1 rounded-none bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors text-[11px] font-bold"
            title="Copy shareable station URL"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenPublishModal}
            className="px-3 py-1 rounded-none bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors"
          >
            Settings
          </button>
        </div>
      </header>

      <Toast message={toastMessage} />

      {/* Main MES Terminal Viewport */}
      <main className="w-full flex-1 flex flex-col items-center justify-center p-4">
        <div className={getViewportContainerClass()}>
          <ComponentRenderer
            node={activePage.rootNode}
            pages={project.pages}
            currentPageId={activePage.id}
            isDesignMode={false}
            selectedNodeId={null}
            onSelectNode={() => {}}
            onUpdateNodeProps={() => {}}
            onUpdateNodeStyle={() => {}}
            onNavigate={handleNavigate}
            onActionTrigger={triggerAction}
            runtimeValues={runtimeValues}
            onRuntimeValueChange={setRuntimeValue}
          />
        </div>
      </main>

      {/* Production Log Drawer */}
      <ProductionLogDrawer
        isOpen={isLogDrawerOpen}
        logs={productionLogs}
        onClose={() => setIsLogDrawerOpen(false)}
        onClearLogs={clearLogs}
      />
    </div>
  );
};
