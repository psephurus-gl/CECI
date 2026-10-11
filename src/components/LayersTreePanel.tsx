import React, { useState } from 'react';
import { ComponentNode } from '../types';
import {
  Layers,
  ChevronRight,
  ChevronDown,
  Box,
  Rows,
  Columns,
  LayoutGrid,
  Square,
  Type,
  Gauge,
  Barcode,
  SquareMousePointer,
  CircleDot,
  Table as TableIcon,
  CheckSquare,
  Minus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Plus,
} from 'lucide-react';

interface LayersTreePanelProps {
  rootNode: ComponentNode;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onMoveNode: (nodeId: string, direction: 'up' | 'down') => void;
  onAddChildToContainer: (containerId: string) => void;
}

export const LayersTreePanel: React.FC<LayersTreePanelProps> = ({
  rootNode,
  selectedNodeId,
  onSelectNode,
  onDeleteNode,
  onDuplicateNode,
  onMoveNode,
  onAddChildToContainer,
}) => {
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getNodeIcon = (node: ComponentNode) => {
    if (node.type === 'container') {
      if (node.style.display === 'grid') return <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />;
      if (node.style.flexDirection === 'row') return <Rows className="w-3.5 h-3.5 text-blue-400" />;
      return <Columns className="w-3.5 h-3.5 text-blue-400" />;
    }
    switch (node.type) {
      case 'input':
        return node.props?.inputType === 'barcode' ? (
          <Barcode className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Gauge className="w-3.5 h-3.5 text-emerald-400" />
        );
      case 'button':
        return <SquareMousePointer className="w-3.5 h-3.5 text-cyan-400" />;
      case 'metric':
        return <Gauge className="w-3.5 h-3.5 text-purple-400" />;
      case 'statusBadge':
        return <CircleDot className="w-3.5 h-3.5 text-emerald-400" />;
      case 'table':
        return <TableIcon className="w-3.5 h-3.5 text-rose-400" />;
      case 'checkbox':
        return <CheckSquare className="w-3.5 h-3.5 text-amber-400" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-stone-300" />;
      case 'divider':
        return <Minus className="w-3.5 h-3.5 text-stone-500" />;
      default:
        return <Box className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  const renderTreeItem = (node: ComponentNode, depth: number = 0) => {
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = !!collapsedNodes[node.id];
    const isRoot = node.id === rootNode.id;

    return (
      <div key={node.id} className="select-none text-xs">
        <div
          onClick={() => onSelectNode(node.id)}
          className={`flex items-center justify-between py-1.5 px-2 rounded-md transition-colors cursor-pointer group ${
            isSelected
              ? 'bg-blue-600/90 text-white font-medium shadow-xs'
              : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
          }`}
          style={{ paddingLeft: `${Math.max(6, depth * 14 + 6)}px` }}
        >
          {/* Left: Collapsible Toggle + Icon + Node Name */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleCollapse(node.id, e)}
                className="p-0.5 rounded hover:bg-black/20 text-stone-400 hover:text-white transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            ) : (
              <span className="w-3 shrink-0" />
            )}

            <div className="shrink-0">{getNodeIcon(node)}</div>

            <span className="truncate text-[11px] leading-tight">
              {node.name || `[${node.type}]`}
            </span>
          </div>

          {/* Right: Quick Action Buttons on Hover or Selection */}
          <div
            className={`flex items-center gap-0.5 shrink-0 transition-opacity ${
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {node.type === 'container' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChildToContainer(node.id);
                }}
                className="p-1 rounded hover:bg-black/20 text-stone-300 hover:text-white transition-colors"
                title="Add element into container"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}

            {!isRoot && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveNode(node.id, 'up');
                  }}
                  className="p-1 rounded hover:bg-black/20 text-stone-300 hover:text-white transition-colors"
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveNode(node.id, 'down');
                  }}
                  className="p-1 rounded hover:bg-black/20 text-stone-300 hover:text-white transition-colors"
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateNode(node.id);
                  }}
                  className="p-1 rounded hover:bg-black/20 text-stone-300 hover:text-white transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNode(node.id);
                  }}
                  className="p-1 rounded hover:bg-black/20 text-stone-300 hover:text-rose-300 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Nested Children */}
        {hasChildren && !isCollapsed && (
          <div className="space-y-0.5 mt-0.5">
            {node.children!.map((child) => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono">
      {renderTreeItem(rootNode, 0)}
    </div>
  );
};
