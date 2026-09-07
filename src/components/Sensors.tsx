import React from 'react';
import { useControl } from '../context/ControlContext';
import { Thermometer, Waves, Activity, AlertTriangle, ShieldAlert, RefreshCw, Gauge } from 'lucide-react';

export const Sensors: React.FC = () => {
  const { sensors, dismissHighTempAlert } = useControl();

  const isHighTemp = sensors.temperature > 80.0 || sensors.isHighTempAlert;

  return (
    <div className="scada-panel rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Monitoreo de Sensores
            </h2>
            <p className="text-xs text-slate-400 font-mono">Telemetría en tiempo real (Intervalo 3.0s)</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/50">
          <RefreshCw className="w-3 h-3 animate-spin-slow" />
          EN VIVO
        </div>
      </div>

      {/* Prominent High Temperature Warning Banner (> 80°C) */}
      {isHighTemp && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/90 via-rose-900/80 to-amber-950/90 border-2 border-rose-500/80 text-rose-100 shadow-2xl scada-glow-red animate-pulse-fast space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 shadow-lg">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-base font-mono tracking-wide text-rose-200 uppercase">
                  ¡ALERTA CRÍTICA DE TEMPERATURA EXCESIVA!
                </h3>
                <p className="text-xs text-rose-300 font-mono">
                  La temperatura del reactor superó los <span className="underline font-bold">80°C</span> (Lectura actual: <span className="font-bold text-white text-sm">{sensors.temperature}°C</span>).
                </p>
              </div>
            </div>

            <button
              onClick={dismissHighTempAlert}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 border border-rose-500/50 text-white cursor-pointer transition-all shrink-0"
            >
              Reconocer
            </button>
          </div>

          <div className="text-[11px] font-mono text-rose-200/90 bg-rose-950/50 p-2.5 rounded-lg border border-rose-800/50 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            Acción sugerida: Reducir la potencia del motor o cambiar a modo Parada de Emergencia (E-STOP).
          </div>
        </div>
      )}

      {/* Main Sensors Grid */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Sensor 1: Temperature Gauge (°C) */}
        <div className={`p-5 rounded-xl bg-slate-900/90 border transition-all space-y-4 ${
          sensors.temperature > 80
            ? 'border-rose-500/80 scada-glow-red'
            : sensors.temperature > 65
            ? 'border-amber-500/40 scada-glow-amber'
            : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                sensors.temperature > 80 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Sensor ID: TEMP-01</span>
                <span className="font-mono text-xs font-bold text-slate-200">Temperatura Tanque</span>
              </div>
            </div>

            <span className={`text-2xl font-mono font-extrabold ${
              sensors.temperature > 80
                ? 'text-rose-400 animate-pulse'
                : sensors.temperature > 65
                ? 'text-amber-400'
                : 'text-cyan-400'
            }`}>
              {sensors.temperature}°C
            </span>
          </div>

          {/* Temperature Thermometer Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0°C</span>
              <span>50°C</span>
              <span className="text-rose-400 font-bold">ALERTA &gt; 80°C</span>
              <span>110°C</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800 overflow-hidden relative">
              {/* Alert threshold marker line */}
              <div className="absolute top-0 bottom-0 left-[72.7%] w-0.5 bg-rose-500 z-10" title="Límite 80°C" />
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  sensors.temperature > 80
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600'
                    : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400'
                }`}
                style={{ width: `${Math.min(100, (sensors.temperature / 110) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Rango Operativo: 10°C - 75°C</span>
            <span className={sensors.temperature > 80 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {sensors.temperature > 80 ? '¡SOBRECALENTAMIENTO!' : 'NORMAL'}
            </span>
          </div>
        </div>

        {/* Sensor 2: Tank Water Level (%) */}
        <div className={`p-5 rounded-xl bg-slate-900/90 border transition-all space-y-4 ${
          sensors.tankLevel < 20 || sensors.tankLevel > 90
            ? 'border-amber-500/40 scada-glow-amber'
            : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Sensor ID: LEV-02</span>
                <span className="font-mono text-xs font-bold text-slate-200">Nivel de Tanque</span>
              </div>
            </div>

            <span className="text-2xl font-mono font-extrabold text-cyan-400">
              {sensors.tankLevel}%
            </span>
          </div>

          {/* Liquid Height Tank Visual Representation */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0% (Vacío)</span>
              <span>50%</span>
              <span>100% (Lleno)</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-600 via-teal-400 to-emerald-400"
                style={{ width: `${sensors.tankLevel}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Volumen Estimado: {Math.round(sensors.tankLevel * 25)} Litros</span>
            <span className={
              sensors.tankLevel < 20
                ? 'text-amber-400 font-bold'
                : sensors.tankLevel > 88
                ? 'text-indigo-400 font-bold'
                : 'text-emerald-400 font-bold'
            }>
              {sensors.tankLevel < 20 ? 'NIVEL BAJO' : sensors.tankLevel > 88 ? 'NIVEL ALTO' : 'NIVEL ÓPTIMO'}
            </span>
          </div>
        </div>

      </div>

      {/* Extra SCADA telemetry: Pressure & Flow rate */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span>Presión de Sistema</span>
          </div>
          <span className="font-mono text-sm font-bold text-slate-200">
            {sensors.pressure} PSI
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Caudal Actual</span>
          </div>
          <span className="font-mono text-sm font-bold text-slate-200">
            {sensors.flowRate} L/min
          </span>
        </div>
      </div>

    </div>
  );
};
