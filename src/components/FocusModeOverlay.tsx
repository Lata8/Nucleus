/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Briefcase, 
  Clock, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  Lock, 
  ArrowRight,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { ToDoTask } from '../types';

interface FocusModeOverlayProps {
  tasks: ToDoTask[];
  onToggleTaskCompleted: (id: string) => void;
  simulatedTime: string; // HH:MM
  onDisableFocusMode: () => void; // Bypass trigger
}

export default function FocusModeOverlay({
  tasks,
  onToggleTaskCompleted,
  simulatedTime,
  onDisableFocusMode,
}: FocusModeOverlayProps) {
  // Filter for only work-related tasks
  const workTasks = tasks.filter(t => t.isWorkRelated);
  const completedWorkCount = workTasks.filter(t => t.completed).length;
  const progressPercent = workTasks.length > 0 
    ? Math.round((completedWorkCount / workTasks.length) * 100) 
    : 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 overflow-y-auto" id="focus-overlay-parent">
      <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute left-0 bottom-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6" id="focus-overlay-card">
        {/* Top visual warning lock */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20 mb-2 animate-pulse">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-amber-400 text-xs font-black uppercase tracking-widest flex items-center space-x-1 justify-center">
            <Zap className="w-3.5 h-3.5 text-amber-450" />
            <span>MODO ENFOQUE AUTOMATIZADO</span>
          </span>
          <h2 className="text-xl font-extrabold text-slate-100">Horario Laboral Activo</h2>
          <p className="text-xs text-slate-400 max-w-sm">
            Las finanzas y entrenamientos se bloquean dinámicamente según tu agenda laboral del día para proteger tu concentración.
          </p>
        </div>

        {/* Current status info bar */}
        <div className="flex items-center justify-around bg-slate-950 rounded-xl p-3 border border-slate-800/60 text-center text-xs">
          <div>
            <span className="text-slate-500 block text-[9.5px] uppercase">Hora de Oficina</span>
            <span className="font-mono font-bold text-slate-200 flex items-center justify-center space-x-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{simulatedTime} hs</span>
            </span>
          </div>
          <div className="w-px h-6 bg-slate-800"></div>
          <div>
            <span className="text-slate-500 block text-[9.5px] uppercase">Tareas Logradas</span>
            <span className="font-bold text-slate-200 mt-0.5 block font-mono">
              {completedWorkCount} / {workTasks.length}
            </span>
          </div>
        </div>

        {/* Tasks Checklist */}
        <div className="space-y-3">
          <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest block">Pendientes del Trabajo Hoy:</span>
          
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {workTasks.length === 0 ? (
              <p className="text-xs text-slate-500 text-center italic py-4">Felicidades, no tienes tareas del trabajo agregadas para hoy.</p>
            ) : (
              workTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => onToggleTaskCompleted(task.id)}
                  className={`flex items-start space-x-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    task.completed 
                      ? 'bg-slate-950/40 border-slate-800/80 opacity-50' 
                      : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                  }`}
                  id={`focus-task-item-${task.id}`}
                >
                  <button className="mt-0.5 text-slate-300">
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  <span className={`text-xs font-semibold ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.title}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Work Progress indicator bar */}
        {workTasks.length > 0 && (
          <div className="space-y-1.5 bg-slate-950/40 border border-slate-100 p-3 rounded-xl">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 leading-none">
              <span>Avance de Jornada:</span>
              <span className="text-emerald-400 font-mono">{progressPercent}% completado</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-350" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Emergency manual override action drawer */}
        <div className="pt-2 border-t border-slate-800/60 flex flex-col items-center justify-between gap-3 text-center">
          <p className="text-[10px] text-slate-600 leading-relaxed max-w-xs">
            Si necesitas agregar gastos del día o verificar una rutina con urgencia durante tu descanso laboral, puedes evadir temporalmente.
          </p>
          <button
            onClick={onDisableFocusMode}
            className="cursor-pointer bg-slate-800/60 border border-slate-700/60 text-slate-300 font-bold text-[10px] px-3 py-1.5 rounded-xl hover:bg-slate-700/80 hover:text-white transition-all inline-flex items-center space-x-1"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Evadir Enfoque (Urgencia)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
