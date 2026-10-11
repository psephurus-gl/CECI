import React, { useState, useRef, useMemo } from 'react';
import {
  FileText,
  Home,
  Link2,
} from 'lucide-react';
import { Page } from '../types';
import { extractPageEdges } from '../utils/linkUtils';

interface VisualLinkGraphProps {
  pages: Page[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onLinkPages: (sourcePageId: string, targetPageId: string) => void;
}

export const VisualLinkGraph: React.FC<VisualLinkGraphProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onLinkPages,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Position pages in a neat circular / tree layout
  const nodePositions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    const count = pages.length;
    const centerX = 440;
    const centerY = 280;
    const radiusX = 280;
    const radiusY = 160;

    pages.forEach((page) => {
      // Place home in center-left, others arranged around
      if (page.isHome) {
        map[page.id] = { x: 160, y: centerY };
      } else {
        const otherIndex = pages.filter((p) => !p.isHome).indexOf(page);
        const otherCount = count - 1;
        const angle = ((otherIndex / Math.max(1, otherCount)) * Math.PI) - Math.PI / 2;
        map[page.id] = {
          x: centerX + Math.cos(angle) * radiusX,
          y: centerY + Math.sin(angle) * radiusY,
        };
      }
    });

    return map;
  }, [pages]);

  const edges = useMemo(() => extractPageEdges(pages), [pages]);

  // Aggregate connections between page pairs for clean curved arrows
  const aggregatedEdges = useMemo(() => {
    const pairMap: Record<string, { source: string; target: string; count: number; items: string[] }> = {};
    edges.forEach((edge) => {
      const key = `${edge.sourcePageId}->${edge.targetPageId}`;
      if (!pairMap[key]) {
        pairMap[key] = {
          source: edge.sourcePageId,
          target: edge.targetPageId,
          count: 0,
          items: [],
        };
      }
      pairMap[key].count += 1;
      pairMap[key].items.push(edge.sourceElement);
    });
    return Object.values(pairMap);
  }, [edges]);

  const handleStartConnect = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    setConnectingSourceId(pageId);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!connectingSourceId) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseUp = () => {
    setConnectingSourceId(null);
    setMousePos(null);
  };

  const handleDropOnTarget = (targetPageId: string) => {
    if (connectingSourceId && connectingSourceId !== targetPageId) {
      onLinkPages(connectingSourceId, targetPageId);
    }
    setConnectingSourceId(null);
    setMousePos(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full bg-stone-950 overflow-hidden select-none flex flex-col justify-between"
    >
      {/* Top Banner Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-stone-900/90 backdrop-blur border border-stone-800 rounded-xl px-4 py-2 pointer-events-auto shadow-lg flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 font-semibold text-stone-200">
            <Link2 className="w-4 h-4 text-blue-400" />
            <span>Site Link Topology</span>
          </div>
          <span className="text-stone-600">|</span>
          <div className="flex items-center gap-3 text-stone-400 text-[11px]">
            <span>{pages.length} Pages</span>
            <span>·</span>
            <span className="text-emerald-400 font-medium">{edges.length} Interconnected Links</span>
          </div>
        </div>

        <div className="bg-stone-900/90 backdrop-blur border border-stone-800 rounded-xl px-3 py-1.5 pointer-events-auto shadow-lg text-[11px] text-stone-400 flex items-center gap-2">
          <span>Drag the blue connector handle on any page node to link it to another page</span>
        </div>
      </div>

      {/* SVG Canvas for Arrows & Connecting Cables */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#60a5fa" />
          </marker>
          <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Existing Link Arrows */}
        {aggregatedEdges.map((conn) => {
          const srcPos = nodePositions[conn.source];
          const tgtPos = nodePositions[conn.target];
          if (!srcPos || !tgtPos) return null;

          const dx = tgtPos.x - srcPos.x;
          const cx1 = srcPos.x + dx * 0.5;
          const cy1 = srcPos.y;
          const cx2 = srcPos.x + dx * 0.5;
          const cy2 = tgtPos.y;

          return (
            <g key={`${conn.source}-${conn.target}`} className="group">
              <path
                d={`M ${srcPos.x + 100} ${srcPos.y + 40} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tgtPos.x} ${tgtPos.y + 40}`}
                fill="none"
                stroke="url(#linkGradient)"
                strokeWidth="2"
                strokeDasharray="4 2"
                markerEnd="url(#arrow)"
                className="transition-all"
              />
              {/* Midpoint link counter pill */}
              <circle
                cx={(srcPos.x + 100 + tgtPos.x) / 2}
                cy={(srcPos.y + 40 + tgtPos.y + 40) / 2}
                r="10"
                fill="#1e293b"
                stroke="#3b82f6"
                strokeWidth="1.5"
              />
              <text
                x={(srcPos.x + 100 + tgtPos.x) / 2}
                y={(srcPos.y + 40 + tgtPos.y + 40) / 2 + 3}
                fill="#93c5fd"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                {conn.count}
              </text>
            </g>
          );
        })}

        {/* Active Drag-To-Connect Cable */}
        {connectingSourceId && mousePos && nodePositions[connectingSourceId] && (
          <path
            d={`M ${nodePositions[connectingSourceId].x + 100} ${
              nodePositions[connectingSourceId].y + 40
            } Q ${mousePos.x} ${nodePositions[connectingSourceId].y + 40}, ${mousePos.x} ${mousePos.y}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="5 3"
            markerEnd="url(#arrow)"
          />
        )}
      </svg>

      {/* Interactive Page Nodes */}
      <div className="relative w-full h-full min-h-[600px] z-20">
        {pages.map((page) => {
          const pos = nodePositions[page.id] || { x: 200, y: 200 };
          const isSelected = page.id === activePageId;
          const incomingLinks = edges.filter((e) => e.targetPageId === page.id).length;
          const outgoingLinks = edges.filter((e) => e.sourcePageId === page.id).length;

          return (
            <div
              key={page.id}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                position: 'absolute',
              }}
              onClick={() => onSelectPage(page.id)}
              onMouseUp={() => handleDropOnTarget(page.id)}
              className={`w-52 p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xl ${
                isSelected
                  ? 'bg-stone-900 border-blue-500 ring-2 ring-blue-500/30'
                  : 'bg-stone-900/90 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  {page.isHome ? (
                    <Home className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-stone-400" />
                  )}
                  <h3 className="font-bold text-xs text-white truncate max-w-[110px]">
                    {page.name}
                  </h3>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">/{page.slug}</span>
              </div>

              <div className="text-[11px] text-stone-400 line-clamp-1 mb-3">
                {page.description || 'No description provided'}
              </div>

              {/* Link stats inside card */}
              <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2 text-stone-400">
                  <span className="text-emerald-400 font-medium">{incomingLinks} in</span>
                  <span>·</span>
                  <span className="text-blue-400 font-medium">{outgoingLinks} out</span>
                </div>

                {/* Drag Link Handle (Output Dot) */}
                <button
                  type="button"
                  onMouseDown={(e) => handleStartConnect(e, page.id)}
                  title="Drag from this dot to another page to link them"
                  className="w-5 h-5 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
                >
                  <Link2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-stone-900/90 backdrop-blur border border-stone-800 rounded-xl px-4 py-2 text-xs flex items-center gap-5 text-stone-400 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Home Page</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-blue-400" />
          <span>Active Link Pathway</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px]">
            🔗
          </span>
          <span>Drag Connector</span>
        </div>
      </div>
    </div>
  );
};
