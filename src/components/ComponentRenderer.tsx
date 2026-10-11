import React, { useState, useEffect, useRef } from 'react';
import {
  ComponentNode,
  Page,
  ComponentStyle,
} from '../types';
import {
  ArrowRight,
  Check,
  AlertTriangle,
  Barcode,
  Layers,
  Plus,
  LogOut,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import { InCanvasFloatingToolbar } from './InCanvasFloatingToolbar';

interface ComponentRendererProps {
  node: ComponentNode;
  parentId?: string | null;
  indexInParent?: number;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  pages: Page[];
  currentPageId: string;
  isDesignMode: boolean;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string, e?: React.MouseEvent) => void;
  onUpdateNodeProps: (nodeId: string, newProps: any) => void;
  onUpdateNodeStyle: (nodeId: string, newStyle: any) => void;
  onNavigate: (pageId: string) => void;
  onActionTrigger: (actionType: string, meta?: any) => void;
  onDropChild?: (targetContainerId: string, templateType: string) => void;
  onDuplicateNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onMoveNode?: (nodeId: string, direction: 'up' | 'down') => void;
  onRepositionNode?: (sourceId: string, targetContainerId: string, targetIndex?: number) => void;
  runtimeValues: Record<string, any>;
  onRuntimeValueChange: (nodeId: string, value: any) => void;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  node,
  parentId = null,
  indexInParent = 0,
  canMoveUp = false,
  canMoveDown = false,
  pages,
  currentPageId,
  isDesignMode,
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
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDraggingThis, setIsDraggingThis] = useState(false);
  const [siblingDropIndicator, setSiblingDropIndicator] = useState<'before' | 'after' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSelected = selectedNodeId === node.id;
  const p = node.props || {};
  const s: ComponentStyle = node.style || {};

  // Auto-focus barcode input when entering Operator mode
  useEffect(() => {
    if (!isDesignMode && node.type === 'input' && p.autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDesignMode, node.type, p.autoFocus]);

  const handleSelect = (e: React.MouseEvent) => {
    if (!isDesignMode) return;
    e.stopPropagation();
    onSelectNode(node.id, e);
  };

  // Dragging this component
  const handleDragStart = (e: React.DragEvent) => {
    if (!isDesignMode || !parentId) return;
    e.stopPropagation();
    e.dataTransfer.setData('application/x-mes-node-id', node.id);
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDraggingThis(true);
  };

  const handleDragEnd = () => {
    setIsDraggingThis(false);
    setSiblingDropIndicator(null);
  };

  // Drag over this component as a sibling drop position
  const handleSiblingDragOver = (e: React.DragEvent) => {
    if (!isDesignMode || !parentId) return;
    const types = Array.from(e.dataTransfer.types);
    if (types.includes('application/x-mes-node-id')) {
      e.preventDefault();
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const isTopOrLeft =
        e.clientY - rect.top < rect.height / 2;
      setSiblingDropIndicator(isTopOrLeft ? 'before' : 'after');
    }
  };

  const handleSiblingDragLeave = (e: React.DragEvent) => {
    if (!isDesignMode || !parentId) return;
    e.preventDefault();
    e.stopPropagation();
    setSiblingDropIndicator(null);
  };

  const handleSiblingDrop = (e: React.DragEvent) => {
    if (!isDesignMode || !parentId) return;
    const sourceNodeId = e.dataTransfer.getData('application/x-mes-node-id');
    if (sourceNodeId && sourceNodeId !== node.id && onRepositionNode) {
      e.preventDefault();
      e.stopPropagation();
      const targetIndex = siblingDropIndicator === 'before' ? indexInParent : indexInParent + 1;
      onRepositionNode(sourceNodeId, parentId, targetIndex);
    }
    setSiblingDropIndicator(null);
  };

  // Container specific drag and drop
  const handleContainerDragOver = (e: React.DragEvent) => {
    if (!isDesignMode || node.type !== 'container') return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
    if (!isDesignMode || node.type !== 'container') return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    if (!isDesignMode || node.type !== 'container') return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // 1. Check if moving existing node into container
    const movedNodeId = e.dataTransfer.getData('application/x-mes-node-id');
    if (movedNodeId && movedNodeId !== node.id && onRepositionNode) {
      onRepositionNode(movedNodeId, node.id);
      return;
    }

    // 2. Check if adding primitive template
    const templateTitle = e.dataTransfer.getData('application/x-mes-primitive');
    if (templateTitle && onDropChild) {
      onDropChild(node.id, templateTitle);
    }
  };

  // Helper classes for container
  const getContainerClasses = () => {
    const classes = ['relative transition-all'];

    // Display & Direction
    if (s.display === 'grid') {
      classes.push('grid');
      if (s.gridCols === 1) classes.push('grid-cols-1');
      else if (s.gridCols === 2) classes.push('grid-cols-1 sm:grid-cols-2');
      else if (s.gridCols === 3) classes.push('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3');
      else if (s.gridCols === 4) classes.push('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4');
      else classes.push('grid-cols-1 sm:grid-cols-2');
    } else {
      classes.push('flex');
      if (s.flexDirection === 'row') classes.push('flex-row');
      else classes.push('flex-col');
    }

    // Align & Justify
    if (s.alignItems === 'center') classes.push('items-center');
    else if (s.alignItems === 'start') classes.push('items-start');
    else if (s.alignItems === 'end') classes.push('items-end');
    else classes.push('items-stretch');

    if (s.justifyContent === 'center') classes.push('justify-center');
    else if (s.justifyContent === 'between') classes.push('justify-between');
    else if (s.justifyContent === 'around') classes.push('justify-around');
    else if (s.justifyContent === 'end') classes.push('justify-end');
    else classes.push('justify-start');

    // Gap
    const gapMap: Record<number, string> = {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
    };
    classes.push(gapMap[s.gap ?? 4] || 'gap-4');

    // Padding
    const padMap: Record<number, string> = {
      0: 'p-0',
      1: 'p-1',
      2: 'p-2',
      3: 'p-3',
      4: 'p-4',
      6: 'p-6',
      8: 'p-8',
    };
    classes.push(padMap[s.padding ?? 4] || 'p-4');

    // Width
    if (s.width === 'auto') classes.push('w-auto');
    else if (s.width === 'half') classes.push('w-full sm:w-1/2');
    else if (s.width === 'third') classes.push('w-full sm:w-1/3');
    else if (s.width === 'two-thirds') classes.push('w-full sm:w-2/3');
    else classes.push('w-full');

    // Design mode highlight borders
    if (isDesignMode) {
      if (isSelected) {
        classes.push('ring-2 ring-blue-500 ring-offset-1 ring-offset-stone-900 z-20');
      } else if (isDragOver) {
        classes.push('ring-2 ring-emerald-500 bg-emerald-950/20');
      } else {
        classes.push('hover:outline hover:outline-1 hover:outline-blue-400/50');
      }
    }

    if (isDraggingThis) {
      classes.push('opacity-40 scale-[0.99]');
    }

    return classes.join(' ');
  };

  const getContainerInlineStyle = () => {
    const inline: React.CSSProperties = {};
    if (s.backgroundColor) inline.backgroundColor = s.backgroundColor;
    if (s.borderColor) inline.borderColor = s.borderColor;
    if (s.borderWidth !== undefined) inline.borderWidth = `${s.borderWidth}px`;
    if (s.minHeight) inline.minHeight = typeof s.minHeight === 'number' ? `${s.minHeight}px` : s.minHeight;
    return inline;
  };

  // Quick Hover Grip Handle & Nudge Bar Component
  const renderQuickHoverBar = () => {
    if (!isDesignMode || !parentId) return null;
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode(node.id, e);
        }}
        className={`absolute -top-3.5 left-2 z-30 flex items-center bg-stone-900/95 border border-stone-700/90 rounded-xs shadow-lg text-stone-300 transition-all duration-100 ${
          isSelected
            ? 'opacity-100 scale-100'
            : 'opacity-0 group-hover/comp:opacity-100 scale-95 group-hover/comp:scale-100'
        }`}
      >
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="px-1.5 py-0.5 text-stone-400 hover:text-amber-400 cursor-grab active:cursor-grabbing flex items-center gap-1"
          title="Drag up or down to reorder, or drop into any frame"
        >
          <GripVertical className="w-3 h-3" />
          <span className="text-[9px] font-mono font-bold text-stone-300 max-w-[80px] truncate select-none">
            {node.name}
          </span>
        </div>
        {onMoveNode && (
          <div className="flex items-center border-l border-stone-800 px-0.5 bg-stone-950/90">
            <button
              type="button"
              disabled={!canMoveUp}
              onClick={(e) => {
                e.stopPropagation();
                onMoveNode(node.id, 'up');
              }}
              className={`p-0.5 rounded-xs transition-colors ${
                canMoveUp
                  ? 'text-stone-300 hover:text-white hover:bg-stone-800'
                  : 'text-stone-600 opacity-25 cursor-not-allowed'
              }`}
              title="Move Up (Alt + ↑)"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              disabled={!canMoveDown}
              onClick={(e) => {
                e.stopPropagation();
                onMoveNode(node.id, 'down');
              }}
              className={`p-0.5 rounded-xs transition-colors ${
                canMoveDown
                  ? 'text-stone-300 hover:text-white hover:bg-stone-800'
                  : 'text-stone-600 opacity-25 cursor-not-allowed'
              }`}
              title="Move Down (Alt + ↓)"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Insertion indicator lines
  const renderInsertionGuide = () => {
    if (!siblingDropIndicator) return null;
    return (
      <>
        {siblingDropIndicator === 'before' && (
          <div className="absolute -top-1.5 left-0 right-0 h-1 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.95)] z-40 pointer-events-none flex items-center justify-between px-1">
            <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-xs" />
            <span className="text-[9px] font-mono font-bold bg-cyan-900 text-cyan-200 px-1 py-0 rounded-xs border border-cyan-400">
              Insert Above
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-xs" />
          </div>
        )}
        {siblingDropIndicator === 'after' && (
          <div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.95)] z-40 pointer-events-none flex items-center justify-between px-1">
            <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-xs" />
            <span className="text-[9px] font-mono font-bold bg-cyan-900 text-cyan-200 px-1 py-0 rounded-xs border border-cyan-400">
              Insert Below
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-xs" />
          </div>
        )}
      </>
    );
  };

  // 1. CONTAINER / FRAME (Centered Kiosk Stack / Flex / Grid)
  if (node.type === 'container') {
    const children = node.children || [];

    return (
      <div
        id={`comp-${node.id}`}
        onClick={handleSelect}
        onDragOver={(e) => {
          handleContainerDragOver(e);
          handleSiblingDragOver(e);
        }}
        onDragLeave={(e) => {
          handleContainerDragLeave(e);
          handleSiblingDragLeave(e);
        }}
        onDrop={(e) => {
          if (siblingDropIndicator) {
            handleSiblingDrop(e);
          } else {
            handleContainerDrop(e);
          }
        }}
        className={`group/comp ${getContainerClasses()}`}
        style={getContainerInlineStyle()}
      >
        {/* Floating Context Toolbar on Selection in Design Mode */}
        {isDesignMode && isSelected && (
          <InCanvasFloatingToolbar
            node={node}
            parentId={parentId}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onSelectNode={onSelectNode}
            onUpdateProps={onUpdateNodeProps}
            onUpdateStyle={onUpdateNodeStyle}
            onDropChild={onDropChild || (() => {})}
            onDuplicateNode={onDuplicateNode}
            onDeleteNode={onDeleteNode}
            onMoveNode={onMoveNode}
          />
        )}

        {/* Quick Hover Grip Handle & Nudge Bar */}
        {renderQuickHoverBar()}

        {/* Insertion Guide */}
        {renderInsertionGuide()}

        {/* Empty Container State: Interactive Affordance */}
        {children.length === 0 && isDesignMode && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode(node.id, e);
            }}
            className="w-full py-10 px-4 border-2 border-dashed border-stone-400/40 hover:border-blue-500/70 rounded-xs text-center text-stone-200 text-xs flex flex-col items-center justify-center gap-2.5 transition-all bg-stone-900/30 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-stone-200 text-xs tracking-tight">
                Blank Container ({node.name})
              </span>
              <span className="text-[10px] font-mono text-stone-400 bg-stone-950 px-2 py-0.5 border border-stone-800">
                {s.display === 'grid'
                  ? `${s.gridCols || 2}-Col Grid`
                  : s.flexDirection === 'row'
                  ? 'Flex Row'
                  : 'Flex Column'}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node.id, e);
                if (onDropChild) {
                  onDropChild(node.id, 'Bare White Input Box (CTC Style)');
                }
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add First Component</span>
            </button>

            <span className="text-[10px] text-stone-400">
              Click button, drag primitives from left library, or drag existing components here
            </span>
          </div>
        )}

        {/* Children Rendered Recursively with Reordering Props */}
        {children.map((childNode, index) => (
          <ComponentRenderer
            key={childNode.id}
            node={childNode}
            parentId={node.id}
            indexInParent={index}
            canMoveUp={index > 0}
            canMoveDown={index < children.length - 1}
            pages={pages}
            currentPageId={currentPageId}
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
        ))}
      </div>
    );
  }

  // 2. BARE INPUT BOX (ISA-101 Minimalist, No Forced Label, Glove Touch Height)
  if (node.type === 'input') {
    const currentValue =
      runtimeValues[node.id] !== undefined
        ? runtimeValues[node.id]
        : p.defaultValue !== undefined
        ? p.defaultValue
        : '';

    const v = p.validation || {};
    let isOutOfSpec = false;
    let specErrorMsg = '';

    if (p.inputType === 'number' && currentValue !== '' && !isNaN(Number(currentValue))) {
      const num = Number(currentValue);
      if (v.lsl !== undefined && num < v.lsl) {
        isOutOfSpec = true;
        specErrorMsg = `Below LSL (${v.lsl} ${p.unit || ''})`;
      } else if (v.usl !== undefined && num > v.usl) {
        isOutOfSpec = true;
        specErrorMsg = `Above USL (${v.usl} ${p.unit || ''})`;
      }
    }

    const inputHeight = p.inputHeight || 64;
    const inputBg = p.backgroundColor || '#FFFFFF';
    const inputBorderColor = isOutOfSpec ? '#DC2626' : p.borderColor || '#000000';
    const inputBorderWidth = p.borderWidth !== undefined ? p.borderWidth : 2;
    const inputTextColor = p.textColor || '#000000';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      onRuntimeValueChange(node.id, e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        onActionTrigger('input_enter', { nodeId: node.id, value: currentValue });
      }
    };

    return (
      <div
        id={`comp-${node.id}`}
        onClick={handleSelect}
        onDragOver={handleSiblingDragOver}
        onDragLeave={handleSiblingDragLeave}
        onDrop={handleSiblingDrop}
        className={`group/comp relative flex flex-col justify-center transition-all ${
          isSelected && isDesignMode
            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-stone-800 z-20'
            : isDesignMode
            ? 'hover:outline hover:outline-1 hover:outline-blue-400/50'
            : ''
        } ${isDraggingThis ? 'opacity-40 scale-[0.99]' : ''}`}
      >
        {/* Floating Context Toolbar on Selection */}
        {isDesignMode && isSelected && (
          <InCanvasFloatingToolbar
            node={node}
            parentId={parentId}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onSelectNode={onSelectNode}
            onUpdateProps={onUpdateNodeProps}
            onUpdateStyle={onUpdateNodeStyle}
            onDropChild={onDropChild || (() => {})}
            onDuplicateNode={onDuplicateNode}
            onDeleteNode={onDeleteNode}
            onMoveNode={onMoveNode}
          />
        )}

        {/* Quick Hover Grip Handle & Nudge Bar */}
        {renderQuickHoverBar()}

        {/* Insertion Guide */}
        {renderInsertionGuide()}

        {/* Optional Clean ISA-101 Parameter Label */}
        {p.showLabel && (
          <div className="mb-1 flex items-baseline justify-between">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
              <span>{p.label || 'Parameter'}</span>
              {v.required && <span className="text-red-400">*</span>}
            </label>

            {(v.lsl !== undefined || v.usl !== undefined) && (
              <span className="text-[10px] font-mono text-stone-200 tabular-nums">
                Spec: {v.lsl ?? '-∞'} – {v.usl ?? '+∞'} {p.unit || ''}
              </span>
            )}
          </div>
        )}

        {/* Real Interactive HTML Input */}
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type={p.inputType === 'number' ? 'number' : 'text'}
            value={currentValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            readOnly={isDesignMode || p.readOnly}
            placeholder={p.placeholder || ''}
            style={{
              height: `${inputHeight}px`,
              backgroundColor: inputBg,
              borderColor: inputBorderColor,
              borderWidth: `${inputBorderWidth}px`,
              color: inputTextColor,
            }}
            className={`w-full px-4 rounded-none outline-none font-bold transition-all ${
              p.textAlign === 'center' ? 'text-center' : 'text-left'
            } ${p.fontSize === '2xl' ? 'text-2xl' : p.fontSize === '3xl' ? 'text-3xl' : 'text-xl'} focus:ring-2 focus:ring-blue-600`}
          />

          {/* Unit Tag inside / next to input */}
          {p.showUnit && p.unit && (
            <div className="absolute right-3 px-2 py-1 bg-stone-200 border border-stone-400 text-stone-900 font-mono text-xs font-bold pointer-events-none">
              {p.unit}
            </div>
          )}

          {/* Barcode scanner icon indicator */}
          {p.inputType === 'barcode' && !p.showUnit && (
            <div className="absolute right-3 text-stone-400 pointer-events-none">
              <Barcode className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Out of spec / tolerance alert */}
        {isOutOfSpec && (
          <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-950/60 p-1.5 border border-red-800">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>OUT OF SPEC: {specErrorMsg}</span>
          </div>
        )}

        {p.helpText && !isOutOfSpec && (
          <div className="text-[10px] text-stone-300 mt-1">{p.helpText}</div>
        )}
      </div>
    );
  }

  // 3. ACTION BUTTON (High-Performance Industrial Colors, Glove Touch Target)
  if (node.type === 'button') {
    const touchHeight = p.touchHeight || 56;
    const isSquare = p.shape === 'square';

    const getButtonColors = () => {
      switch (p.colorScheme) {
        case 'red_danger':
          return 'bg-red-700 hover:bg-red-600 text-white border-red-900 font-extrabold';
        case 'amber_warn':
          return 'bg-amber-600 hover:bg-amber-500 text-stone-950 border-amber-800 font-extrabold';
        case 'green_safe':
          return 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-900 font-extrabold';
        case 'gray_neutral':
          return 'bg-stone-700 hover:bg-stone-600 text-white border-stone-800 font-bold';
        case 'blue_action':
        default:
          return 'bg-blue-600 hover:bg-blue-500 text-white border-blue-800 font-extrabold';
      }
    };

    const handleClick = (e: React.MouseEvent) => {
      if (isDesignMode) {
        handleSelect(e);
        return;
      }

      if (p.actionType === 'navigate' && p.targetPageId) {
        onNavigate(p.targetPageId);
      } else if (p.actionType) {
        onActionTrigger(p.actionType, { targetPageId: p.targetPageId, label: p.label });
      }
    };

    return (
      <div
        id={`comp-${node.id}`}
        onClick={handleSelect}
        onDragOver={handleSiblingDragOver}
        onDragLeave={handleSiblingDragLeave}
        onDrop={handleSiblingDrop}
        className={`group/comp relative transition-all ${
          isSelected && isDesignMode
            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-stone-800 z-20'
            : isDesignMode
            ? 'hover:outline hover:outline-1 hover:outline-blue-400/50'
            : ''
        } ${isDraggingThis ? 'opacity-40 scale-[0.99]' : ''}`}
      >
        {/* Floating Context Toolbar on Selection */}
        {isDesignMode && isSelected && (
          <InCanvasFloatingToolbar
            node={node}
            parentId={parentId}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onSelectNode={onSelectNode}
            onUpdateProps={onUpdateNodeProps}
            onUpdateStyle={onUpdateNodeStyle}
            onDropChild={onDropChild || (() => {})}
            onDuplicateNode={onDuplicateNode}
            onDeleteNode={onDeleteNode}
            onMoveNode={onMoveNode}
          />
        )}

        {/* Quick Hover Grip Handle & Nudge Bar */}
        {renderQuickHoverBar()}

        {/* Insertion Guide */}
        {renderInsertionGuide()}

        <button
          type="button"
          onClick={handleClick}
          style={{ height: `${touchHeight}px` }}
          className={`w-full px-5 flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all border-2 active:scale-98 shadow-md ${
            isSquare ? 'rounded-none' : 'rounded-md'
          } ${getButtonColors()}`}
        >
          <span>{p.label || 'Action Button'}</span>
          {p.icon === 'arrow' && <ArrowRight className="w-4 h-4" />}
          {p.icon === 'check' && <Check className="w-4 h-4" />}
          {p.icon === 'alert' && <AlertTriangle className="w-4 h-4" />}
          {p.icon === 'exit' && <LogOut className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  // 4. METRIC / KPI CARD
  if (node.type === 'metric') {
    const status = p.status || 'nominal';

    const getStatusClass = () => {
      switch (status) {
        case 'critical':
          return 'border-red-600 bg-red-950/40 text-red-200';
        case 'warning':
          return 'border-amber-600 bg-amber-950/40 text-amber-200';
        case 'nominal':
        default:
          return 'border-stone-700 bg-stone-900 text-stone-100';
      }
    };

    return (
      <div
        id={`comp-${node.id}`}
        onClick={handleSelect}
        onDragOver={handleSiblingDragOver}
        onDragLeave={handleSiblingDragLeave}
        onDrop={handleSiblingDrop}
        className={`group/comp relative p-3 border-2 transition-all ${getStatusClass()} ${
          isSelected && isDesignMode
            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-stone-800 z-20'
            : isDesignMode
            ? 'hover:outline hover:outline-1 hover:outline-blue-400/50'
            : ''
        } ${isDraggingThis ? 'opacity-40 scale-[0.99]' : ''}`}
      >
        {isDesignMode && isSelected && (
          <InCanvasFloatingToolbar
            node={node}
            parentId={parentId}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onSelectNode={onSelectNode}
            onUpdateProps={onUpdateNodeProps}
            onUpdateStyle={onUpdateNodeStyle}
            onDropChild={onDropChild || (() => {})}
            onDuplicateNode={onDuplicateNode}
            onDeleteNode={onDeleteNode}
            onMoveNode={onMoveNode}
          />
        )}

        {/* Quick Hover Grip Handle & Nudge Bar */}
        {renderQuickHoverBar()}

        {/* Insertion Guide */}
        {renderInsertionGuide()}

        <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold mb-1">
          {p.label || 'Metric'}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono tracking-tight">
            {p.value !== undefined ? p.value : '0.00'}
          </span>
          {p.unit && <span className="text-xs font-mono text-stone-400">{p.unit}</span>}
        </div>
        {p.target && (
          <div className="text-[10px] font-mono text-stone-400 mt-1">
            Target: {p.target} {p.unit || ''}
          </div>
        )}
      </div>
    );
  }

  // 5. STATUS BADGE
  if (node.type === 'statusBadge') {
    const state = p.state || 'running';

    const getStateStyles = () => {
      switch (state) {
        case 'down':
          return 'bg-red-700 text-white border-red-900';
        case 'warning':
          return 'bg-amber-600 text-stone-950 border-amber-800';
        case 'qa_pass':
          return 'bg-emerald-700 text-white border-emerald-900';
        case 'running':
        case 'nominal':
        default:
          return 'bg-stone-700 text-white border-stone-800';
      }
    };

    return (
      <div
        id={`comp-${node.id}`}
        onClick={handleSelect}
        onDragOver={handleSiblingDragOver}
        onDragLeave={handleSiblingDragLeave}
        onDrop={handleSiblingDrop}
        className={`group/comp relative inline-flex items-center gap-2 px-3 py-1.5 border font-mono text-xs font-bold uppercase tracking-wider transition-all ${getStateStyles()} ${
          isSelected && isDesignMode
            ? 'ring-2 ring-blue-500 z-20'
            : isDesignMode
            ? 'hover:outline hover:outline-1 hover:outline-blue-400/50'
            : ''
        } ${isDraggingThis ? 'opacity-40 scale-[0.99]' : ''}`}
      >
        {isDesignMode && isSelected && (
          <InCanvasFloatingToolbar
            node={node}
            parentId={parentId}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onSelectNode={onSelectNode}
            onUpdateProps={onUpdateNodeProps}
            onUpdateStyle={onUpdateNodeStyle}
            onDropChild={onDropChild || (() => {})}
            onDuplicateNode={onDuplicateNode}
            onDeleteNode={onDeleteNode}
            onMoveNode={onMoveNode}
          />
        )}

        {/* Quick Hover Grip Handle & Nudge Bar */}
        {renderQuickHoverBar()}

        {/* Insertion Guide */}
        {renderInsertionGuide()}

        {p.showIndicator && (
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        )}
        <span>{p.label || state}</span>
      </div>
    );
  }

  // 6. TEXT / HEADER
  if (node.type === 'text') {
    return (
      <div
        id={`comp-${node.id}`}
        onClick={handleSelect}
        onDragOver={handleSiblingDragOver}
        onDragLeave={handleSiblingDragLeave}
        onDrop={handleSiblingDrop}
        className={`group/comp relative transition-all ${
          isSelected && isDesignMode
            ? 'ring-2 ring-blue-500 z-20'
            : isDesignMode
            ? 'hover:outline hover:outline-1 hover:outline-blue-400/50'
            : ''
        } ${isDraggingThis ? 'opacity-40 scale-[0.99]' : ''}`}
      >
        {isDesignMode && isSelected && (
          <InCanvasFloatingToolbar
            node={node}
            parentId={parentId}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onSelectNode={onSelectNode}
            onUpdateProps={onUpdateNodeProps}
            onUpdateStyle={onUpdateNodeStyle}
            onDropChild={onDropChild || (() => {})}
            onDuplicateNode={onDuplicateNode}
            onDeleteNode={onDeleteNode}
            onMoveNode={onMoveNode}
          />
        )}

        {/* Quick Hover Grip Handle & Nudge Bar */}
        {renderQuickHoverBar()}

        {/* Insertion Guide */}
        {renderInsertionGuide()}

        {p.tag === 'h1' && (
          <h1 className="text-xl font-black text-white uppercase tracking-wider">
            {p.content || 'Header Text'}
          </h1>
        )}
        {p.tag === 'h2' && (
          <h2 className="text-base font-bold text-white tracking-wide">
            {p.content || 'Subheader Text'}
          </h2>
        )}
        {(!p.tag || p.tag === 'p') && (
          <p className="text-xs text-stone-200 leading-relaxed">
            {p.content || 'Body description paragraph.'}
          </p>
        )}
      </div>
    );
  }

  // 7. TABLE / CHECKLIST
  if (node.type === 'table') {
    const headers = p.headers || ['Item', 'Status'];
    const rows = p.rows || [['Test #1', 'PASS']];

    return (
      <div
        id={`comp-${node.id}`}
        onClick={handleSelect}
        onDragOver={handleSiblingDragOver}
        onDragLeave={handleSiblingDragLeave}
        onDrop={handleSiblingDrop}
        className={`group/comp relative w-full border border-stone-700 bg-stone-900 text-xs overflow-x-auto transition-all ${
          isSelected && isDesignMode
            ? 'ring-2 ring-blue-500 z-20'
            : isDesignMode
            ? 'hover:outline hover:outline-1 hover:outline-blue-400/50'
            : ''
        } ${isDraggingThis ? 'opacity-40 scale-[0.99]' : ''}`}
      >
        {isDesignMode && isSelected && (
          <InCanvasFloatingToolbar
            node={node}
            parentId={parentId}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onSelectNode={onSelectNode}
            onUpdateProps={onUpdateNodeProps}
            onUpdateStyle={onUpdateNodeStyle}
            onDropChild={onDropChild || (() => {})}
            onDuplicateNode={onDuplicateNode}
            onDeleteNode={onDeleteNode}
            onMoveNode={onMoveNode}
          />
        )}

        {/* Quick Hover Grip Handle & Nudge Bar */}
        {renderQuickHoverBar()}

        {/* Insertion Guide */}
        {renderInsertionGuide()}

        {p.caption && (
          <div className="px-3 py-1.5 bg-stone-950 font-mono text-[10px] text-stone-300 font-bold uppercase border-b border-stone-800">
            {p.caption}
          </div>
        )}
        <table className="w-full text-left font-mono">
          <thead className="bg-stone-950 text-stone-400 text-[10px] uppercase">
            <tr>
              {headers.map((h: string, idx: number) => (
                <th key={idx} className="p-2 border-b border-stone-800 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {rows.map((row: string[], rIdx: number) => (
              <tr key={rIdx} className="hover:bg-stone-800/50">
                {row.map((cell: string, cIdx: number) => (
                  <td key={cIdx} className="p-2 text-stone-200">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
};
