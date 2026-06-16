/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Clock, 
  PlusCircle, 
  BarChart, 
  Frown, 
  Sliders, 
  HelpCircle,
  Briefcase,
  User,
  PieChart,
  Trash2
} from 'lucide-react';
import { TimeBlock, ToDoTask, FaltazoReason, Habit } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import HabitsModule from './HabitsModule';

interface ProductivityModuleProps {
  timeBlocks: TimeBlock[];
  tasks: ToDoTask[];
  onUpdateTimeBlocks: (newBlocks: TimeBlock[]) => void;
  onUpdateTasks: (newTasks: ToDoTask[]) => void;
  habits: Habit[];
  onUpdateHabits: (newHabits: Habit[]) => void;
}

export default function ProductivityModule({
  timeBlocks,
  tasks,
  onUpdateTimeBlocks,
  onUpdateTasks,
  habits,
  onUpdateHabits,
}: ProductivityModuleProps) {
  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<'blocks' | 'tasks' | 'habits' | 'audit'>('tasks');

  // Input states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskIsWork, setNewTaskIsWork] = useState(false);
  const [newTaskRecurrence, setNewTaskRecurrence] = useState<'unica' | 'diaria' | 'manana'>('unica');

  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockStart, setNewBlockStart] = useState('12:00');
  const [newBlockEnd, setNewBlockEnd] = useState('14:00');
  const [newBlockCat, setNewBlockCat] = useState<TimeBlock['category']>('Trabajo');

  // Task editing states
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');

  // Agenda Block editing states
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editBlockTitle, setEditBlockTitle] = useState('');
  const [editBlockStart, setEditBlockStart] = useState('12:00');
  const [editBlockEnd, setEditBlockEnd] = useState('14:00');
  const [editBlockCat, setEditBlockCat] = useState<TimeBlock['category']>('Trabajo');

  // Interactive Auditing State
  const [editingAuditId, setEditingAuditId] = useState<string | null>(null);
  const [actualMinutesInput, setActualMinutesInput] = useState('');

  // Selected faltazo popup helper
  const [unfinishedTaskId, setUnfinishedTaskId] = useState<string | null>(null);

  // --- Handlers ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const newTask: ToDoTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      completed: false,
      isWorkRelated: newTaskIsWork,
      date: getLocalDateString(),
      recurrence: newTaskRecurrence,
    };

    onUpdateTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskIsWork(false);
    setNewTaskRecurrence('unica');
  };

  const handleToggleTaskCompleted = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Toggle complete
    if (!task.completed) {
      // Completed! Mark as clean
      const updated = tasks.map(t => {
        if (t.id === id) {
          return { ...t, completed: true, failedReason: undefined };
        }
        return t;
      });
      onUpdateTasks(updated);
    } else {
      // Uncompleted! Trigger Faltazo feedback popover or mark as undone
      setUnfinishedTaskId(id);
    }
  };

  // Submit the chosen Faltazo failure reason
  const handleRegisterFaltazo = (reason: FaltazoReason) => {
    if (!unfinishedTaskId) return;

    const updated = tasks.map(t => {
      if (t.id === unfinishedTaskId) {
        return { ...t, completed: false, failedReason: reason };
      }
      return t;
    });

    onUpdateTasks(updated);
    setUnfinishedTaskId(null);
  };

  const handleRemoveTask = (id: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== id));
  };

  // Time block addition
  const handleAddTaskBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockTitle || !newBlockStart || !newBlockEnd) return;

    const newBlock: TimeBlock = {
      id: `block-${Date.now()}`,
      title: newBlockTitle,
      startTime: newBlockStart,
      endTime: newBlockEnd,
      category: newBlockCat,
    };

    onUpdateTimeBlocks([...timeBlocks, newBlock]);
    setNewBlockTitle('');
  };

  const handleRemoveBlock = (id: string) => {
    onUpdateTimeBlocks(timeBlocks.filter(b => b.id !== id));
  };

  const handleSaveEditTask = (id: string) => {
    if (!editTaskTitle) return;
    const updated = tasks.map(t => {
      if (t.id === id) {
        return { ...t, title: editTaskTitle };
      }
      return t;
    });
    onUpdateTasks(updated);
    setEditingTaskId(null);
  };

  const handleSaveEditBlock = (id: string) => {
    if (!editBlockTitle || !editBlockStart || !editBlockEnd) return;
    const updated = timeBlocks.map(b => {
      if (b.id === id) {
        return {
          ...b,
          title: editBlockTitle,
          startTime: editBlockStart,
          endTime: editBlockEnd,
          category: editBlockCat,
        };
      }
      return b;
    });
    onUpdateTimeBlocks(updated);
    setEditingBlockId(null);
  };

  // Save audit input
  const handleSaveActualAudit = (blockId: string) => {
    const mins = parseInt(actualMinutesInput);
    if (isNaN(mins) || mins < 0) return;

    const updated = timeBlocks.map(b => {
      if (b.id === blockId) {
        return { ...b, actualMinutesSpent: mins };
      }
      return b;
    });

    onUpdateTimeBlocks(updated);
    setEditingAuditId(null);
    setActualMinutesInput('');
  };

  // --- Statistics Calculations ---
  // Count faltazos by categories
  const faltazosCounts: Record<FaltazoReason, number> = {
    'Falta de energía': 0,
    'Emergencia': 0,
    'Clima': 0,
    'Falta de tiempo': 0,
    'Procrastinación': 0,
    'Otro': 0,
  };

  let totalFaltazos = 0;
  tasks.forEach(t => {
    if (!t.completed && t.failedReason) {
      faltazosCounts[t.failedReason]++;
      totalFaltazos++;
    }
  });

  const getCategoryColor = (cat: TimeBlock['category']) => {
    switch (cat) {
      case 'Trabajo': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Gimnasio': return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'Finanzas': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Comida': return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'Ocio': return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      default: return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  // Helper calculation of duration between 2 military strings HH:MM
  const calculatePlannedMinutes = (start: string, end: string): number => {
    const [hS, mS] = start.split(':').map(Number);
    const [hE, mE] = end.split(':').map(Number);
    return Math.max(0, (hE * 60 + mE) - (hS * 60 + mS));
  };

  return (
    <div className="space-y-6" id="productivity-module-root">
      
      {/* Productivity submenu selector */}
      <div className="flex border-b border-slate-800/80 overflow-x-auto scrollbar-none whitespace-nowrap mb-6 scroll-smooth snap-x" id="productivity-tabs">
        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`cursor-pointer flex-1 min-w-[80px] sm:min-w-0 text-center py-3 text-xs font-bold transition-all border-b-2 ${
            activeSubTab === 'tasks' 
              ? 'border-indigo-500 text-indigo-400 font-extrabold bg-indigo-500/5' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Checklist<span className="hidden sm:inline"> Hoy</span>
        </button>
        <button
          onClick={() => setActiveSubTab('habits')}
          className={`cursor-pointer flex-1 min-w-[80px] sm:min-w-0 text-center py-3 text-xs font-bold transition-all border-b-2 ${
            activeSubTab === 'habits' 
              ? 'border-purple-500 text-purple-400 font-extrabold bg-purple-500/5' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Hábitos<span className="hidden sm:inline"> Diarios</span>
        </button>
        <button
          onClick={() => setActiveSubTab('blocks')}
          className={`cursor-pointer flex-1 min-w-[90px] sm:min-w-0 text-center py-3 text-xs font-bold transition-all border-b-2 ${
            activeSubTab === 'blocks' 
              ? 'border-emerald-500 text-emerald-400 font-extrabold bg-emerald-500/5' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Agenda<span className="hidden sm:inline"> (Blocking)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`cursor-pointer flex-1 min-w-[85px] sm:min-w-0 text-center py-3 text-xs font-bold transition-all border-b-2 ${
            activeSubTab === 'audit' 
              ? 'border-amber-500 text-amber-400 font-extrabold bg-amber-500/5' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Auditoría<span className="hidden sm:inline"> de Tiempo</span>
        </button>
      </div>

      {/* RENDER TASKS SUB-TAB */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-6" id="tasks-view">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: Checklist editor and Tasks lists */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Creator form */}
              <div className="bg-[#0b1323] border border-slate-800 rounded-3xl p-5 shadow-lg">
                <span className="text-xs font-bold text-slate-350 uppercase tracking-wider block mb-2">Crear Nueva Tarea Diaria / Programada</span>
                
                <form onSubmit={handleAddTask} className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Ej: Completar la rutina del día..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="flex-grow px-3 py-1.5 text-xs bg-[#070c18] text-white border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium placeholder:text-slate-500"
                      required
                    />
                    <select
                      value={newTaskRecurrence}
                      onChange={(e) => setNewTaskRecurrence(e.target.value as any)}
                      className="bg-[#070c18] text-slate-200 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 shrink-0 cursor-pointer"
                    >
                      <option value="unica" className="bg-[#0b1323] text-white">🎯 Solo hoy</option>
                      <option value="diaria" className="bg-[#0b1323] text-white">🔄 Todos los días</option>
                      <option value="manana" className="bg-[#0b1323] text-white">📅 Para mañana</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-800 pt-2.5">
                    <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold text-slate-300">
                      <input
                        type="checkbox"
                        checked={newTaskIsWork}
                        onChange={(e) => setNewTaskIsWork(e.target.checked)}
                        className="rounded border-slate-855 text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-[#070c18]"
                      />
                      <span>¿Es de Trabajo?</span>
                    </label>

                    <button
                      type="submit"
                      className="cursor-pointer bg-indigo-650 text-white font-bold text-xs py-1.5 px-5 rounded-xl hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xs border border-indigo-400"
                    >
                      Añadir Tarea
                    </button>
                  </div>
                </form>
              </div>

              {/* Tasks Checklist */}
              <div className="bg-[#0b1323] border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Lista de Verificación de Hoy</h3>
                
                <div className="space-y-2 h-[280px] overflow-y-auto pr-1">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-450">Sin tareas programadas para el día de hoy.</div>
                  ) : (
                    tasks.map((task) => (
                      <div 
                        key={task.id} 
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                          task.completed 
                            ? 'bg-[#070c18]/40 border-slate-800/50 opacity-50' 
                            : task.failedReason 
                            ? 'bg-red-950/20 border-red-900/40' 
                            : 'bg-[#070c18] border-slate-800/80 text-white'
                        }`}
                      >
                        {editingTaskId === task.id ? (
                          <div className="flex-grow flex items-center space-x-2 mr-2">
                            <input
                              type="text"
                              value={editTaskTitle}
                              onChange={(e) => setEditTaskTitle(e.target.value)}
                              className="flex-grow px-2 py-1.5 text-xs border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold bg-[#070c18] text-white"
                            />
                            <button
                              onClick={() => handleSaveEditTask(task.id)}
                              className="cursor-pointer bg-emerald-600 text-white font-bold text-[10.5px] px-2.5 py-1.5 rounded-lg hover:bg-emerald-700 hover:shadow-xs"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingTaskId(null)}
                              className="cursor-pointer bg-slate-800 text-slate-300 hover:bg-slate-755 border border-slate-700 font-bold text-[10.5px] px-2.5 py-1.5 rounded-lg"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start space-x-2.5 flex-grow">
                            <button
                              onClick={() => handleToggleTaskCompleted(task.id)}
                              className="mt-0.5 text-slate-300 hover:text-indigo-400 focus:outline-none"
                            >
                              {task.completed ? (
                                <CheckSquare className="w-4.5 h-4.5 text-indigo-400" />
                              ) : (
                                <Square className="w-4.5 h-4.5 text-slate-500" />
                              )}
                            </button>
                            
                            <div>
                              <span className={`font-bold block ${task.completed ? 'line-through text-slate-500' : 'text-[#ccc7c7]'}`}>
                                {task.title}
                              </span>
                              
                              <div className="flex items-center space-x-1.5 mt-0.5 flex-wrap gap-y-1">
                                <span className={`text-[8.5px] px-1.5 py-0.5 rounded-full font-bold ${
                                  task.isWorkRelated 
                                    ? 'bg-amber-950/80 text-amber-300 border border-amber-900/40' 
                                    : 'bg-indigo-950/80 text-indigo-300 border border-indigo-900/45'
                                  }`}>
                                  {task.isWorkRelated ? 'Trabajo / Oficina' : 'Personal'}
                                </span>

                                <span className={`text-[8.5px] px-1.5 py-0.5 rounded-full font-bold ${
                                  task.recurrence === 'diaria'
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-900/40'
                                    : task.recurrence === 'manana'
                                    ? 'bg-rose-950/80 text-rose-300 border border-rose-900/40'
                                    : 'bg-slate-900 text-slate-350 border border-slate-800'
                                }`}>
                                  {task.recurrence === 'diaria' ? '🔄 Todos los días' : task.recurrence === 'manana' ? '📅 Para mañana' : '🎯 Solo hoy'}
                                </span>
                                
                                {task.failedReason && (
                                  <span className="text-[8.5px] bg-red-950/80 text-red-300 font-bold px-1.5 py-0.5 rounded-full border border-red-900/40 font-mono">
                                    Incompleto por: {task.failedReason}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {editingTaskId !== task.id && (
                          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                            <button
                              onClick={() => {
                                setEditingTaskId(task.id);
                                setEditTaskTitle(task.title);
                              }}
                              className="text-[10px] bg-indigo-950 text-indigo-300 hover:bg-indigo-900 hover:text-white p-1 px-2 rounded-lg font-bold border border-indigo-900/50"
                              title="Editar"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleRemoveTask(task.id)}
                              className="text-red-500 hover:text-red-400 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Faltazo Select Modal Overlay/drawer built inline for high responsive speed */}
              {unfinishedTaskId && (
                <div className="bg-red-950/25 border border-red-900/50 p-4 rounded-2xl text-xs space-y-3 shadow-inner" id="faltazo-card-exception">
                  <div className="flex items-start space-x-1.5 text-red-300 font-bold">
                    <Frown className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-red-200">¿Por qué dejas incompleta esta tarea?</p>
                      <p className="text-[11px] text-red-600">
                        Selecciona rápidamente la razón. La app guardará este "faltazo" para compilar tu historial mensual de excusas de productividad.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(['Falta de energía', 'Emergencia', 'Clima', 'Falta de tiempo', 'Procrastinación', 'Otro'] as FaltazoReason[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => handleRegisterFaltazo(r)}
                        className="cursor-pointer bg-red-950/40 border border-red-500/30 text-red-100 hover:text-white font-bold text-[10.5px] p-2 hover:bg-red-900/60 rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  
                  <div className="text-right">
                    <button
                      onClick={() => setUnfinishedTaskId(null)}
                      className="text-[10px] text-slate-500 hover:underline"
                    >
                      Cancelar e Incompleto Sencillo
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right side: Exception statistics widget on "Faltazos" */}
            <div className="space-y-4">
              <div className="bg-[#0b1323] border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1 mb-2">
                    <BarChart className="w-4 h-4 text-red-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest">Estadísticas de Faltazos</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Balance de excusas que retrasaron tus tareas del mes.
                  </p>
                </div>

                {totalFaltazos === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic">
                    ¡Felicidades! Mantienes 0 faltazos registrados. Productividad al 100%.
                  </div>
                ) : (
                  <div className="space-y-3 flex-grow" id="stats-bars">
                    {Object.entries(faltazosCounts).map(([reason, count]) => {
                      const perc = totalFaltazos > 0 ? (count / totalFaltazos) * 100 : 0;
                      if (count === 0) return null;
                      return (
                        <div key={reason} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-300">{reason}</span>
                            <span className="font-mono text-slate-250">{count} veces ({Math.round(perc)}%)</span>
                          </div>
                          <div className="w-full bg-[#070c18] h-2 rounded-full overflow-hidden border border-slate-800/50">
                            <div 
                              className="bg-red-500 h-full rounded-full" 
                              style={{ width: `${perc}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="border-t border-slate-800 pt-3 mt-3 text-[10px] leading-relaxed text-slate-400">
                  * Trata de analizar si tu mayor fuga de productividad es la <strong>Procrastinación</strong> o <strong>Falta de energía</strong> (sugiere readecuar el sueño/descanso).
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* RENDER TIME BLOCKING SUB-TAB */}
      {activeSubTab === 'blocks' && (
        <div className="space-y-6" id="time-blocking-view">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: Time Block editor form */}
            <div className="bg-[#0b1323] border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Programar Bloque de Tiempo</span>
              
              <form onSubmit={handleAddTaskBlock} className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Nombre o Actividad</label>
                  <input
                    type="text"
                    placeholder="Ej: Trabajar en Código, Dormir, Almuerzo..."
                    value={newBlockTitle}
                    onChange={(e) => setNewBlockTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#070c18] text-white border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium placeholder:text-slate-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Comienzo</label>
                    <input
                      type="time"
                      value={newBlockStart}
                      onChange={(e) => setNewBlockStart(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#070c18] text-white border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Finalización</label>
                    <input
                      type="time"
                      value={newBlockEnd}
                      onChange={(e) => setNewBlockEnd(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#070c18] text-white border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Categoría</label>
                  <select
                    value={newBlockCat}
                    onChange={(e: any) => setNewBlockCat(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#070c18] text-white border border-slate-800 rounded-xl font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Trabajo" className="bg-[#0b1323]">Trabajo / Oficina</option>
                    <option value="Gimnasio" className="bg-[#0b1323]">Gimnasio</option>
                    <option value="Finanzas" className="bg-[#0b1323]">Finanzas</option>
                    <option value="Ocio" className="bg-[#0b1323]">Ocio</option>
                    <option value="Descanso" className="bg-[#0b1323]">Descanso</option>
                    <option value="Comida" className="bg-[#0b1323]">Comida</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="cursor-pointer w-full bg-emerald-600 hover:bg-emerald-550 text-white font-bold text-xs py-2 rounded-xl text-center flex items-center justify-center space-x-1 hover:scale-[1.01] active:scale-95 transition-all border border-emerald-400"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Añadir Bloque Horario</span>
                </button>
              </form>
            </div>

            {/* Middle/Right: Visual Daily Timeline */}
            <div className="lg:col-span-2 bg-[#0b1323] border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Línea del Tiempo del Día (Time-Blocking)</span>
              
              <div className="space-y-2 h-[340px] overflow-y-auto pr-1">
                {timeBlocks
                  .sort((a,b) => a.startTime.localeCompare(b.startTime))
                  .map((block) => (
                    <div 
                      key={block.id} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-l-4 text-xs ${getCategoryColor(block.category)} gap-3`}
                      style={{ borderLeftWidth: '5px' }}
                    >
                      {editingBlockId === block.id ? (
                        <div className="w-full space-y-2 bg-white/90 p-3 rounded-xl border border-slate-200">
                          <div>
                            <label className="text-[9px] font-extrabold text-slate-400 tracking-wider block mb-1">ACTIVIDAD</label>
                            <input
                              type="text"
                              value={editBlockTitle}
                              onChange={(e) => setEditBlockTitle(e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold bg-white text-slate-900"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-extrabold text-slate-400 block mb-1">INICIO</label>
                              <input
                                type="time"
                                value={editBlockStart}
                                onChange={(e) => setEditBlockStart(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold bg-white text-slate-900"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-extrabold text-slate-400 block mb-1">FINAL</label>
                              <input
                                type="time"
                                value={editBlockEnd}
                                onChange={(e) => setEditBlockEnd(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold bg-white text-slate-900"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] font-extrabold text-slate-400 block mb-1">CATEGORÍA</label>
                            <select
                              value={editBlockCat}
                              onChange={(e: any) => setEditBlockCat(e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none font-bold text-slate-800"
                            >
                              <option value="Trabajo">Trabajo / Oficina</option>
                              <option value="Gimnasio">Gimnasio</option>
                              <option value="Finanzas">Finanzas</option>
                              <option value="Ocio">Ocio</option>
                              <option value="Descanso">Descanso</option>
                              <option value="Comida">Comida</option>
                            </select>
                          </div>
                          <div className="flex justify-end space-x-2 pt-1">
                            <button
                              onClick={() => handleSaveEditBlock(block.id)}
                              className="cursor-pointer bg-emerald-600 text-white font-bold text-[10.5px] px-3.5 py-1.5 rounded-xl hover:bg-emerald-750"
                            >
                              Guardar Cambios
                            </button>
                            <button
                              onClick={() => setEditingBlockId(null)}
                              className="cursor-pointer bg-slate-200 text-slate-700 font-bold text-[10.5px] px-3 py-1.5 rounded-xl hover:bg-slate-300"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span className="font-mono font-bold text-slate-700">{block.startTime} a {block.endTime}</span>
                            </div>
                            <span className="font-extrabold block text-slate-800 text-[13px]">{block.title}</span>
                            <span className="text-[9px] uppercase font-extrabold text-slate-400">Tipo: {block.category}</span>
                          </div>

                          <div className="flex items-center space-x-1.5 self-end sm:self-center">
                            <button
                              onClick={() => {
                                setEditingBlockId(block.id);
                                setEditBlockTitle(block.title);
                                setEditBlockStart(block.startTime);
                                setEditBlockEnd(block.endTime);
                                setEditBlockCat(block.category);
                              }}
                              className="text-[10px] bg-white/80 hover:bg-white text-indigo-700 p-1 px-2.5 rounded-lg font-bold shadow-xs border border-indigo-150"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleRemoveBlock(block.id)}
                              className="text-red-500 hover:text-red-400 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RENDER TIME AUDITING TAB - TARGET BALANCE COMPILER */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6" id="time-audit-view">
          <div className="bg-[#0b1323] border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Sliders className="w-4.5 h-4.5 mr-1 text-indigo-400" />
                Auditoría del Balance Diario (Planificado vs Realidad Ejecutada)
              </h3>
              <p className="text-xs text-slate-350">
                Al final del día, audita con honestidad cuántos minutos reales ejecutaste de tus bloques de tiempo planificados en tu agenda diaria. Esta comparación te ayudará a medir tu eficacia para mantenerte centrado en tus metas.
              </p>
            </div>

            {/* Audit interactive list */}
            <div className="space-y-3">
              {timeBlocks.map((block) => {
                const planMins = calculatePlannedMinutes(block.startTime, block.endTime);
                const actualMins = block.actualMinutesSpent;

                const hasAudited = actualMins !== undefined;
                const accuracy = hasAudited ? Math.min(100, Math.round((actualMins / planMins) * 100)) : 0;

                return (
                  <div key={block.id} className="border border-slate-800 rounded-xl p-3 text-xs bg-[#070c18] hover:bg-slate-900/40 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                       <div>
                        <span className="font-bold text-white block text-sm">{block.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Planificado: {planMins} Minutos ({block.startTime}-{block.endTime})</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {editingAuditId === block.id ? (
                          <div className="flex items-center space-x-1.5">
                            <input
                              type="number"
                              placeholder="Mins ejecutados"
                              value={actualMinutesInput}
                              onChange={(e) => setActualMinutesInput(e.target.value)}
                              className="w-20 px-2 py-1 text-[11px] bg-[#0b1323] text-white font-medium border border-slate-800 rounded focus:ring-1 focus:ring-indigo-500"
                            />
                            <button
                              onClick={() => handleSaveActualAudit(block.id)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded text-[10px] font-bold hover:scale-[1.02] active:scale-95 transition-all"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingAuditId(null)}
                              className="text-slate-400 text-[10px]"
                            >
                              x
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            {hasAudited ? (
                              <span className="font-mono text-slate-300 font-semibold bg-[#0b1323] border border-slate-800 px-2 py-0.5 rounded">
                                Ejecutado real: {actualMins} mins
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-300 italic font-medium bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded font-mono">
                                Sin auditar aún
                              </span>
                            )}
                            
                            <button
                              onClick={() => {
                                setEditingAuditId(block.id);
                                setActualMinutesInput(actualMins?.toString() || planMins.toString());
                              }}
                              className="bg-indigo-950/80 border border-indigo-900/50 text-indigo-300 font-bold text-[10.5px] px-2.5 py-1 rounded hover:bg-indigo-900 hover:text-white transition-all cursor-pointer"
                            >
                              {hasAudited ? 'Corregir' : 'Auditar de hoy'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* accuracy progress indicator list */}
                    {hasAudited && (
                      <div className="space-y-1 mt-1 pt-1 border-t border-slate-800">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span>Exactitud de Ejecución:</span>
                          <span className={accuracy >= 80 ? 'text-emerald-400' : accuracy >= 50 ? 'text-amber-400' : 'text-red-400'}>
                            {accuracy}% de la agenda planeada
                          </span>
                        </div>
                        <div className="w-full bg-[#0b1323] h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full rounded-full ${
                              accuracy >= 80 ? 'bg-emerald-500' : accuracy >= 50 ? 'bg-amber-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* RENDER HABITS SUB-TAB INTEGRATION */}
      {activeSubTab === 'habits' && (
        <div id="habits-view">
          <HabitsModule habits={habits} onUpdateHabits={onUpdateHabits} />
        </div>
      )}

    </div>
  );
}
