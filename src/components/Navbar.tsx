import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useControl } from '../context/ControlContext';
import { ConnectedUsersBadge } from './ConnectedUsersBadge';
import { LogOut, Activity, Clock, ShieldAlert, Cpu, UserCheck, Eye } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { actuators } = useControl();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      setTime(new Date().toLocaleTimeString('es-ES'));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return null;

  const getRolePermissionBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
          Control Total
        </span>
      );
    }
    if (role === 'supervisor') {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
          <Eye className="w-3 h-3" /> Solo Lectura
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
        Control (Sin Auto)
      </span>
    );
  };

  return (
    <header className="scada-panel sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & System Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-100 tracking-tight text-base font-mono">
                SCADA <span className="text-cyan-400">CONTROL</span> HUB
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                v2.4
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              {actuators.mode === 'estop' ? (
                <span className="text-rose-400 flex items-center gap-1.5 font-bold animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5" /> ESTADO: PARADA DE EMERGENCIA
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 animate-pulse" /> SISTEMA ONLINE
                </span>
              )}
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3 text-slate-500" /> {time}
              </span>
            </div>
          </div>
        </div>

        {/* Center Mode Status Pill & Connected Users Counter */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
            <span className="text-slate-400">MODO ACTUAL:</span>
            {actuators.mode === 'manual' && (
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                MANUAL
              </span>
            )}
            {actuators.mode === 'auto' && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> AUTOMÁTICO
              </span>
            )}
            {actuators.mode === 'estop' && (
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold animate-pulse">
                PARADA EMERGENCIA
              </span>
            )}
          </div>
        </div>

        {/* User Profile, Connected Users Counter & Logout */}
        <div className="flex items-center gap-3">
          <ConnectedUsersBadge />

          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${currentUser.avatarColor} p-0.5 shadow-md flex items-center justify-center text-white font-bold font-mono text-sm`}>
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-200">{currentUser.name}</span>
                {getRolePermissionBadge(currentUser.role)}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-cyan-400" />
                {currentUser.roleLabel}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer shadow-sm"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400" />
            <span className="hidden md:inline">Cerrar Sesión</span>
          </button>
        </div>

      </div>
    </header>
  );
};
