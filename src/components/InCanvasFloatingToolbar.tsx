import React, { useState, useRef, useEffect } from 'react';
import {
  ComponentNode,
} from '../types';
import { COMPONENT_PRIMITIVES } from '../data/componentLibrary';
import {
  Rows,
  Columns,
  LayoutGrid,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  Layers,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react';

interface InCanvasFloatingToolbarProps {
  node: ComponentNode;
  parentId: string | null;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onSelectNode: (nodeId: string, e?: React.MouseEvent) => void;
  onUpdateProps: (nodeId: string, newProps: any) => void;
  onUpdateStyle: (nodeId: string, newStyle: any) => void;
  onDropChild: (targetContainerId: string, templateTitle: string) => void;
  onDuplicateNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onMoveNode?: (nodeId: string, direction: 'up' | 'down') => void;
}

export const InCanvasFloatingToolbar: React.FC<InCanvasFloatingToolbarProps> = ({
  node,
  parentId,
  canMoveUp,
  canMoveDown,
  onSelectNode,
  onUpdateProps,
  onUpdateStyle,
  onDropChild,
  onDuplicateNode,
  onDeleteNode,
  onMoveNode,
}) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isSpacingMenuOpen, setIsSpacingMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setIsAddMenuOpen(false);
        setIsSpacingMenuOpen(false);
      }
    };
    if (isAddMenuOpen || isSpacingMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isAddMenuOpen, isSpacingMenuOpen]);

  const isContainer = node.type === 'container';
  const style = node.style || {};
  const props = node.props || {};

  const currentDisplay = style.display || 'flex';
  const currentDirection = style.flexDirection || 'column';
  const currentGridCols = style.gridCols || 2;
  const currentGap = style.gap !== undefined ? style.gap : 4;

  const handleSetLayoutMode = (mode: 'col' | 'row' | 'grid2' | 'grid3') => {
    if (mode === 'col') {
      onUpdateStyle(node.id, {
        ...style,
        display: 'flex',
        flexDirection: 'column',
      });
    } else if (mode === 'row') {
      onUpdateStyle(node.id, {
        ...style,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
      });
    } else if (mode === 'grid2') {
      onUpdateStyle(node.id, {
        ...style,
        display: 'grid',
        gridCols: 2,
      });
    } else if (mode === 'grid3') {
      onUpdateStyle(node.id, {
        ...style,
        display: 'grid',
        gridCols: 3,
      });
    }
  };

  const handleSelectPrimitive = (title: string) => {
    onDropChild(node.id, title);
    setIsAddMenuOpen(false);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute -top-11 left-0 z-30 flex items-center gap-1 bg-[#18181B] border border-stone-700/90 text-stone-200 px-1.5 py-1 shadow-2xl rounded-xs select-none font-sans text-xs"
    >
      {/* Drag Grip Handle */}
      <div
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData('application/x-mes-node-id', node.id);
          e.dataTransfer.setData('text/plain', node.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        className="flex items-center px-1 text-stone-400 hover:text-amber-400 cursor-grab active:cursor-grabbing border-r border-stone-800 transition-colors"
        title="Drag to reorder or move across frames"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Node Type Indicator Badge */}
      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-stone-900 border border-stone-800 text-[10px] font-mono text-stone-300 font-bold">
        <Layers className="w-3 h-3 text-blue-400" />
        <span className="truncate max-w-[100px]">{node.name}</span>
      </div>

      <div className="h-4 w-px bg-stone-800 mx-0.5" />

      {/* Container-Specific Controls */}
      {isContainer && (
        <>
          {/* Layout Mode Segmented Control: Col vs Row vs Grid */}
          <div className="flex items-center bg-stone-950 p-0.5 border border-stone-800 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => handleSetLayoutMode('col')}
              className={`px-2 py-0.5 flex items-center gap-1 transition-colors ${
                currentDisplay === 'flex' && currentDirection === 'column'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Flex Column (Vertical Stack)"
            >
              <Columns className="w-3 h-3" />
              <span>Col</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetLayoutMode('row')}
              className={`px-2 py-0.5 flex items-center gap-1 transition-colors ${
                currentDisplay === 'flex' && currentDirection === 'row'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Flex Row (Horizontal Row)"
            >
              <Rows className="w-3 h-3" />
              <span>Row</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetLayoutMode('grid2')}
              className={`px-2 py-0.5 flex items-center gap-1 transition-colors ${
                currentDisplay === 'grid' && currentGridCols === 2
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="2-Column Grid"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>2-Col</span>
            </button>
          </div>

          {/* Quick Add Component Popover */}
          <div className="relative" ref={addMenuRef}>
            <button
              type="button"
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs text-[11px]"
              title="Add component into this container"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {/* In-Canvas Component Inserter Menu */}
            {isAddMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-stone-900 border border-stone-700 shadow-2xl p-1.5 z-50 text-stone-200">
                <div className="px-2 py-1 text-[10px] font-mono text-stone-400 border-b border-stone-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Insert Component</span>
                  <span className="text-stone-500">Into {node.name}</span>
                </div>

                <div className="max-h-60 overflow-y-auto py-1 divide-y divide-stone-800/60">
                  {/* Category Groups */}
                  {['Bare Inputs', 'Safety Actions', 'ISA-101 Layouts', 'Text & Headers'].map((category) => {
                    const items = COMPONENT_PRIMITIVES.filter((t) => t.category === category);
                    if (items.length === 0) return null;

                    return (
                      <div key={category} className="py-1">
                        <div className="px-2 py-0.5 text-[9px] font-bold text-stone-400 uppercase">
                          {category}
                        </div>
                        {items.map((item) => (
                          <button
                            key={item.title}
                            type="button"
                            onClick={() => handleSelectPrimitive(item.title)}
                            className="w-full text-left px-2 py-1 text-xs hover:bg-stone-800 flex items-center gap-2 group transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-60 group-hover:opacity-100" />
                            <span className="font-semibold text-stone-200 group-hover:text-white truncate">
                              {item.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Spacing & Gap Presets */}
          <div className="flex items-center bg-stone-950 px-1.5 py-0.5 border border-stone-800 text-[10px] gap-1">
            <span className="text-stone-500 font-mono">Gap:</span>
            {[2, 4, 6].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onUpdateStyle(node.id, { ...style, gap: g })}
                className={`px-1 py-0.5 font-mono ${
                  currentGap === g ? 'bg-stone-700 text-white font-bold' : 'text-stone-400 hover:text-white'
                }`}
                title={`Set gap to ${g * 4}px`}
              >
                {g * 4}px
              </button>
            ))}
          </div>
        </>
      )}

      {/* Input-Specific Controls */}
      {node.type === 'input' && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onUpdateProps(node.id, { ...props, showLabel: !props.showLabel })}
            className={`px-2 py-0.5 text-[10px] font-bold border transition-colors ${
              props.showLabel
                ? 'bg-stone-800 text-white border-stone-600'
                : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
            }`}
            title="Toggle Label visibility"
          >
            Label: {props.showLabel ? 'ON' : 'OFF'}
          </button>

          {/* Glove Touch Height */}
          <div className="flex items-center bg-stone-950 p-0.5 border border-stone-800 text-[10px]">
            {[48, 64, 80].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => onUpdateProps(node.id, { ...props, inputHeight: h })}
                className={`px-1.5 py-0.5 font-mono ${
                  props.inputHeight === h
                    ? 'bg-stone-700 text-white font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
                title={`Set glove height ${h}px`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Button-Specific Controls */}
      {node.type === 'button' && (
        <div className="flex items-center bg-stone-950 p-0.5 border border-stone-800 text-[10px]">
          {['solid', 'outline', 'danger'].map((variant) => (
            <button
              key={variant}
              type="button"
              onClick={() => onUpdateProps(node.id, { ...props, variant })}
              className={`px-1.5 py-0.5 capitalize ${
                props.variant === variant
                  ? 'bg-stone-700 text-white font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      )}

      <div className="h-4 w-px bg-stone-800 mx-0.5" />

      {/* Hierarchy & Manipulation Actions */}
      {parentId && (
        <button
          type="button"
          onClick={(e) => onSelectNode(parentId, e)}
          className="p-1 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          title="Select Parent Container (Esc / Up)"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      )}

      {/* 1-Click Move Up and Move Down buttons */}
      {onMoveNode && parentId && (
        <div className="flex items-center bg-stone-950 border border-stone-800 p-0.5 text-[10px] gap-0.5">
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={() => onMoveNode(node.id, 'up')}
            className={`p-1 rounded-xs transition-colors ${
              canMoveUp
                ? 'hover:bg-stone-800 text-stone-300 hover:text-white'
                : 'text-stone-600 cursor-not-allowed opacity-30'
            }`}
            title="Move Up (Alt + ↑)"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={() => onMoveNode(node.id, 'down')}
            className={`p-1 rounded-xs transition-colors ${
              canMoveDown
                ? 'hover:bg-stone-800 text-stone-300 hover:text-white'
                : 'text-stone-600 cursor-not-allowed opacity-30'
            }`}
            title="Move Down (Alt + ↓)"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {onDuplicateNode && (
        <button
          type="button"
          onClick={() => onDuplicateNode(node.id)}
          className="p-1 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          title="Duplicate Component"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}

      {onDeleteNode && parentId && (
        <button
          type="button"
          onClick={() => onDeleteNode(node.id)}
          className="p-1 hover:bg-rose-950/80 text-rose-400 hover:text-rose-200 transition-colors"
          title="Delete Component"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
