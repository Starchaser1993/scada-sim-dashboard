import React from 'react';
import { useControl } from '../context/ControlContext';
import { Power, Gauge, ShieldAlert, Sliders, Cpu, AlertTriangle, RotateCcw } from 'lucide-react';


export const Actuators: React.FC = () => {
  const { actuators, togglePump, setPower, setMode, resetEmergencyStop } = useControl();

  const isEstop = actuators.mode === 'estop';

  return (
    <div className="scada-panel rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Panel de Actuadores
            </h2>
            <p className="text-xs text-slate-400 font-mono">Control directo de bombas, potencia y modos</p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
          ACTUADORES: <span className="text-cyan-400 font-bold">3 DISPONIBLES</span>
        </span>
      </div>

      {/* Mode Selector Pill Tabs */}
      <div>
        <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2.5">
          Modo de Operación del Sistema
        </label>
        <div className="grid grid-cols-3 gap-2.5 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('manual')}
            disabled={isEstop}
            className={`py-2.5 px-3 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              actuators.mode === 'manual'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Manual
          </button>

          <button
            type="button"
            onClick={() => setMode('auto')}
            disabled={isEstop}
            className={`py-2.5 px-3 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              actuators.mode === 'auto'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" /> Automático
          </button>

          <button
            type="button"
            onClick={() => setMode('estop')}
            className={`py-2.5 px-3 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              actuators.mode === 'estop'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 border border-rose-400/30 animate-pulse'
                : 'text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> E-STOP
          </button>
        </div>
      </div>

      {/* Emergency Stop Warning Banner if active */}
      {isEstop && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs font-mono space-y-2 animate-pulse">
          <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            PARADA DE EMERGENCIA ACTIVA
          </div>
          <p className="text-slate-300">
            Los actuadores han sido bloqueados y la bomba se ha detenido por seguridad. Para reactivar el control, presione Rearmar Sistema.
          </p>
          <button
            onClick={resetEmergencyStop}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Rearmar Sistema (Reset E-STOP)
          </button>
        </div>
      )}

      {/* Actuator 1: Main Pump Switch On/Off */}
      <div className={`p-4 rounded-xl bg-slate-900/90 border transition-all ${
        actuators.pumpOn ? 'border-emerald-500/40 scada-glow-green' : 'border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase block">Actuador 01</span>
            <span className="font-bold text-sm text-slate-100 font-mono">Bomba Principal / Motor Hydraulic-A</span>
          </div>

          {/* LED Visual Indicator */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                actuators.pumpOn
                  ? 'bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse'
                  : 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'
              }`}
            />
            <span className={actuators.pumpOn ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {actuators.pumpOn ? 'VERDE (ACTIVO)' : 'ROJO (APAGADO)'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 font-mono">
            {actuators.pumpOn ? 'Motor generando caudal hidráulico.' : 'Bomba en estado de reposo.'}
          </div>

          <button
            type="button"
            onClick={togglePump}
            disabled={isEstop}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              actuators.pumpOn
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <Power className="w-4 h-4" />
            {actuators.pumpOn ? 'APAGAR BOMBA' : 'ENCENDER BOMBA'}
          </button>
        </div>
      </div>

      {/* Actuator 2: Power / Speed Slider (0 - 100%) */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase block">Actuador 02</span>
            <span className="font-bold text-sm text-slate-100 font-mono">Controlador VFD de Potencia / Velocidad</span>
          </div>

          <div className="text-right">
            <span className="text-xl font-mono font-extrabold text-cyan-400">
              {actuators.power}%
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar representation */}
        <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400"
            style={{ width: `${actuators.power}%` }}
          />
        </div>

        {/* Range Slider */}
        <div className="pt-2">
          <input
            type="range"
            min="0"
            max="100"
            value={actuators.power}
            onChange={(e) => setPower(Number(e.target.value))}
            disabled={isEstop || !actuators.pumpOn}
            className="w-full accent-cyan-400 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed h-2 rounded-lg bg-slate-950"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>0% (PARADA)</span>
            <span>25%</span>
            <span>50% (MEDIO)</span>
            <span>75%</span>
            <span>100% (MÁXIMO)</span>
          </div>
        </div>

        {/* Quick Power Presets */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 shrink-0">Presets:</span>
          {[0, 25, 50, 75, 100].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setPower(val)}
              disabled={isEstop || !actuators.pumpOn}
              className={`flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition-all cursor-pointer disabled:opacity-30 ${
                actuators.power === val ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold' : ''
              }`}
            >
              {val}%
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
