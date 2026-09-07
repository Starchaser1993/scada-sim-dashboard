import React from 'react';
import { Navbar } from './Navbar';
import { Actuators } from './Actuators';
import { Sensors } from './Sensors';
import { ProcessDiagram } from './ProcessDiagram';
import { EventLog } from './EventLog';
import { useControl } from '../context/ControlContext';
import { Activity, CheckCircle2, Cpu } from 'lucide-react';


export const Dashboard: React.FC = () => {
  const { actuators, sensors } = useControl();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 scada-grid-bg flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Quick Plant Summary Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="scada-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Estado de Bomba</span>
              <span className={`text-sm font-mono font-bold ${
                actuators.pumpOn ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {actuators.pumpOn ? 'ENCENDIDA' : 'APAGADA'}
              </span>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              actuators.pumpOn ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'
            }`} />
          </div>

          <div className="scada-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Potencia VFD</span>
              <span className="text-sm font-mono font-bold text-cyan-400">
                {actuators.power}%
              </span>
            </div>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="scada-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Temperatura Reactor</span>
              <span className={`text-sm font-mono font-bold ${
                sensors.temperature > 80 ? 'text-rose-400 animate-pulse' : 'text-slate-200'
              }`}>
                {sensors.temperature}°C
              </span>
            </div>
            <Activity className={`w-4 h-4 ${
              sensors.temperature > 80 ? 'text-rose-400 animate-bounce' : 'text-cyan-400'
            }`} />
          </div>

          <div className="scada-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Nivel Tanque</span>
              <span className="text-sm font-mono font-bold text-teal-300">
                {sensors.tankLevel}%
              </span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>

        </div>

        {/* Top Section: Actuators + Sensors Controls */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Actuators />
          <Sensors />
        </div>

        {/* Middle Section: Process Diagram Schematic */}
        <ProcessDiagram />

        {/* Bottom Section: Event Audit Log */}
        <EventLog />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs font-mono text-slate-500">
        Plataforma de Simulación SCADA Industrial v2.4 &bull; Proyecto Universitario de Automatización &bull; React + TypeScript + Vite + Tailwind CSS
      </footer>
    </div>
  );
};
