import React, { useState } from 'react';
import { useControl } from '../context/ControlContext';
import { FileText, Search, Trash2, ShieldAlert, CheckCircle, Info, AlertTriangle, Filter } from 'lucide-react';
import type { LogEntry } from '../types';


export const EventLog: React.FC = () => {
  const { logs, clearLogs } = useControl();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'info' | 'warning' | 'danger' | 'success'>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userRole.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || log.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: LogEntry['type']) => {
    switch (type) {
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold">
            <ShieldAlert className="w-3 h-3" /> ALERTA
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
            <AlertTriangle className="w-3 h-3" /> ADVERTENCIA
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
            <CheckCircle className="w-3 h-3" /> ÉXITO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold">
            <Info className="w-3 h-3" /> INFO
          </span>
        );
    }
  };

  return (
    <div className="scada-panel rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Bitácora de Eventos del Sistema (Logs)
            </h2>
            <p className="text-xs text-slate-400 font-mono">Registro auditado de acciones de usuario y alertas</p>
          </div>
        </div>

        {/* Clear logs button */}
        <button
          onClick={clearLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 text-xs font-mono transition-all cursor-pointer self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpiar Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuario o acción..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
          {(['all', 'info', 'success', 'warning', 'danger'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTypeFilter(filter)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-medium capitalize transition-all cursor-pointer shrink-0 ${
                typeFilter === filter
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {filter === 'all' ? 'Todos' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/80">
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No hay eventos registrados que coincidan con la búsqueda.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 hover:bg-slate-900/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="text-slate-500 text-[11px] shrink-0 font-bold">
                    [{log.timestamp}]
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-bold">
                      {log.username}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden md:inline">
                      ({log.userRole})
                    </span>
                  </div>

                  <span className="text-slate-300 text-xs leading-relaxed">
                    {log.action}
                  </span>
                </div>

                <div className="shrink-0 self-end sm:self-auto">
                  {getTypeBadge(log.type)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 px-1 pt-1">
        <span>Mostrando {filteredLogs.length} de {logs.length} entradas</span>
        <span>Persistencia habilitada (localStorage)</span>
      </div>

    </div>
  );
};
