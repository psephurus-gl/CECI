import React, { useState } from 'react';
import {
  ComponentNode,
  Page,
  ComponentStyle,
} from '../types';
import { getNodePath } from '../utils/componentTreeUtils';
import {
  Sliders,
  PanelRightClose,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  LayoutGrid,
  Rows,
  Columns,
  Square,
  Type,
  Gauge,
  CircleDot,
  SquareMousePointer,
  Check,
} from 'lucide-react';

interface InspectorPanelProps {
  rootNode: ComponentNode;
  selectedNode: ComponentNode | null;
  pages: Page[];
  onSelectNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, updates: Partial<ComponentNode>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onMoveNode: (nodeId: string, direction: 'up' | 'down') => void;
  onClose: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  rootNode,
  selectedNode,
  pages,
  onSelectNode,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onMoveNode,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'props' | 'layout' | 'appearance'>('props');

  if (!selectedNode) {
    return (
      <div className="w-full h-full bg-stone-900 text-stone-400 text-xs flex flex-col justify-between select-none">
        <div className="flex items-center justify-between p-3 border-b border-stone-800">
          <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">HMI Inspector</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800"
            title="Collapse Inspector"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center text-center p-6">
          <Sliders className="w-8 h-8 text-stone-600 mb-3 opacity-60" />
          <h3 className="font-bold text-stone-300 text-xs mb-1">No Element Selected</h3>
          <p className="text-[11px] text-stone-500 leading-relaxed max-w-[220px]">
            Click any bare input, button, or title on the canvas to configure labels, heights, colors, and borders.
          </p>
        </div>

        <div className="text-[10px] text-stone-500 text-center p-2 font-mono border-t border-stone-800">
          ISA-101 High-Performance HMI Controls
        </div>
      </div>
    );
  }

  const p = selectedNode.props || {};
  const s = selectedNode.style || {};
  const isRoot = selectedNode.id === rootNode.id;
  const path = getNodePath(rootNode, selectedNode.id);

  const updateProp = (key: string, val: any) => {
    onUpdateNode(selectedNode.id, {
      props: {
        ...p,
        [key]: val,
      },
    });
  };

  const updateStyle = (key: keyof ComponentStyle, val: any) => {
    onUpdateNode(selectedNode.id, {
      style: {
        ...s,
        [key]: val,
      },
    });
  };

  return (
    <div className="w-full h-full bg-stone-900 text-stone-200 flex flex-col justify-between select-none font-sans">
      {/* Top Header & Breadcrumbs */}
      <div>
        <div className="px-3 py-2.5 border-b border-stone-800 flex items-center justify-between gap-2">
          {/* Breadcrumb Trail */}
          <div className="flex items-center gap-1 overflow-x-auto text-[10px] text-stone-400 font-mono py-0.5">
            {path.map((item, idx) => (
              <React.Fragment key={item.id}>
                {idx > 0 && <span className="text-stone-600">/</span>}
                <button
                  type="button"
                  onClick={() => onSelectNode(item.id)}
                  className={`truncate max-w-[80px] hover:text-white transition-colors ${
                    item.id === selectedNode.id ? 'text-blue-400 font-bold' : ''
                  }`}
                  title={item.name}
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-0.5 shrink-0">
            {!isRoot && (
              <>
                <button
                  type="button"
                  onClick={() => onMoveNode(selectedNode.id, 'up')}
                  className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveNode(selectedNode.id, 'down')}
                  className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicateNode(selectedNode.id)}
                  className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                  title="Duplicate Component"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteNode(selectedNode.id)}
                  className="p-1 rounded text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
                  title="Delete Component"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors ml-1"
              title="Close Inspector"
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Component Name Bar */}
        <div className="px-3 py-2 border-b border-stone-800 bg-stone-950 flex items-center justify-between gap-2">
          <input
            type="text"
            value={selectedNode.name}
            onChange={(e) => onUpdateNode(selectedNode.id, { name: e.target.value })}
            className="text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-stone-700 focus:border-blue-500 outline-none w-full truncate"
          />
          <span className="text-[9px] font-mono uppercase text-stone-300 bg-stone-800 px-1.5 py-0.5 rounded-none border border-stone-700 shrink-0 font-bold">
            {selectedNode.type}
          </span>
        </div>

        {/* Section Tabs */}
        <div className="grid grid-cols-3 border-b border-stone-800 text-[11px] font-semibold text-stone-400">
          <button
            type="button"
            onClick={() => setActiveSection('props')}
            className={`py-2 text-center transition-colors border-b-2 ${
              activeSection === 'props'
                ? 'text-white border-blue-500 bg-stone-800/40 font-bold'
                : 'border-transparent hover:text-stone-200'
            }`}
          >
            Properties
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('layout')}
            className={`py-2 text-center transition-colors border-b-2 ${
              activeSection === 'layout'
                ? 'text-white border-blue-500 bg-stone-800/40 font-bold'
                : 'border-transparent hover:text-stone-200'
            }`}
          >
            Layout
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('appearance')}
            className={`py-2 text-center transition-colors border-b-2 ${
              activeSection === 'appearance'
                ? 'text-white border-blue-500 bg-stone-800/40 font-bold'
                : 'border-transparent hover:text-stone-200'
            }`}
          >
            Style
          </button>
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {/* --- 1. COMPONENT-SPECIFIC PROPERTIES --- */}
        {activeSection === 'props' && (
          <div className="space-y-3">
            {/* INPUT COMPONENT PROPS */}
            {selectedNode.type === 'input' && (
              <div className="space-y-2.5">
                {/* Bare Input Toggle */}
                <div className="p-2.5 bg-stone-950 rounded-sm border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Label Visibility</span>
                      <span className="text-[10px] text-stone-400">Toggle for bare unadorned input</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.showLabel ?? false}
                        onChange={(e) => updateProp('showLabel', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>

                  {p.showLabel && (
                    <div>
                      <label className="block text-[10px] text-stone-400 mb-1">Parameter Label Text</label>
                      <input
                        type="text"
                        value={p.label || ''}
                        onChange={(e) => updateProp('label', e.target.value)}
                        placeholder="Label text..."
                        className="w-full px-2 py-1 bg-stone-900 border border-stone-800 rounded-none text-xs text-white outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Sizing & Glove Touch Target Height */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-stone-400 mb-1 font-semibold">Touch Height</label>
                    <select
                      value={p.inputHeight || 56}
                      onChange={(e) => updateProp('inputHeight', Number(e.target.value))}
                      className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white font-mono outline-none"
                    >
                      <option value={44}>44px (Compact)</option>
                      <option value={56}>56px (Standard HMI)</option>
                      <option value={64}>64px (Glove Touch)</option>
                      <option value={80}>80px (Kiosk Giant)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-400 mb-1 font-semibold">Font Size</label>
                    <select
                      value={p.fontSize || '2xl'}
                      onChange={(e) => updateProp('fontSize', e.target.value)}
                      className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none"
                    >
                      <option value="base">Base (16px)</option>
                      <option value="lg">LG (18px)</option>
                      <option value="xl">XL (20px)</option>
                      <option value="2xl">2XL (24px)</option>
                      <option value="3xl">3XL (30px)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-stone-400 mb-1 font-semibold">Text Alignment</label>
                    <select
                      value={p.textAlign || 'center'}
                      onChange={(e) => updateProp('textAlign', e.target.value)}
                      className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none"
                    >
                      <option value="center">Center</option>
                      <option value="left">Left</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-400 mb-1 font-semibold">Auto-Focus</label>
                    <select
                      value={p.autoFocus ? 'yes' : 'no'}
                      onChange={(e) => updateProp('autoFocus', e.target.value === 'yes')}
                      className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none"
                    >
                      <option value="yes">Yes (Barcode Gun)</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                {/* Placeholder & Subtitle Note */}
                <div>
                  <label className="block text-[10px] text-stone-400 mb-1">Placeholder (optional)</label>
                  <input
                    type="text"
                    value={p.placeholder || ''}
                    onChange={(e) => updateProp('placeholder', e.target.value)}
                    placeholder="Leave empty for pure blank"
                    className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-stone-400 mb-1">Instruction Subtitle (below input)</label>
                  <input
                    type="text"
                    value={p.helpText || ''}
                    onChange={(e) => updateProp('helpText', e.target.value)}
                    placeholder="e.g. สแกนบัตรพนักงานเพื่อเข้าใช้งาน"
                    className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* BUTTON COMPONENT PROPS */}
            {selectedNode.type === 'button' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] text-stone-400 mb-1">Button Label</label>
                  <input
                    type="text"
                    value={p.label || ''}
                    onChange={(e) => updateProp('label', e.target.value)}
                    className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white font-bold outline-none uppercase"
                  />
                </div>

                {/* Standardized ISA-101 Functional Safety Schemes */}
                <div>
                  <label className="block text-[10px] text-stone-400 mb-1 font-semibold">
                    ISA-101 Functional Color
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateProp('colorScheme', 'red_danger')}
                      className={`p-2 text-left font-bold rounded-none border text-[11px] flex items-center justify-between ${
                        (p.colorScheme || 'red_danger') === 'red_danger'
                          ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-400'
                          : 'bg-stone-950 text-red-400 border-stone-800'
                      }`}
                    >
                      <span>🟥 RED (Exit / Stop)</span>
                      {(p.colorScheme || 'red_danger') === 'red_danger' && <Check className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => updateProp('colorScheme', 'blue_action')}
                      className={`p-2 text-left font-bold rounded-none border text-[11px] flex items-center justify-between ${
                        p.colorScheme === 'blue_action'
                          ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400'
                          : 'bg-stone-950 text-blue-400 border-stone-800'
                      }`}
                    >
                      <span>🟦 BLUE (Prompt)</span>
                      {p.colorScheme === 'blue_action' && <Check className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => updateProp('colorScheme', 'gray_neutral')}
                      className={`p-2 text-left font-bold rounded-none border text-[11px] flex items-center justify-between ${
                        p.colorScheme === 'gray_neutral'
                          ? 'bg-stone-700 text-white border-stone-600 ring-2 ring-stone-400'
                          : 'bg-stone-950 text-stone-400 border-stone-800'
                      }`}
                    >
                      <span>⬜ GRAY (Routine)</span>
                      {p.colorScheme === 'gray_neutral' && <Check className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => updateProp('colorScheme', 'amber_warn')}
                      className={`p-2 text-left font-bold rounded-none border text-[11px] flex items-center justify-between ${
                        p.colorScheme === 'amber_warn'
                          ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-400'
                          : 'bg-stone-950 text-amber-400 border-stone-800'
                      }`}
                    >
                      <span>🟨 AMBER (Hold)</span>
                      {p.colorScheme === 'amber_warn' && <Check className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-stone-400 mb-1">Action Trigger</label>
                  <select
                    value={p.actionType || 'exit'}
                    onChange={(e) => updateProp('actionType', e.target.value)}
                    className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none"
                  >
                    <option value="exit">Exit Kiosk / Station</option>
                    <option value="submit_log">Submit & Advance Work Order</option>
                    <option value="navigate">Navigate to Linked Station</option>
                    <option value="clear_inputs">Clear Input Field</option>
                  </select>
                </div>

                {p.actionType === 'navigate' && (
                  <div>
                    <label className="block text-[10px] text-stone-400 mb-1">Destination Station</label>
                    <select
                      value={p.targetPageId || ''}
                      onChange={(e) => updateProp('targetPageId', e.target.value)}
                      className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none"
                    >
                      <option value="">-- Select Station --</option>
                      {pages.map((pg) => (
                        <option key={pg.id} value={pg.id}>
                          {pg.name} (/{pg.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* TEXT COMPONENT PROPS */}
            {selectedNode.type === 'text' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] text-stone-400 mb-1">Text Content</label>
                  <textarea
                    rows={2}
                    value={p.content || ''}
                    onChange={(e) => updateProp('content', e.target.value)}
                    className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white font-bold outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-stone-400 mb-1">Font Size</label>
                    <select
                      value={s.fontSize || 'xl'}
                      onChange={(e) => updateStyle('fontSize', e.target.value)}
                      className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none"
                    >
                      <option value="xs">XS (12px)</option>
                      <option value="sm">SM (14px - Corner Tag)</option>
                      <option value="base">Base (16px - Instruction)</option>
                      <option value="xl">XL (20px)</option>
                      <option value="2xl">2XL (24px)</option>
                      <option value="3xl">3XL (36px - Title)</option>
                      <option value="4xl">4XL (48px - Giant)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-400 mb-1">Text Alignment</label>
                    <select
                      value={s.textAlign || 'left'}
                      onChange={(e) => updateStyle('textAlign', e.target.value)}
                      className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none"
                    >
                      <option value="center">Center</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-stone-400 mb-1">Text Color</label>
                  <select
                    value={s.textColor || '#FFFFFF'}
                    onChange={(e) => updateStyle('textColor', e.target.value)}
                    className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none"
                  >
                    <option value="#FFFFFF">Pure White (#FFFFFF - High Contrast)</option>
                    <option value="#CBD5E1">Muted Slate (#CBD5E1)</option>
                    <option value="#94A3B8">Muted Gray (#94A3B8)</option>
                    <option value="#DC2626">Safety Red (#DC2626)</option>
                    <option value="#D97706">Amber Yellow (#D97706)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- 2. LAYOUT / FRAMES --- */}
        {activeSection === 'layout' && (
          <div className="space-y-3">
            {selectedNode.type === 'container' ? (
              <>
                <div>
                  <label className="block text-[10px] text-stone-400 mb-1">Layout Mode</label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        updateStyle('display', 'flex');
                        updateStyle('flexDirection', 'column');
                      }}
                      className={`py-1.5 px-2 rounded-none text-[11px] font-bold transition-colors ${
                        s.flexDirection !== 'row' && s.display !== 'grid'
                          ? 'bg-blue-600 text-white'
                          : 'bg-stone-950 text-stone-400 hover:bg-stone-800'
                      }`}
                    >
                      Column Stack
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateStyle('display', 'flex');
                        updateStyle('flexDirection', 'row');
                      }}
                      className={`py-1.5 px-2 rounded-none text-[11px] font-bold transition-colors ${
                        s.flexDirection === 'row'
                          ? 'bg-blue-600 text-white'
                          : 'bg-stone-950 text-stone-400 hover:bg-stone-800'
                      }`}
                    >
                      Row Bar
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateStyle('display', 'grid');
                        if (!s.gridCols) updateStyle('gridCols', 2);
                      }}
                      className={`py-1.5 px-2 rounded-none text-[11px] font-bold transition-colors ${
                        s.display === 'grid'
                          ? 'bg-blue-600 text-white'
                          : 'bg-stone-950 text-stone-400 hover:bg-stone-800'
                      }`}
                    >
                      Grid
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-stone-400 mb-1">Justify</label>
                    <select
                      value={s.justifyContent || 'center'}
                      onChange={(e) => updateStyle('justifyContent', e.target.value)}
                      className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none"
                    >
                      <option value="center">Center</option>
                      <option value="between">Space Between (Corners)</option>
                      <option value="start">Start (Top/Left)</option>
                      <option value="end">End (Bottom/Right)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-400 mb-1">Child Spacing</label>
                    <select
                      value={s.gap ?? 4}
                      onChange={(e) => updateStyle('gap', Number(e.target.value))}
                      className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none"
                    >
                      <option value={0}>0px</option>
                      <option value={2}>8px</option>
                      <option value={3}>12px</option>
                      <option value={4}>16px</option>
                      <option value={6}>24px</option>
                      <option value={8}>32px</option>
                    </select>
                  </div>
                </div>
              </>
            ) : null}

            <div>
              <label className="block text-[10px] text-stone-400 mb-1">Container Width</label>
              <select
                value={s.width || 'full'}
                onChange={(e) => updateStyle('width', e.target.value)}
                className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none"
              >
                <option value="full">Full Width (100%)</option>
                <option value="half">Half Width (50%)</option>
                <option value="third">One Third (33%)</option>
                <option value="auto">Auto / Compact</option>
              </select>
            </div>
          </div>
        )}

        {/* --- 3. APPEARANCE & BORDERS --- */}
        {activeSection === 'appearance' && (
          <div className="space-y-3">
            {/* Border Width (Heavy Solid Borders for Factory Touchscreens) */}
            <div>
              <label className="block text-[10px] text-stone-400 mb-1 font-semibold">Border Thickness</label>
              <div className="grid grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      if (selectedNode.type === 'input') updateProp('borderWidth', b);
                      else updateStyle('borderWidth', b);
                    }}
                    className={`py-1 text-xs font-mono font-bold transition-colors ${
                      (selectedNode.type === 'input' ? p.borderWidth : s.borderWidth) === b
                        ? 'bg-blue-600 text-white'
                        : 'bg-stone-950 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    {b}px
                  </button>
                ))}
              </div>
            </div>

            {/* Border Color */}
            <div>
              <label className="block text-[10px] text-stone-400 mb-1 font-semibold">Border Color</label>
              <select
                value={selectedNode.type === 'input' ? (p.borderColor || '#000000') : (s.borderColor || '#000000')}
                onChange={(e) => {
                  if (selectedNode.type === 'input') updateProp('borderColor', e.target.value);
                  else updateStyle('borderColor', e.target.value);
                }}
                className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none font-mono"
              >
                <option value="#000000">Solid Black (#000000 - High Contrast)</option>
                <option value="#374151">Charcoal Slate (#374151)</option>
                <option value="#FFFFFF">Crisp White (#FFFFFF)</option>
                <option value="#DC2626">Safety Red (#DC2626)</option>
                <option value="#2563EB">Prompt Blue (#2563EB)</option>
              </select>
            </div>

            {/* Background Fill */}
            <div>
              <label className="block text-[10px] text-stone-400 mb-1 font-semibold">Background Fill</label>
              <select
                value={selectedNode.type === 'input' ? (p.backgroundColor || '#FFFFFF') : (s.backgroundColor || 'transparent')}
                onChange={(e) => {
                  if (selectedNode.type === 'input') updateProp('backgroundColor', e.target.value);
                  else updateStyle('backgroundColor', e.target.value);
                }}
                className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded-none text-xs text-white outline-none font-mono"
              >
                <option value="#FFFFFF">Pure White (#FFFFFF - Bare Input)</option>
                <option value="transparent">Transparent (None)</option>
                <option value="#18181B">Dark Slate (#18181B - Industrial)</option>
                <option value="#374151">Dark Charcoal (#374151)</option>
                <option value="#71717A">Legacy Gray (#71717A)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-3 py-2 border-t border-stone-800 text-[10px] font-mono text-stone-400 flex items-center justify-between">
        <span>ISA-101 HMI</span>
        <span>ID: {selectedNode.id.slice(0, 8)}</span>
      </div>
    </div>
  );
};
