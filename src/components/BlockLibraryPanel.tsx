import React, { useState } from 'react';
import {
  COMPONENT_PRIMITIVES,
  PrimitiveTemplateMeta,
} from '../data/componentLibrary';
import { } from '../types';
import {
  Plus,
  PanelLeftClose,
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
  AlertOctagon,
  ChevronDownSquare,
  Activity,
  Heading,
} from 'lucide-react';

interface ComponentPalettePanelProps {
  onAddComponent: (template: PrimitiveTemplateMeta) => void;
  onToggleCollapse?: () => void;
}

export const BlockLibraryPanel: React.FC<ComponentPalettePanelProps> = ({
  onAddComponent,
  onToggleCollapse,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Containers', 'Inputs', 'Displays', 'Actions'];

  const filtered =
    selectedCategory === 'All'
      ? COMPONENT_PRIMITIVES
      : COMPONENT_PRIMITIVES.filter((t) => t.category === selectedCategory);

  const getPrimitiveIcon = (iconName: string) => {
    switch (iconName) {
      case 'Rows':
        return <Rows className="w-3.5 h-3.5 text-blue-400" />;
      case 'Columns':
        return <Columns className="w-3.5 h-3.5 text-blue-400" />;
      case 'LayoutGrid':
        return <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />;
      case 'Square':
        return <Square className="w-3.5 h-3.5 text-blue-400" />;
      case 'Gauge':
        return <Gauge className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Barcode':
        return <Barcode className="w-3.5 h-3.5 text-amber-400" />;
      case 'Type':
        return <Type className="w-3.5 h-3.5 text-stone-300" />;
      case 'ChevronDownSquare':
        return <ChevronDownSquare className="w-3.5 h-3.5 text-cyan-400" />;
      case 'CheckSquare':
        return <CheckSquare className="w-3.5 h-3.5 text-amber-400" />;
      case 'Activity':
        return <Activity className="w-3.5 h-3.5 text-purple-400" />;
      case 'CircleDot':
        return <CircleDot className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Heading':
        return <Heading className="w-3.5 h-3.5 text-stone-200" />;
      case 'Table':
        return <TableIcon className="w-3.5 h-3.5 text-rose-400" />;
      case 'Minus':
        return <Minus className="w-3.5 h-3.5 text-stone-500" />;
      case 'SquareMousePointer':
        return <SquareMousePointer className="w-3.5 h-3.5 text-cyan-400" />;
      case 'AlertOctagon':
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Type className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, template: PrimitiveTemplateMeta) => {
    e.dataTransfer.setData('application/x-mes-primitive', template.title);
    e.dataTransfer.setData('text/plain', template.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full bg-stone-900/95 backdrop-blur text-stone-200 select-none">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-stone-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white tracking-tight">Component Palette</span>
          <span className="text-[10px] text-stone-500 font-mono">({COMPONENT_PRIMITIVES.length})</span>
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="px-2 py-1.5 border-b border-stone-800 flex items-center gap-1 overflow-x-auto text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-stone-800 text-white font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Primitives Grid */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filtered.map((template) => {
          return (
            <div
              key={template.title}
              draggable
              onDragStart={(e) => handleDragStart(e, template)}
              className="p-2.5 rounded-lg bg-stone-900/80 border border-stone-800 hover:border-stone-700 hover:bg-stone-800/60 transition-all cursor-grab active:cursor-grabbing group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="p-1.5 rounded-md bg-stone-800 text-stone-300 shrink-0">
                    {getPrimitiveIcon(template.icon)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-medium text-stone-200 group-hover:text-white truncate">
                      {template.title}
                    </h3>
                    <p className="text-[10px] text-stone-500 leading-tight mt-0.5 line-clamp-1">
                      {template.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAddComponent(template)}
                  className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-700 transition-colors shrink-0"
                  title="Add to canvas / selected container"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
