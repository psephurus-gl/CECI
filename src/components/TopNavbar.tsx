import React from 'react';
import {
  Send,
  Eye,
  GitBranch,
  Layers,
  Sliders,
  FileSpreadsheet,
  Cpu,
  Monitor,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Edit3,
  Moon,
} from 'lucide-react';
import {
  AppMode,
  BuilderSubMode,
  IsaHmiTheme,
  KIOSK_PRESETS,
  KioskPresetId,
  SiteProject,
} from '../types';

interface TopNavbarProps {
  project: SiteProject;
  mode: AppMode;
  isInspectorOpen: boolean;
  productionLogsCount: number;
  onOpenLogs: () => void;
  onSetMode: (mode: AppMode) => void;
  onToggleInspector: () => void;
  onPublishClick: () => void;
  onUpdateProjectName: (name: string) => void;
  onGoHome: () => void;

  // Integrated Canvas Controls
  builderMode: BuilderSubMode;
  onSetBuilderMode: (mode: BuilderSubMode) => void;
  kioskPresetId: KioskPresetId;
  onSetKioskPresetId: (presetId: KioskPresetId) => void;
  zoom: number;
  onSetZoom: (zoom: number) => void;
  onZoomToFit: () => void;
  currentTheme: IsaHmiTheme;
  onSetTheme: (theme: IsaHmiTheme) => void;
  onClearToBlankCanvas: () => void;
  onLoadCtcTemplate: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  project,
  mode,
  isInspectorOpen,
  productionLogsCount,
  onOpenLogs,
  onSetMode,
  onToggleInspector,
  onPublishClick,
  onUpdateProjectName,
  onGoHome,
  builderMode,
  onSetBuilderMode,
  kioskPresetId,
  onSetKioskPresetId,
  zoom,
  onSetZoom,
  onZoomToFit,
  currentTheme,
  onSetTheme,
  onClearToBlankCanvas,
  onLoadCtcTemplate,
}) => {
  const activePage =
    project.pages.find((p) => p.id === project.activePageId) || project.pages[0];
  const isDesignMode = builderMode === 'design';

  const handleZoomStep = (delta: number) => {
    const next = Math.min(2.0, Math.max(0.4, Math.round((zoom + delta) * 100) / 100));
    onSetZoom(next);
  };

  return (
    <header className="h-12 bg-[#0F1014] border-b border-stone-800/90 px-3 flex items-center justify-between select-none z-30 shrink-0 gap-3 shadow-xs">
      {/* 1. LEFT ZONE: Brand, Project Name & Active Station Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onGoHome}
            className="w-6 h-6 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0 transition-colors"
            title="Back to start page"
            aria-label="Back to start page"
          >
            <Cpu className="w-3.5 h-3.5" />
          </button>
          <input
            type="text"
            value={project.name}
            onChange={(e) => onUpdateProjectName(e.target.value)}
            className="bg-transparent text-xs font-bold text-stone-100 hover:bg-stone-800/80 focus:bg-stone-800 rounded px-1.5 py-0.5 outline-none max-w-[120px] md:max-w-[140px] truncate transition-colors"
            title="Click to rename MES project"
          />
        </div>

        {activePage && (
          <div className="hidden lg:flex items-center gap-1.5 text-stone-500 text-xs pl-1 border-l border-stone-800">
            <span className="font-semibold text-stone-300 text-[11px] truncate max-w-[130px]">
              {activePage.name}
            </span>
          </div>
        )}
      </div>

      {/* 2. CENTER ZONE: Streamlined Workspace View & Canvas Tools (Single Row) */}
      <div className="flex items-center gap-2 min-w-0 overflow-x-auto no-scrollbar">
        {/* Main Perspective Selector (Canvas / Topology / Live) */}
        <div className="flex items-center bg-stone-950 p-0.5 border border-stone-800/90 text-xs font-medium shrink-0">
          <button
            type="button"
            onClick={() => onSetMode('editor')}
            className={`flex items-center gap-1.5 px-2.5 py-1 transition-colors text-[11px] ${
              mode === 'editor'
                ? 'bg-stone-800 text-white font-bold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Interactive Studio Canvas"
          >
            <Layers className="w-3 h-3 text-blue-400" />
            <span className="hidden sm:inline">Canvas</span>
          </button>

          <button
            type="button"
            onClick={() => onSetMode('graph')}
            className={`flex items-center gap-1.5 px-2.5 py-1 transition-colors text-[11px] ${
              mode === 'graph'
                ? 'bg-stone-800 text-white font-bold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="HMI Navigation Graph Topology"
          >
            <GitBranch className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">Topology</span>
          </button>

          <button
            type="button"
            onClick={() => onSetMode('published')}
            className={`flex items-center gap-1.5 px-2.5 py-1 transition-colors text-[11px] ${
              mode === 'published'
                ? 'bg-stone-800 text-white font-bold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Live Fullscreen Operator Terminal"
          >
            <Eye className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Live Kiosk</span>
          </button>
        </div>

        {/* In-Canvas Context Controls (Only visible in Editor mode to keep everything uncluttered) */}
        {mode === 'editor' && (
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Design vs Operator Mode Switch */}
            <div className="flex items-center bg-stone-950 p-0.5 border border-stone-800/90 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => onSetBuilderMode('design')}
                className={`px-2 py-0.5 flex items-center gap-1 transition-colors ${
                  isDesignMode
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Design / Layout Mode"
              >
                <Edit3 className="w-3 h-3" />
                <span className="hidden md:inline">Design</span>
              </button>
              <button
                type="button"
                onClick={() => onSetBuilderMode('operator')}
                className={`px-2 py-0.5 flex items-center gap-1 transition-colors ${
                  !isDesignMode
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Test interactive operator entry"
              >
                <Eye className="w-3 h-3" />
                <span className="hidden md:inline">Test Run</span>
              </button>
            </div>

            {/* Display Resolution Preset Dropdown */}
            <div className="hidden md:flex items-center gap-1 bg-stone-950 px-2 py-1 border border-stone-800/90 text-[11px]">
              <Monitor className="w-3 h-3 text-stone-400 shrink-0" />
              <select
                value={kioskPresetId}
                onChange={(e) => onSetKioskPresetId(e.target.value as KioskPresetId)}
                className="bg-transparent text-stone-200 font-semibold outline-none cursor-pointer text-[11px]"
                title="Target touch display format"
              >
                {Object.values(KIOSK_PRESETS).map((p) => (
                  <option key={p.id} value={p.id} className="bg-stone-900 text-stone-200">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-stone-950 p-0.5 border border-stone-800/90 text-[11px]">
              <button
                type="button"
                onClick={() => handleZoomStep(-0.1)}
                className="p-1 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="px-1 font-mono text-[11px] text-stone-300 font-bold min-w-[34px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => handleZoomStep(0.1)}
                className="p-1 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <div className="h-3 w-px bg-stone-800 mx-0.5" />
              <button
                type="button"
                onClick={onZoomToFit}
                className="px-1.5 py-0.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 hover:bg-stone-800 transition-colors flex items-center gap-0.5"
                title="Fit artboard to screen"
              >
                <Maximize2 className="w-2.5 h-2.5" />
                <span>Fit</span>
              </button>
            </div>

            {/* Theme / Palette Quick Selector */}
            <div className="hidden xl:flex items-center bg-stone-950 p-0.5 border border-stone-800/90 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => onSetTheme('isa_slate_dark')}
                className={`px-2 py-0.5 flex items-center gap-1 transition-colors ${
                  currentTheme === 'isa_slate_dark'
                    ? 'bg-stone-800 text-white font-extrabold shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="Deep Dark Industrial Slate Theme"
              >
                <div className="w-2 h-2 rounded-full bg-[#18181B] border border-stone-500" />
                <span>Slate</span>
              </button>
              <button
                type="button"
                onClick={() => onSetTheme('isa_night_charcoal')}
                className={`px-2 py-0.5 flex items-center gap-1 transition-colors ${
                  currentTheme === 'isa_night_charcoal'
                    ? 'bg-stone-800 text-white font-extrabold shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="Night Charcoal Theme"
              >
                <Moon className="w-2.5 h-2.5 text-indigo-400" />
                <span>Night</span>
              </button>
            </div>

            {/* Canvas Quick Actions: Blank / CTC Template */}
            {isDesignMode && (
              <div className="hidden 2xl:flex items-center gap-1 pl-1">
                <button
                  type="button"
                  onClick={onClearToBlankCanvas}
                  className="px-2 py-1 text-[10px] font-bold text-stone-400 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 transition-colors"
                  title="Clear canvas to bare empty slate"
                >
                  Clear Blank
                </button>
                <button
                  type="button"
                  onClick={onLoadCtcTemplate}
                  className="px-2 py-1 text-[10px] font-bold text-blue-300 hover:text-white bg-blue-950/40 hover:bg-blue-900/60 border border-blue-900/80 transition-colors"
                  title="Reload CTC Auto Log station preset"
                >
                  Load CTC
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. RIGHT ZONE: Logs, Inspector Toggle & Publish */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Batch Logs Drawer Button */}
        <button
          type="button"
          onClick={onOpenLogs}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors text-[11px] font-medium"
          title="View recorded production batch logs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Logs</span>
          <span className="font-mono text-[10px] text-stone-400">({productionLogsCount})</span>
        </button>

        {/* Inspector Toggle */}
        <button
          type="button"
          onClick={onToggleInspector}
          className={`p-1.5 border transition-colors ${
            isInspectorOpen
              ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
              : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
          }`}
          title={isInspectorOpen ? 'Collapse Inspector Dock' : 'Open Inspector Dock'}
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Primary Deploy/Publish Button */}
        <button
          type="button"
          onClick={onPublishClick}
          className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all active:scale-95 shadow-xs"
        >
          <Send className="w-3 h-3" />
          <span>Publish</span>
        </button>
      </div>
    </header>
  );
};
