import React, { useState } from 'react';
import {
  X,
  Globe,
  Check,
  Copy,
  ExternalLink,
  Download,
  Layers,
  Link2,
} from 'lucide-react';
import { SiteProject } from '../types';
import { extractPageEdges } from '../utils/linkUtils';
import { exportSiteStandaloneHtml } from '../utils/exportSite';

interface PublishModalProps {
  project: SiteProject;
  isOpen: boolean;
  onClose: () => void;
  onViewLive: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  project,
  isOpen,
  onClose,
  onViewLive,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const edges = extractPageEdges(project.pages);
  const homePage = project.pages.find((p) => p.isHome) || project.pages[0];
  const liveUrl = `${window.location.origin}${window.location.pathname}#${homePage?.slug || 'home'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const html = exportSiteStandaloneHtml(project);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-site.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Site Published Successfully</h2>
              <p className="text-xs text-stone-400">All pages and links are live and functional</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs">
          {/* Live URL Bar */}
          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-2">
              Shareable Live URL
            </label>
            <div className="flex items-center gap-2 p-2 bg-stone-950 border border-stone-800 rounded-xl">
              <Globe className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
              <input
                readOnly
                value={liveUrl}
                className="w-full bg-transparent font-mono text-xs text-stone-200 outline-none truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 font-medium transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Pages</span>
              </div>
              <p className="text-lg font-extrabold text-white">{project.pages.length}</p>
            </div>

            <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                <Link2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Links</span>
              </div>
              <p className="text-lg font-extrabold text-white">{edges.length}</p>
            </div>

            <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Status</span>
              </div>
              <p className="text-lg font-extrabold text-emerald-400">Live</p>
            </div>
          </div>

          {/* Connected Pages Breakdown */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-stone-300">Published Page Slugs</span>
            <div className="p-3 bg-stone-950/50 border border-stone-800 rounded-xl max-h-36 overflow-y-auto space-y-1.5">
              {project.pages.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-300 font-medium">{p.name}</span>
                  <span className="text-stone-500 font-mono">/{p.slug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-stone-800 bg-stone-950/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export HTML File</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onViewLive();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Visitor Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
