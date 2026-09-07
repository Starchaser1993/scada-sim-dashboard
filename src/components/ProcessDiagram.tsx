import React from 'react';
import { useControl } from '../context/ControlContext';
import { Power, Flame, ArrowRight, Cpu } from 'lucide-react';


export const ProcessDiagram: React.FC = () => {
  const { actuators, sensors } = useControl();

  const isPumpActive = actuators.pumpOn && actuators.mode !== 'estop';
  const isHighTemp = sensors.temperature > 80;

  return (
    <div className="scada-panel rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Esquema de Proceso SCADA
            </h2>
            <p className="text-xs text-slate-400 font-mono">Diagrama de flujo hidráulico y térmico en vivo</p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
          STATUS: <span className={isPumpActive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            {isPumpActive ? 'FLUIDO EN CIRCULACIÓN' : 'SISTEMA DETENIDO'}
          </span>
        </span>
      </div>

      {/* Process Schematic Graphic */}
      <div className="relative p-6 rounded-xl bg-slate-950/90 border border-slate-800 min-h-[220px] flex items-center justify-between gap-4 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 scada-grid-bg opacity-40 pointer-events-none" />

        {/* Node 1: Water Tank */}
        <div className="z-10 flex flex-col items-center gap-2">
          <div className="w-24 h-32 rounded-xl border-2 border-slate-700 bg-slate-900/90 p-1 relative overflow-hidden flex flex-col justify-end shadow-lg">
            <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-300 font-bold z-10">
              TANQUE T-101
            </div>

            {/* Liquid Fill animation */}
            <div
              className="w-full bg-gradient-to-t from-cyan-600 to-teal-400 rounded-b-lg transition-all duration-500 relative"
              style={{ height: `${sensors.tankLevel}%` }}
            >
              {isPumpActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-200/60 animate-pulse" />
              )}
            </div>

            <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-mono font-bold text-white shadow-sm z-10">
              {sensors.tankLevel}%
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Depósito Principal</span>
        </div>

        {/* Pipeline 1: Tank to Pump */}
        <div className="flex-1 flex items-center relative">
          <div className={`h-2.5 w-full rounded-full transition-all ${
            isPumpActive ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_#06b6d4]' : 'bg-slate-800'
          }`} />
          {isPumpActive && (
            <div className="absolute inset-0 flex items-center justify-around">
              <ArrowRight className="w-3.5 h-3.5 text-white animate-ping" />
              <ArrowRight className="w-3.5 h-3.5 text-white animate-ping" />
            </div>
          )}
        </div>

        {/* Node 2: Main Pump / Motor */}
        <div className="z-10 flex flex-col items-center gap-2">
          <div className={`w-20 h-20 rounded-full border-2 p-2 flex flex-col items-center justify-center transition-all ${
            isPumpActive
              ? 'border-emerald-500 bg-emerald-950/40 scada-glow-green'
              : 'border-rose-500 bg-rose-950/20 shadow-none'
          }`}>
            <Power className={`w-7 h-7 ${
              isPumpActive ? 'text-emerald-400 animate-spin-slow' : 'text-rose-500'
            }`} />
            <span className="text-[9px] font-mono font-bold mt-1 text-slate-300">
              {actuators.power}% RPM
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Bomba Hydro-A</span>
        </div>

        {/* Pipeline 2: Pump to Thermal Reactor */}
        <div className="flex-1 flex items-center relative">
          <div className={`h-2.5 w-full rounded-full transition-all ${
            isPumpActive ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_#3b82f6]' : 'bg-slate-800'
          }`} />
          {isPumpActive && (
            <div className="absolute inset-0 flex items-center justify-around">
              <ArrowRight className="w-3.5 h-3.5 text-white animate-ping" />
              <ArrowRight className="w-3.5 h-3.5 text-white animate-ping" />
            </div>
          )}
        </div>

        {/* Node 3: Reactor Vessel with Temperature indicator */}
        <div className="z-10 flex flex-col items-center gap-2">
          <div className={`w-24 h-32 rounded-xl border-2 p-2 flex flex-col justify-between transition-all ${
            isHighTemp
              ? 'border-rose-500 bg-rose-950/60 scada-glow-red animate-pulse-fast'
              : 'border-indigo-500/60 bg-slate-900/90'
          }`}>
            <div className="flex justify-between items-center text-[9px] font-mono">
              <span className="text-slate-300 font-bold">REACTOR R-20</span>
              <Flame className={`w-3.5 h-3.5 ${isHighTemp ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
            </div>

            <div className="text-center my-auto">
              <div className={`text-xl font-mono font-extrabold ${
                isHighTemp ? 'text-rose-400' : 'text-cyan-400'
              }`}>
                {sensors.temperature}°C
              </div>
              <div className="text-[9px] font-mono text-slate-400">
                {isHighTemp ? 'SOBRECALENTADO' : 'ESTABLE'}
              </div>
            </div>

            <div className="text-[9px] font-mono text-slate-400 border-t border-slate-800 pt-1 text-center">
              {sensors.pressure} PSI
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Reactor Térmico</span>
        </div>

      </div>
    </div>
  );
};
