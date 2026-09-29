import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ActuatorState, SensorData, LogEntry, OperationMode } from '../types';
import { useAuth } from './AuthContext';


interface ControlContextType {
  actuators: ActuatorState;
  sensors: SensorData;
  logs: LogEntry[];
  togglePump: () => void;
  setPower: (value: number) => void;
  setMode: (mode: OperationMode) => void;
  triggerEmergencyStop: () => void;
  resetEmergencyStop: () => void;
  clearLogs: () => void;
  dismissHighTempAlert: () => void;
}

const ControlContext = createContext<ControlContextType | undefined>(undefined);

const LOGS_STORAGE_KEY = 'scada_sim_logs';

export const ControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [actuators, setActuators] = useState<ActuatorState>({
    pumpOn: true,
    power: 65,
    mode: 'manual',
  });

  const [sensors, setSensors] = useState<SensorData>({
    temperature: 42.5,
    tankLevel: 68.0,
    pressure: 3.2,
    flowRate: 45.5,
    isHighTempAlert: false,
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback initial log
    }
    return [
      {
        id: 'log-init',
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        username: 'Sistema',
        userRole: 'Sistema SCADA',
        action: 'Inicialización de la plataforma de simulación de control industrial',
        type: 'info',
      },
    ];
  });

  // Save logs to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 100))); // Keep last 100
    } catch (e) {
      console.error('Error saving logs:', e);
    }
  }, [logs]);

  // Helper to append logs
  const addLog = useCallback(
    (actionStr: string, type: LogEntry['type'] = 'info') => {
      const timeStr = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const newEntry: LogEntry = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        timestamp: timeStr,
        username: currentUser ? currentUser.username : 'desconocido',
        userRole: currentUser ? currentUser.roleLabel : 'Usuario',
        action: actionStr,
        type,
      };

      setLogs((prev) => [newEntry, ...prev]);
    },
    [currentUser]
  );

  // Keep ref of actuators so setInterval callback always sees fresh state
  const actuatorsRef = useRef(actuators);
  useEffect(() => {
    actuatorsRef.current = actuators;
  }, [actuators]);

  // 3-second interval for automatic sensor variation
  useEffect(() => {
    const timer = setInterval(() => {
      setSensors((prev) => {
        const currentActuators = actuatorsRef.current;
        let newTemp = prev.temperature;
        let newLevel = prev.tankLevel;
        let newPressure = prev.pressure;
        let newFlow = prev.flowRate;

        if (currentActuators.mode === 'estop') {
          // Cooling down in E-STOP
          newTemp = Math.max(22.0, Number((prev.temperature - 1.2).toFixed(1)));
          newLevel = Number((prev.tankLevel).toFixed(1));
          newFlow = 0;
          newPressure = Math.max(0, Number((prev.pressure - 0.5).toFixed(1)));
        } else if (currentActuators.mode === 'auto') {
          // Automatic mode control logic
          if (prev.tankLevel < 30 && !currentActuators.pumpOn) {
            setActuators((a) => ({ ...a, pumpOn: true, power: 75 }));
            addLog('Modo Automático: Activó bomba por nivel bajo de agua (< 30%)', 'info');
          } else if (prev.tankLevel > 88 && currentActuators.pumpOn) {
            setActuators((a) => ({ ...a, pumpOn: false }));
            addLog('Modo Automático: Apagó bomba por nivel alto de agua (> 88%)', 'info');
          }

          // Fluctuating values
          const tempVariation = (Math.random() * 2 - 0.8) * (currentActuators.pumpOn ? 1.2 : -0.5);
          newTemp = Math.max(15, Math.min(105, Number((prev.temperature + tempVariation).toFixed(1))));

          const levelDelta = currentActuators.pumpOn
            ? (currentActuators.power / 100) * 2.5
            : -1.2;
          newLevel = Math.max(0, Math.min(100, Number((prev.tankLevel + levelDelta).toFixed(1))));

          newFlow = currentActuators.pumpOn ? Number(((currentActuators.power * 0.8) + (Math.random() * 4 - 2)).toFixed(1)) : 0;
          newPressure = currentActuators.pumpOn ? Number((1.5 + (currentActuators.power / 100) * 3 + (Math.random() * 0.2 - 0.1)).toFixed(1)) : 0.2;
        } else {
          // Manual Mode sensor simulation
          // Temperature depends on pump state & power + noise
          const heatFactor = currentActuators.pumpOn ? (currentActuators.power / 100) * 2.0 - 0.3 : -1.0;
          const randomNoise = (Math.random() * 3 - 1.2);
          newTemp = Math.max(18, Math.min(105, Number((prev.temperature + heatFactor + randomNoise).toFixed(1))));

          // Level variation
          const levelDelta = currentActuators.pumpOn
            ? (currentActuators.power / 100) * 1.8
            : -0.8;
          newLevel = Math.max(0, Math.min(100, Number((prev.tankLevel + levelDelta).toFixed(1))));

          newFlow = currentActuators.pumpOn ? Number(((currentActuators.power * 0.75) + (Math.random() * 3 - 1.5)).toFixed(1)) : 0;
          newPressure = currentActuators.pumpOn ? Number((1.2 + (currentActuators.power / 100) * 2.8).toFixed(1)) : 0.1;
        }

        // Temperature Alert (> 80°C)
        const isHighTemp = newTemp > 80.0;
        if (isHighTemp && !prev.isHighTempAlert) {
          addLog(`¡ALERTA CRÍTICA! La temperatura superó los 80°C (${newTemp}°C)`, 'danger');
        }

        return {
          temperature: newTemp,
          tankLevel: newLevel,
          pressure: newPressure,
          flowRate: newFlow,
          isHighTempAlert: isHighTemp,
        };
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [addLog]);

  // Actuator Handlers
  const togglePump = () => {
    if (currentUser?.role === 'supervisor') return;
    if (actuators.mode === 'estop') return;

    setActuators((prev) => {
      const nextState = !prev.pumpOn;
      const userStr = currentUser ? currentUser.username : 'Usuario';
      addLog(
        `Usuario ${userStr} ${nextState ? 'ACTIVÓ' : 'APAGÓ'} la bomba principal`,
        nextState ? 'success' : 'warning'
      );
      return { ...prev, pumpOn: nextState };
    });
  };

  const setPower = (value: number) => {
    if (currentUser?.role === 'supervisor') return;
    if (actuators.mode === 'estop') return;
    const clamped = Math.max(0, Math.min(100, Math.round(value)));

    setActuators((prev) => {
      if (prev.power === clamped) return prev;
      const userStr = currentUser ? currentUser.username : 'Usuario';
      addLog(`Usuario ${userStr} cambió la potencia/velocidad a ${clamped}%`, 'info');
      return { ...prev, power: clamped };
    });
  };

  const setMode = (mode: OperationMode) => {
    if (currentUser?.role === 'supervisor') return;

    if (mode === 'auto' && currentUser?.role !== 'admin') {
      const userStr = currentUser ? currentUser.username : 'Usuario';
      addLog(`[ACCESO DENEGADO] Usuario ${userStr} intentó activar modo Automático (requiere Administrador)`, 'warning');
      return;
    }

    if (mode === 'estop') {
      triggerEmergencyStop();
      return;
    }

    setActuators((prev) => {
      const userStr = currentUser ? currentUser.username : 'Usuario';
      const modeNames = { manual: 'Manual', auto: 'Automático', estop: 'Parada de Emergencia' };
      addLog(`Usuario ${userStr} cambió el modo de operación a ${modeNames[mode]}`, 'info');
      return { ...prev, mode };
    });
  };

  const triggerEmergencyStop = () => {
    if (currentUser?.role === 'supervisor') return;
    setActuators({
      pumpOn: false,
      power: 0,
      mode: 'estop',
    });
    const userStr = currentUser ? currentUser.username : 'Usuario';
    addLog(`¡PARADA DE EMERGENCIA! Usuario ${userStr} activó la Parada de Emergencia (E-STOP)`, 'danger');
  };

  const resetEmergencyStop = () => {
    if (currentUser?.role === 'supervisor') return;
    setActuators({
      pumpOn: false,
      power: 0,
      mode: 'manual',
    });
    const userStr = currentUser ? currentUser.username : 'Usuario';
    addLog(`Usuario ${userStr} rearmó el sistema tras la Parada de Emergencia`, 'success');
  };

  const clearLogs = () => {
    if (currentUser?.role === 'supervisor') return;
    setLogs([]);
    addLog('Se limpió el registro de eventos', 'info');
  };

  const dismissHighTempAlert = () => {
    setSensors((prev) => ({ ...prev, isHighTempAlert: false }));
  };

  return (
    <ControlContext.Provider
      value={{
        actuators,
        sensors,
        logs,
        togglePump,
        setPower,
        setMode,
        triggerEmergencyStop,
        resetEmergencyStop,
        clearLogs,
        dismissHighTempAlert,
      }}
    >
      {children}
    </ControlContext.Provider>
  );
};

export const useControl = () => {
  const context = useContext(ControlContext);
  if (!context) {
    throw new Error('useControl debe ser usado dentro de un ControlProvider');
  }
  return context;
};
