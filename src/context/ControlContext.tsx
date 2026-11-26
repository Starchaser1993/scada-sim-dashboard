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

  // 1-second interval for real-time sensor & physics simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSensors((prev) => {
        const currentActuators = actuatorsRef.current;
        let newTemp = prev.temperature;
        let newLevel = prev.tankLevel;
        let newPressure = prev.pressure;
        let newFlow = prev.flowRate;

        if (currentActuators.mode === 'estop') {
          // Rapid cooling down in E-STOP
          const coolDelta = Math.min(2.2, Math.max(0.8, (prev.temperature - 22.0) * 0.08));
          newTemp = Math.max(22.0, Number((prev.temperature - coolDelta).toFixed(1)));

          // Tank draining 1% per second in E-STOP
          const outflow = prev.tankLevel > 0 ? 1.0 : 0;
          newLevel = Math.max(0, Number((prev.tankLevel - outflow).toFixed(1)));
          newFlow = 0;
          newPressure = Math.max(0, Number((prev.pressure - 0.2).toFixed(1)));
        } else {
          // Automatic mode threshold logic
          if (currentActuators.mode === 'auto') {
            if (prev.tankLevel <= 30 && !currentActuators.pumpOn) {
              setActuators((a) => ({ ...a, pumpOn: true, power: 75 }));
              addLog('Modo Automático: Activó bomba por nivel bajo de agua (≤ 30%) a 75% de potencia', 'info');
            } else if (prev.tankLevel >= 88 && currentActuators.pumpOn) {
              setActuators((a) => ({ ...a, pumpOn: false, power: 0 }));
              addLog('Modo Automático: Apagó bomba por nivel alto de agua (≥ 88%) para evitar desborde (Potencia 0%)', 'info');
            }
          }

          const isPumping = currentActuators.pumpOn;

          // Tank Level simulation (1-second continuous physics):
          // - Natural continuous outflow / drainage: 1.0% per second
          // - Inflow rate: (power / 50) * 1.0% per second (0% at 0%, 0.5% at 25%, 1.0% at 50%, 1.5% at 75%, 2.0% at 100%)
          // Net change:
          //   * Pump OFF or 0%: -1.0% / s (drops 1% every 1s)
          //   * Power 25%: -0.5% / s (drops slowly)
          //   * Power 50%: 0.0% / s (level is maintained)
          //   * Power 75%: +0.5% / s (rises slowly)
          //   * Power 100%: +1.0% / s (rises noticeably faster)
          const outflow = prev.tankLevel > 0 ? 1.0 : 0;
          const inflow = isPumping ? (currentActuators.power / 50) * 1.0 : 0;
          const levelDelta = inflow - outflow;
          newLevel = Math.max(0, Math.min(100, Number((prev.tankLevel + levelDelta).toFixed(1))));

          // Thermal simulation based on power and pump status (1s step)
          const AMBIENT_TEMP = 22.0;
          const targetTemp = isPumping
            ? AMBIENT_TEMP + (currentActuators.power / 100) * 68.0
            : AMBIENT_TEMP;

          const diff = targetTemp - prev.temperature;
          let tempDelta = 0;
          if (diff < 0) {
            // Rapid cooling when reducing power/speed or stopping pump
            const coolRate = Math.min(2.0, Math.max(0.7, Math.abs(diff) * 0.07));
            tempDelta = -coolRate + (Math.random() * 0.14 - 0.07);
          } else {
            // Progressive heating up
            const heatRate = Math.min(1.2, Math.max(0.25, diff * 0.035));
            tempDelta = heatRate + (Math.random() * 0.14 - 0.07);
          }
          newTemp = Math.max(18.0, Math.min(105.0, Number((prev.temperature + tempDelta).toFixed(1))));

          // Flow and Pressure
          newFlow = isPumping
            ? Number(((currentActuators.power * 0.75) + (Math.random() * 1.0 - 0.5)).toFixed(1))
            : 0;
          newPressure = isPumping
            ? Number((1.2 + (currentActuators.power / 100) * 2.8 + (Math.random() * 0.04 - 0.02)).toFixed(1))
            : Math.max(0.1, Number((prev.pressure - 0.2).toFixed(1)));
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
    }, 1000);

    return () => clearInterval(timer);
  }, [addLog]);

  // Actuator Handlers
  const togglePump = () => {
    if (currentUser?.role === 'supervisor') return;
    if (actuators.mode === 'estop' || actuators.mode === 'auto') return;

    setActuators((prev) => {
      const nextState = !prev.pumpOn;
      const userStr = currentUser ? currentUser.username : 'Usuario';
      addLog(
        `Usuario ${userStr} ${nextState ? 'ACTIVÓ' : 'APAGÓ'} la bomba principal`,
        nextState ? 'success' : 'warning'
      );
      if (!nextState) {
        // Immediate cooling drop when pump is turned off
        setSensors((s) => {
          const newTemp = Math.max(22.0, Number((s.temperature - 2.0).toFixed(1)));
          return {
            ...s,
            temperature: newTemp,
            isHighTempAlert: newTemp > 80.0,
          };
        });
        return { ...prev, pumpOn: false, power: 0 };
      } else {
        const restoredPower = prev.power > 0 ? prev.power : 65;
        return { ...prev, pumpOn: true, power: restoredPower };
      }
    });
  };

  const setPower = (value: number) => {
    if (currentUser?.role === 'supervisor') return;
    if (actuators.mode === 'estop' || actuators.mode === 'auto') return;
    const clamped = Math.max(0, Math.min(100, Math.round(value)));

    setActuators((prev) => {
      if (prev.power === clamped) return prev;
      const oldPower = prev.power;
      const userStr = currentUser ? currentUser.username : 'Usuario';
      addLog(`Usuario ${userStr} cambió la potencia/velocidad a ${clamped}%`, 'info');

      // Immediate visual cooling feedback when power is lowered
      if (clamped < oldPower) {
        const powerDrop = oldPower - clamped;
        const immediateDrop = Number(((powerDrop / 100) * 3.0).toFixed(1));
        if (immediateDrop > 0) {
          setSensors((s) => {
            const newTemp = Math.max(22.0, Number((s.temperature - immediateDrop).toFixed(1)));
            return {
              ...s,
              temperature: newTemp,
              isHighTempAlert: newTemp > 80.0,
            };
          });
        }
      }

      return { ...prev, power: clamped };
    });
  };

  const setMode = (mode: OperationMode) => {
    if (currentUser?.role === 'supervisor') return;

    if (mode === 'estop') {
      triggerEmergencyStop();
      return;
    }

    if (mode === 'auto') {
      if (currentUser?.role !== 'admin') return;
      const userStr = currentUser ? currentUser.username : 'Usuario';
      const shouldPump = sensors.tankLevel < 88;
      addLog(
        `Usuario ${userStr} activó el Modo Automático. PLC tomó control autónomo (${shouldPump ? 'Bomba activada al 75% hasta alcanzar 88%' : 'Nivel ≥ 88%, bomba en espera de drenaje hasta 30%'})`,
        'info'
      );
      setActuators((prev) => ({
        ...prev,
        mode: 'auto',
        pumpOn: shouldPump,
        power: shouldPump ? 75 : 0,
      }));
      return;
    }

    setActuators((prev) => {
      const userStr = currentUser ? currentUser.username : 'Usuario';
      addLog(`Usuario ${userStr} cambió el modo de operación a Manual (Control de actuadores desbloqueado)`, 'info');
      return { ...prev, mode: 'manual' };
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
    // Immediate emergency cooling response
    setSensors((s) => {
      const newTemp = Math.max(22.0, Number((s.temperature - 3.5).toFixed(1)));
      return {
        ...s,
        temperature: newTemp,
        isHighTempAlert: newTemp > 80.0,
      };
    });
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
