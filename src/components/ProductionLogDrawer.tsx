import React from 'react';
import { ProductionLogRecord } from '../types';
import {
  Download,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';

interface ProductionLogDrawerProps {
  logs: ProductionLogRecord[];
  isOpen: boolean;
  onClose: () => void;
  onClearLogs: () => void;
}

export const ProductionLogDrawer: React.FC<ProductionLogDrawerProps> = ({
  logs,
  isOpen,
  onClose,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  const exportCSV = () => {
    if (logs.length === 0) return;

    // Collect all data keys across logs
    const dataKeys = Array.from(
      new Set(logs.flatMap((l) => Object.keys(l.data || {})))
    );

    const headers = ['Timestamp', 'Station', 'Status', 'WorkOrder', 'LotSerial', 'Operator', ...dataKeys];

    const rows = logs.map((l) => {
      const base = [
        l.timestamp,
        `"${l.stationName}"`,
        l.status,
        `"${l.workOrderId || ''}"`,
        `"${l.lotNumber || ''}"`,
        `"${l.operatorId || ''}"`,
      ];
      const dataCols = dataKeys.map((k) => `"${l.data?.[k] ?? ''}"`);
      return [...base, ...dataCols].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mes_production_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const passCount = logs.filter((l) => l.status === 'PASS').length;
  const failCount = logs.filter((l) => l.status === 'FAIL').length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center animate-in fade-in duration-150">
      <div className="w-full max-w-5xl bg-stone-900 border-t border-x border-stone-800 rounded-t-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Production Batch Data Log</span>
                <span className="text-xs font-mono font-medium text-stone-400">
                  ({logs.length} Records)
                </span>
              </h2>
              <div className="flex items-center gap-3 text-[11px] font-mono text-stone-400 mt-0.5">
                <span className="text-emerald-400 font-semibold">{passCount} PASS</span>
                <span>·</span>
                <span className="text-rose-400 font-semibold">{failCount} OUT-OF-SPEC</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCSV}
              disabled={logs.length === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={onClearLogs}
              disabled={logs.length === 0}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
              title="Clear Session Log"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {logs.length === 0 ? (
            <div className="py-16 text-center text-stone-500 text-xs">
              <Clock className="w-8 h-8 text-stone-600 mx-auto mb-2 opacity-50" />
              <p className="font-medium text-stone-400">No batch entries recorded yet.</p>
              <p className="text-[11px] text-stone-600 mt-1">
                Switch to Operator Mode and click &quot;Log Batch &amp; Advance Station&quot; to capture real-time shop-floor records.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-stone-800 overflow-hidden font-mono text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone-950 text-stone-400 font-semibold uppercase text-[10px] border-b border-stone-800">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Station</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Serial / Lot</th>
                    <th className="py-2.5 px-3">Operator</th>
                    <th className="py-2.5 px-3">Parameters Recorded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 bg-stone-900/60">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-2.5 px-3 text-stone-400 text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                        {log.stationName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'PASS'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                          }`}
                        >
                          {log.status === 'PASS' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          <span>{log.status}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-stone-200">
                        {log.lotNumber || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-stone-300">
                        {log.operatorId || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-stone-400 text-[11px]">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(log.data || {}).map(([key, val]) => (
                            <span key={key} className="bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">
                              <span className="text-stone-500">{key}:</span>{' '}
                              <span className="text-stone-200 font-semibold">{String(val)}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
