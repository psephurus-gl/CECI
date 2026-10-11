import React from 'react';
import {
  Boxes,
  Layers,
  FileText,
  GitBranch,
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { AppMode } from '../types';

interface ActivityRailProps {
  activeTab: 'pages' | 'library' | 'layers';
  isDrawerOpen: boolean;
  onSelectTab: (tab: 'pages' | 'library' | 'layers') => void;
  onToggleDrawer: () => void;
  mode: AppMode;
  onSetMode: (mode: AppMode) => void;
  productionLogsCount: number;
  onOpenLogs: () => void;
}

export const ActivityRail: React.FC<ActivityRailProps> = ({
  activeTab,
  isDrawerOpen,
  onSelectTab,
  onToggleDrawer,
  mode,
  onSetMode,
  productionLogsCount,
  onOpenLogs,
}) => {
  const handleTabClick = (tab: 'pages' | 'library' | 'layers') => {
    if (mode !== 'editor') {
      onSetMode('editor');
      onSelectTab(tab);
      if (!isDrawerOpen) onToggleDrawer();
      return;
    }

    if (activeTab === tab && isDrawerOpen) {
      // If clicking already active tab, collapse drawer
      onToggleDrawer();
    } else {
      onSelectTab(tab);
      if (!isDrawerOpen) {
        onToggleDrawer();
      }
    }
  };

  return (
    <aside className="w-12 bg-[#121316] border-r border-stone-800 flex flex-col justify-between items-center py-2.5 z-30 shrink-0 select-none">
      {/* Top Main Navigation Tools */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {/* Component Palette */}
        <button
          type="button"
          onClick={() => handleTabClick('library')}
          className={`w-9 h-9 flex items-center justify-center rounded transition-all relative ${
            mode === 'editor' && isDrawerOpen && activeTab === 'library'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/80'
          }`}
          title="Component Palette (Primitives & Containers)"
        >
          <Boxes className="w-4 h-4" />
          {mode === 'editor' && isDrawerOpen && activeTab === 'library' && (
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-500 rounded-r" />
          )}
        </button>

        {/* Layers Tree */}
        <button
          type="button"
          onClick={() => handleTabClick('layers')}
          className={`w-9 h-9 flex items-center justify-center rounded transition-all relative ${
            mode === 'editor' && isDrawerOpen && activeTab === 'layers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/80'
          }`}
          title="Layers Tree (DOM Hierarchy)"
        >
          <Layers className="w-4 h-4" />
          {mode === 'editor' && isDrawerOpen && activeTab === 'layers' && (
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-500 rounded-r" />
          )}
        </button>

        {/* Station Pages */}
        <button
          type="button"
          onClick={() => handleTabClick('pages')}
          className={`w-9 h-9 flex items-center justify-center rounded transition-all relative ${
            mode === 'editor' && isDrawerOpen && activeTab === 'pages'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/80'
          }`}
          title="Workstation Pages"
        >
          <FileText className="w-4 h-4" />
          {mode === 'editor' && isDrawerOpen && activeTab === 'pages' && (
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-500 rounded-r" />
          )}
        </button>

        <div className="w-5 h-px bg-stone-800 my-1" />

        {/* Topology Route Graph */}
        <button
          type="button"
          onClick={() => onSetMode(mode === 'graph' ? 'editor' : 'graph')}
          className={`w-9 h-9 flex items-center justify-center rounded transition-all ${
            mode === 'graph'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/80'
          }`}
          title="Station Routing Graph (Topology)"
        >
          <GitBranch className="w-4 h-4" />
        </button>

        {/* Batch Logs Drawer */}
        <button
          type="button"
          onClick={onOpenLogs}
          className="w-9 h-9 flex items-center justify-center rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 transition-all relative"
          title={`Batch Logs (${productionLogsCount} submissions)`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          {productionLogsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      {/* Bottom Drawer Toggle */}
      <div className="w-full flex justify-center">
        <button
          type="button"
          onClick={onToggleDrawer}
          className="w-9 h-9 flex items-center justify-center rounded text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          title={isDrawerOpen ? 'Collapse Left Dock' : 'Expand Left Dock'}
        >
          {isDrawerOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};
