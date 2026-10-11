import React, { useRef } from 'react';
import {
  ComponentNode,
  Page,
  DeviceViewport,
  BuilderSubMode,
  IsaHmiTheme,
  KioskPresetId,
  KIOSK_PRESETS,
} from '../types';
import { ComponentRenderer } from './ComponentRenderer';
import { RotateCcw } from 'lucide-react';

interface CanvasProps {
  activePage: Page;
  pages: Page[];
  viewport: DeviceViewport;
  builderMode: BuilderSubMode;
  currentTheme: IsaHmiTheme;
  kioskPresetId?: KioskPresetId;
  zoom?: number;
  onSetTheme: (theme: IsaHmiTheme) => void;
  onSetBuilderMode: (mode: BuilderSubMode) => void;
  onSetViewport?: (viewport: DeviceViewport) => void;
  onSetKioskPresetId?: (presetId: KioskPresetId) => void;
  onSetZoom?: (zoom: number) => void;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string, e?: React.MouseEvent) => void;
  onUpdateNodeProps: (nodeId: string, newProps: any) => void;
  onUpdateNodeStyle: (nodeId: string, newStyle: any) => void;
  onNavigate: (pageId: string) => void;
  onActionTrigger: (actionType: string, meta?: any) => void;
  onDropChild: (targetContainerId: string, templateTitle: string) => void;
  onDuplicateNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onMoveNode?: (nodeId: string, direction: 'up' | 'down') => void;
  onRepositionNode?: (sourceId: string, targetContainerId: string, targetIndex?: number) => void;
  runtimeValues: Record<string, any>;
  onRuntimeValueChange: (nodeId: string, value: any) => void;
  onResetRuntimeValues: () => void;
  onClearToBlankCanvas: () => void;
  onLoadCtcTemplate: () => void;
  workbenchContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export const Canvas: React.FC<CanvasProps> = ({
  activePage,
  pages,
  viewport,
  builderMode,
  currentTheme,
  kioskPresetId = '1280x800',
  zoom = 1,
  onSetTheme,
  onSetBuilderMode,
  onSetViewport,
  onSetKioskPresetId,
  onSetZoom,
  selectedNodeId,
  onSelectNode,
  onUpdateNodeProps,
  onUpdateNodeStyle,
  onNavigate,
  onActionTrigger,
  onDropChild,
  onDuplicateNode,
  onDeleteNode,
  onMoveNode,
  onRepositionNode,
  runtimeValues,
  onRuntimeValueChange,
  onResetRuntimeValues,
  onClearToBlankCanvas,
  onLoadCtcTemplate,
  workbenchContainerRef: externalWorkbenchRef,
}) => {
  const isDesignMode = builderMode === 'design';
  const localWorkbenchRef = useRef<HTMLDivElement>(null);
  const containerRef = externalWorkbenchRef || localWorkbenchRef;

  // Active kiosk preset
  const preset = KIOSK_PRESETS[kioskPresetId] || KIOSK_PRESETS['1280x800'];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18181B] overflow-hidden select-none relative">
      {/* Test Operator Mode Reset Notification Bar */}
      {!isDesignMode && (
        <div className="h-8 px-4 bg-rose-950/60 border-b border-rose-900/60 flex items-center justify-between text-xs shrink-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-semibold text-rose-200 text-[11px]">
              Interactive Test Mode Active — Inputs update in live operator runtime
            </span>
          </div>
          <button
            type="button"
            onClick={onResetRuntimeValues}
            className="px-2 py-0.5 text-[10px] font-bold text-rose-200 hover:text-white bg-rose-900/50 hover:bg-rose-800/80 border border-rose-700/60 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset Fields</span>
          </button>
        </div>
      )}

      {/* Main Kiosk Canvas Workbench Viewport - Clean Deep Slate Industrial Dark Grid */}
      <div
        ref={containerRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onSelectNode(activePage.rootNode.id);
          }
        }}
        className="flex-1 overflow-auto bg-[#18181B] bg-[radial-gradient(#27272A_1px,transparent_1px)] [background-size:24px_24px] p-6 sm:p-10 flex items-start justify-center relative cursor-default"
      >
        {/* Scaled Bounding Wrapper: Reserves exact footprint so scrollbars work naturally */}
        <div
          style={{
            width: `${preset.width * zoom}px`,
            minHeight: `${preset.height * zoom}px`,
          }}
          className="shrink-0 flex items-start justify-center transition-all duration-150"
        >
          {/* Fixed-Dimension Artboard Container: Width NEVER squeezes, scale handles zoom */}
          <div
            style={{
              width: `${preset.width}px`,
              minHeight: `${preset.height}px`,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
            className="shrink-0 flex flex-col bg-[#18181B] border border-stone-800/90 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85)] ring-1 ring-white/5"
          >
            {/* Artboard Frame Header Bar (Clean Minimal Slate) */}
            <div
              onClick={() => onSelectNode(activePage.rootNode.id)}
              className="h-7 bg-[#121316] px-3 border-b border-stone-800 text-[10px] flex items-center justify-between text-stone-400 select-none cursor-pointer hover:bg-stone-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-stone-200 tracking-wide uppercase">
                  {activePage.name}
                </span>
                <span className="text-stone-600">•</span>
                <span className="font-mono text-stone-400">
                  {preset.width} × {preset.height} px ({preset.aspectRatio})
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[9px] text-stone-400">
                <span className="bg-stone-900 px-1.5 py-0.5 border border-stone-800 text-stone-300">
                  Fixed Artboard
                </span>
                <span>Zoom: {Math.round(zoom * 100)}%</span>
              </div>
            </div>

            {/* Rendered MES Root Node Content */}
            <div className="flex-1 flex flex-col min-h-0">
              <ComponentRenderer
                node={activePage.rootNode}
                pages={pages}
                currentPageId={activePage.id}
                isDesignMode={isDesignMode}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
                onUpdateNodeProps={onUpdateNodeProps}
                onUpdateNodeStyle={onUpdateNodeStyle}
                onNavigate={onNavigate}
                onActionTrigger={onActionTrigger}
                onDropChild={onDropChild}
                onDuplicateNode={onDuplicateNode}
                onDeleteNode={onDeleteNode}
                onMoveNode={onMoveNode}
                onRepositionNode={onRepositionNode}
                runtimeValues={runtimeValues}
                onRuntimeValueChange={onRuntimeValueChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
