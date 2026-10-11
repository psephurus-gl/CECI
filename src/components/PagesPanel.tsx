import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Home,
  Trash2,
  Copy,
  GripVertical,
  Link2,
  Settings,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  X,
} from 'lucide-react';
import { Page } from '../types';

interface PagesPanelProps {
  pages: Page[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: (page: Partial<Page>) => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onUpdatePage: (pageId: string, updates: Partial<Page>) => void;
  onReorderPages: (startIndex: number, endIndex: number) => void;
  onToggleCollapse?: () => void;
}

export const PagesPanel: React.FC<PagesPanelProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onUpdatePage,
  onReorderPages,
  onToggleCollapse,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [editingSettingsPageId, setEditingSettingsPageId] = useState<string | null>(null);
  const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null);
  const [isTipExpanded, setIsTipExpanded] = useState(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;

    const slug = (
      newPageSlug.trim() || newPageName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    ).replace(/^-|-$/g, '');

    onAddPage({
      name: newPageName.trim(),
      slug: slug || 'new-page',
      title: `${newPageName.trim()} — Studio`,
      description: `Explore the ${newPageName.trim()} page.`,
      isHome: pages.length === 0,
      isPublished: true,
      publishedAt: new Date().toISOString(),
    });

    setNewPageName('');
    setNewPageSlug('');
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col h-full bg-stone-900/95 backdrop-blur text-stone-200 select-none">
      {/* Panel Header (Minimalistic & Collapsible) */}
      <div className="px-3 py-2.5 border-b border-stone-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-white tracking-tight">Pages</span>
          <span className="text-[10px] text-stone-500 font-mono">({pages.length})</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            title="Create New Page"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

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
      </div>

      {/* Inline Create Page Drawer */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-2.5 bg-stone-950/70 border-b border-stone-800/80 space-y-2 text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-300">New Page</span>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-stone-500 hover:text-stone-300 text-[11px]"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <input
            type="text"
            autoFocus
            placeholder="Page name (e.g. Services)"
            value={newPageName}
            onChange={(e) => {
              setNewPageName(e.target.value);
              if (
                !newPageSlug ||
                newPageSlug === newPageName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
              ) {
                setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              }
            }}
            className="w-full px-2 py-1 bg-stone-900 border border-stone-800 rounded text-xs text-stone-100 focus:outline-none focus:border-stone-600"
          />
          <div className="flex items-center bg-stone-900 border border-stone-800 rounded px-2">
            <span className="text-[10px] text-stone-500">/</span>
            <input
              type="text"
              placeholder="slug"
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value)}
              className="w-full py-1 pl-1 bg-transparent text-xs text-stone-200 font-mono focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium transition-colors"
          >
            Add Page
          </button>
        </form>
      )}

      {/* Pages List (Minimalistic & Cleaner) */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {pages.map((page, index) => {
          const isActive = page.id === activePageId;
          const isSettingsOpen = editingSettingsPageId === page.id;

          return (
            <div key={page.id} className="space-y-0.5">
              <div
                draggable
                onDragStart={(e) => {
                  setDraggedPageIndex(index);
                  e.dataTransfer.setData('application/x-page-id', page.id);
                  e.dataTransfer.setData('text/plain', page.id);
                  e.dataTransfer.effectAllowed = 'copyMove';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedPageIndex !== null && draggedPageIndex !== index) {
                    onReorderPages(draggedPageIndex, index);
                  }
                  setDraggedPageIndex(null);
                }}
                onClick={() => onSelectPage(page.id)}
                className={`px-2 py-1.5 rounded-lg flex items-center justify-between gap-1.5 transition-colors cursor-pointer group text-xs border ${
                  isActive
                    ? 'bg-stone-800/80 text-white font-medium border-stone-700/50 shadow-xs'
                    : 'text-stone-300 hover:bg-stone-800/40 hover:text-white border-transparent'
                }`}
              >
                {/* Left: Drag Handle, Icon, Name */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="cursor-grab text-stone-600 group-hover:text-stone-400 p-0.5"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-3 h-3" />
                  </div>

                  {page.isHome ? (
                    <span title="Home page" className="shrink-0 flex items-center">
                      <Home className="w-3 h-3 text-amber-400" />
                    </span>
                  ) : (
                    <FileText className="w-3 h-3 text-stone-400 shrink-0" />
                  )}

                  <span className="truncate text-xs">{page.name}</span>

                  <span className="text-[10px] text-stone-500 font-mono hidden sm:inline truncate">
                    /{page.slug}
                  </span>
                </div>

                {/* Right: Drag-to-link Capsule & Settings toggle */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Draggable Link Chip */}
                  <div
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      e.dataTransfer.setData('application/x-page-id', page.id);
                      e.dataTransfer.setData('text/plain', page.id);
                      e.dataTransfer.effectAllowed = 'link';
                    }}
                    title="Drag onto any button in canvas to link"
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-stone-400 hover:text-blue-400 hover:bg-stone-700/50 cursor-grab active:cursor-grabbing transition-colors"
                  >
                    <Link2 className="w-2.5 h-2.5" />
                    <span>Link</span>
                  </div>

                  {/* Settings toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSettingsPageId(isSettingsOpen ? null : page.id);
                    }}
                    className={`p-1 rounded text-stone-500 hover:text-stone-200 hover:bg-stone-700/50 transition-colors ${
                      isSettingsOpen ? 'bg-stone-700/60 text-stone-100' : ''
                    }`}
                    title="Page settings"
                  >
                    <Settings className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Collapsible Page Settings Drawer */}
              {isSettingsOpen && (
                <div className="p-2.5 mx-1 bg-stone-950/70 border border-stone-800/80 rounded-lg space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-stone-400 mb-0.5">Name</label>
                    <input
                      type="text"
                      value={page.name}
                      onChange={(e) => onUpdatePage(page.id, { name: e.target.value })}
                      className="w-full px-2 py-0.5 bg-stone-900 border border-stone-800 rounded text-xs text-stone-200 focus:outline-none focus:border-stone-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-400 mb-0.5">Slug</label>
                    <input
                      type="text"
                      value={page.slug}
                      onChange={(e) =>
                        onUpdatePage(page.id, {
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                        })
                      }
                      className="w-full px-2 py-0.5 bg-stone-900 border border-stone-800 rounded text-xs text-stone-200 font-mono focus:outline-none focus:border-stone-600"
                    />
                  </div>

                  <div className="pt-1.5 border-t border-stone-800/60 flex items-center justify-between text-[11px]">
                    {!page.isHome ? (
                      <button
                        type="button"
                        onClick={() => {
                          pages.forEach((p) => {
                            onUpdatePage(p.id, { isHome: p.id === page.id });
                          });
                        }}
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Home className="w-2.5 h-2.5" />
                        Set as Home
                      </button>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-medium">Home page</span>
                    )}

                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        type="button"
                        onClick={() => onDuplicatePage(page.id)}
                        className="p-1 rounded text-stone-400 hover:text-stone-200"
                        title="Duplicate"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {pages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeletePage(page.id)}
                          className="p-1 rounded text-stone-500 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Tip / Footer (Collapsible & Minimalistic) */}
      <div className="border-t border-stone-800/60 bg-stone-950/40">
        <button
          type="button"
          onClick={() => setIsTipExpanded(!isTipExpanded)}
          className="w-full px-3 py-1.5 flex items-center justify-between text-[10px] text-stone-500 hover:text-stone-400 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Link2 className="w-3 h-3 text-blue-400" />
            <span>Drag-to-link shortcuts</span>
          </div>
          {isTipExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronUp className="w-3 h-3" />
          )}
        </button>

        {isTipExpanded && (
          <div className="px-3 pb-2.5 pt-0.5 text-[10px] text-stone-400 leading-relaxed border-t border-stone-800/40">
            Drag any page’s <span className="text-stone-200 font-medium">Link</span> chip directly onto buttons, nav links, or cards in the canvas to connect them.
          </div>
        )}
      </div>
    </div>
  );
};
