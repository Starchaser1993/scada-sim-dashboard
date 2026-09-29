import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Wifi, ChevronDown, Shield, Sparkles, UserX } from 'lucide-react';

export const ConnectedUsersBadge: React.FC = () => {
  const { currentUser, connectedUsers, mockUsers, loginAsMockUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const connectedUsernames = new Set(connectedUsers.map((u) => u.username.toLowerCase()));

  // Categorize mock users
  const onlineList = mockUsers.filter((u) => connectedUsernames.has(u.username.toLowerCase()));
  const offlineList = mockUsers.filter((u) => !connectedUsernames.has(u.username.toLowerCase()));

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono transition-all cursor-pointer shadow-sm group"
        title="Ver usuarios conectados en tiempo real"
      >
        <div className="relative flex items-center justify-center">
          <Users className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 hidden sm:inline">Conectados:</span>
          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
            {connectedUsers.length}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Sesiones Activas SCADA
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
              {connectedUsers.length} de {mockUsers.length} Online
            </span>
          </div>

          <div className="p-3 space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar">
            
            {/* Online Users List */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 px-1">
                <span>🟢 En Línea ({onlineList.length})</span>
                <span className="text-[10px] text-slate-500">Sync en tiempo real</span>
              </div>

              <div className="space-y-1.5">
                {onlineList.map((user) => {
                  const isCurrent = currentUser?.username.toLowerCase() === user.username.toLowerCase();
                  const connectedData = connectedUsers.find((c) => c.username.toLowerCase() === user.username.toLowerCase());

                  return (
                    <div
                      key={user.id}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-100 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${user.avatarColor} p-0.5 shrink-0 flex items-center justify-center text-white font-bold font-mono text-xs shadow`}>
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="truncate text-left">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-semibold text-xs truncate">{user.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono px-1.5 py-0.1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shrink-0">
                                TÚ
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-1">
                            <Shield className="w-3 h-3 text-slate-500 shrink-0" />
                            {user.roleLabel}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono text-[10px]">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Online
                        </span>
                        {connectedData?.connectedAt && (
                          <div className="text-slate-500">{connectedData.connectedAt}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Offline Users List */}
            {offlineList.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 px-1">
                  <span>⚪ Desconectados ({offlineList.length})</span>
                </div>

                <div className="space-y-1.5">
                  {offlineList.map((user) => (
                    <div
                      key={user.id}
                      className="p-2.5 rounded-xl border border-slate-900 bg-slate-900/30 text-slate-400 flex items-center justify-between opacity-75 hover:opacity-100 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 shrink-0 flex items-center justify-center text-slate-400 font-bold font-mono text-xs border border-slate-700">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="truncate text-left">
                          <div className="font-medium text-xs text-slate-300 truncate">{user.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">@{user.username} &bull; {user.roleLabel}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <UserX className="w-3 h-3 text-slate-600" /> Offline
                        </span>
                        
                        {/* Quick switch button for demo testing */}
                        <button
                          onClick={() => loginAsMockUser(user.username)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-900/50 text-slate-300 hover:text-cyan-300 text-[10px] font-mono border border-slate-700 hover:border-cyan-500/40 transition-colors"
                          title={`Cambiar a sesión de ${user.username}`}
                        >
                          Cambiar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer tip for multi-tab testing */}
            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-300 font-semibold block">Sincronización Multipestaña</span>
                Abre otra pestaña del navegador e inicia sesión con otra cuenta para ver cómo el contador y la lista se actualizan al instante.
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
