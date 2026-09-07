export type UserRole = 'admin' | 'operador' | 'supervisor';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  avatarColor: string;
}

export type OperationMode = 'manual' | 'auto' | 'estop';

export interface ActuatorState {
  pumpOn: boolean;
  power: number; // 0 to 100
  mode: OperationMode;
}

export interface SensorData {
  temperature: number; // in °C
  tankLevel: number; // in %
  pressure: number; // in PSI
  flowRate: number; // in L/min
  isHighTempAlert: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  username: string;
  userRole: string;
  action: string;
  type: 'info' | 'warning' | 'danger' | 'success';
}
