import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, User as UserIcon, Activity, AlertCircle, ArrowRight, Cpu, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loginAsMockUser, mockUsers } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = login(username, password);
    if (!result.success) {
      setError(result.error || 'Credenciales no válidas');
    }
  };

  const handleQuickLogin = (u: string) => {
    setError(null);
    const result = loginAsMockUser(u);
    if (!result.success) {
      setError(result.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 scada-grid-bg relative overflow-hidden">
      {/* Dynamic ambient lighting backdrop */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid md:grid-cols-12 gap-8 z-10">
        
        {/* Left Side: SCADA Presentation Card */}
        <div className="md:col-span-5 scada-panel rounded-2xl p-8 border border-slate-800 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Cpu className="w-48 h-48 text-cyan-400" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium mb-6">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              SISTEMA SCADA v2.4 ONLINE
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">
              Simulador de Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Industrial</span>
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Plataforma web SPA para monitoreo de procesos, control de actuadores, gestión de sensores en tiempo real y bitácora de eventos para 4 usuarios.
            </p>
          </div>

          {/* Quick specs pill */}
          <div className="space-y-3 font-mono text-xs text-slate-400 border-t border-slate-800/80 pt-6">
            <div className="flex items-center justify-between">
              <span>ESTADO DE PLANTA:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> OPERATIVA
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>USUARIOS PERMITIDOS:</span>
              <span className="text-cyan-400 font-semibold">4 CUENTAS MOCK</span>
            </div>
            <div className="flex items-center justify-between">
              <span>FRECUENCIA SENSORES:</span>
              <span className="text-slate-300">3.0 SEGUNDOS</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form & Quick Access */}
        <div className="md:col-span-7 space-y-6">
          <div className="scada-panel rounded-2xl p-8 border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  Iniciar Sesión
                </h2>
                <p className="text-xs text-slate-400">Ingrese sus credenciales de operador o seleccione un usuario de prueba.</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Error de autenticación</span>
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej: operador1"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer font-mono text-sm tracking-wide"
              >
                INGRESAR AL PANEL DE CONTROL
              </button>
            </form>
          </div>

          {/* Quick access mock user selector */}
          <div className="scada-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Usuarios Predefinidos (1-Click Login)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {mockUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user.username)}
                  className="group p-3 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 text-left transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${user.avatarColor}`} />
                    <span className="font-mono text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                      {user.username}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 truncate">{user.name}</div>

                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1.5 border-t border-slate-800/80">
                    <span className="truncate">{user.roleLabel}</span>
                    <span className="text-slate-400 group-hover:text-cyan-400 flex items-center gap-1 shrink-0 ml-1 font-bold">
                      Ingresar <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
