/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Dumbbell, 
  PlusCircle, 
  CheckCircle, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RoutineDay, RoutineExercise, GymSet } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

interface GymModuleProps {
  routines: RoutineDay[];
  onUpdateRoutines: (newRoutines: RoutineDay[]) => void;
}

export default function GymModule({ routines, onUpdateRoutines }: GymModuleProps) {
  // Ensure we have a default selected day (Lunes)
  const [selectedDayId, setSelectedDayId] = useState<string>(routines[0]?.id || 'day-1');
  const [addingExercise, setAddingExercise] = useState(false);
  const [editingDayName, setEditingDayName] = useState(false);
  
  // Form states for custom day name
  const [tempDayName, setTempDayName] = useState('');

  // Form states for adding exercise
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseSetsCount, setNewExerciseSetsCount] = useState('4');
  const [newExerciseReps, setNewExerciseReps] = useState('10');
  const [newExerciseWeight, setNewExerciseWeight] = useState('0');

  // Exercise editing states
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editExerciseName, setEditExerciseName] = useState('');
  const [editExerciseSetsCount, setEditExerciseSetsCount] = useState('4');

  // Interactive logs expanded drawer
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Active Selected Routine Day
  const activeDay = routines.find(r => r.id === selectedDayId) || routines[0] || {
    id: 'day-1',
    dayName: 'Lunes',
    exercises: []
  };

  const handleUpdateDayName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempDayName.trim()) return;
    
    const updated = routines.map(r => {
      if (r.id === selectedDayId) {
        return { ...r, dayName: tempDayName.trim() };
      }
      return r;
    });
    onUpdateRoutines(updated);
    setEditingDayName(false);
  };

  const startEditingDayName = () => {
    setTempDayName(activeDay.dayName);
    setEditingDayName(true);
  };

  // Toggle checklist sets
  const handleToggleSetCompleted = (dayId: string, exerciseId: string, setIndex: number) => {
    const updated = routines.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.map(ex => {
            if (ex.id === exerciseId) {
              const updatedSets = ex.sets.map((set, sIdx) => {
                if (sIdx === setIndex) {
                  return { ...set, completed: !set.completed };
                }
                return set;
              });
              return { ...ex, sets: updatedSets };
            }
            return ex;
          })
        };
      }
      return day;
    });
    onUpdateRoutines(updated);
  };

  const handleUpdateSetValues = (dayId: string, exerciseId: string, setIndex: number, weight: number, reps: number) => {
    const updated = routines.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.map(ex => {
            if (ex.id === exerciseId) {
              const updatedSets = ex.sets.map((set, sIdx) => {
                if (sIdx === setIndex) {
                  return { ...set, weight, reps };
                }
                return set;
              });
              return { ...ex, sets: updatedSets };
            }
            return ex;
          })
        };
      }
      return day;
    });
    onUpdateRoutines(updated);
  };

  const handleAddExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseName.trim()) return;

    const count = parseInt(newExerciseSetsCount) || 4;
    const defaultReps = parseInt(newExerciseReps) || 12;
    const defaultWeight = parseFloat(newExerciseWeight) || 0;

    const initialSets: GymSet[] = Array.from({ length: count }, () => ({
      reps: defaultReps,
      weight: defaultWeight,
      completed: false,
    }));

    const newRoutineExercise: RoutineExercise = {
      id: `exer-${Date.now()}`,
      exerciseId: `raw-${Date.now()}`,
      name: newExerciseName.trim(),
      sets: initialSets,
      weeklyHistoryLog: [
        { date: getLocalDateString(), weight: defaultWeight, reps: defaultReps, setsCount: count }
      ],
      consecutiveNoProgressWeeks: 0,
    };

    const updated = routines.map(day => {
      if (day.id === selectedDayId) {
        return {
          ...day,
          exercises: [...day.exercises, newRoutineExercise]
        };
      }
      return day;
    });

    onUpdateRoutines(updated);
    setNewExerciseName('');
    setNewExerciseWeight('0');
    setAddingExercise(false);
  };

  const handleRemoveExercise = (dayId: string, exerciseId: string) => {
    if (!confirm('¿Estás seguro de eliminar este ejercicio de la rutina?')) return;
    const updated = routines.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.filter(ex => ex.id !== exerciseId)
        };
      }
      return day;
    });
    onUpdateRoutines(updated);
  };

  const handleStartEditExercise = (ex: RoutineExercise) => {
    setEditingExerciseId(ex.id);
    setEditExerciseName(ex.name);
    setEditExerciseSetsCount(ex.sets.length.toString());
  };

  const handleSaveEditExercise = (dayId: string, exerciseId: string) => {
    const updatedSetsCount = parseInt(editExerciseSetsCount) || 4;
    const updated = routines.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.map(ex => {
            if (ex.id === exerciseId) {
              let newSets = [...ex.sets];
              if (newSets.length < updatedSetsCount) {
                const diff = updatedSetsCount - newSets.length;
                for (let i = 0; i < diff; i++) {
                  newSets.push({ reps: 10, weight: 0, completed: false });
                }
              } else if (newSets.length > updatedSetsCount) {
                newSets = newSets.slice(0, updatedSetsCount);
              }
              return {
                ...ex,
                name: editExerciseName.trim(),
                sets: newSets
              };
            }
            return ex;
          })
        };
      }
      return day;
    });
    onUpdateRoutines(updated);
    setEditingExerciseId(null);
  };

  // Pre-configured options to quickly assign preset routine descriptions
  const handleAssignQuickRoutinePreset = (presetName: string) => {
    const updated = routines.map(day => {
      if (day.id === selectedDayId) {
        // Keeps dayName start unchanged e.g. "Lunes - Pecho" -> "Lunes - Preset"
        const currentPrefix = day.dayName.split(' - ')[0] || 'Día';
        return { ...day, dayName: `${currentPrefix} - ${presetName}` };
      }
      return day;
    });
    onUpdateRoutines(updated);
    setEditingDayName(false);
  };

  return (
    <div className="space-y-6" id="gym-module-container">
      
      {/* 1. Header Information & Customization */}
      <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Calendar className="w-5 h-5" />
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">Organizador de Rutinas Semanales</h3>
          </div>
          
          {editingDayName ? (
            <form onSubmit={handleUpdateDayName} className="flex items-center space-x-2 mt-2">
              <input
                type="text"
                value={tempDayName}
                onChange={(e) => setTempDayName(e.target.value)}
                className="bg-[#070c18] border border-slate-800 text-xs px-3 py-1.5 rounded-xl text-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-64"
                placeholder="Ej: Lunes - Piernas"
                required
              />
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl"
                title="Guardar nombre"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => setEditingDayName(false)} 
                className="bg-[#1e293b] hover:bg-[#334155] border border-[#2d3a4f] text-[#cbd5e1] hover:text-white p-2 rounded-xl transition-all"
                title="Cancelar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white">{activeDay.dayName}</h2>
              <button
                onClick={startEditingDayName}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-200 rounded-lg transition-all"
                title="Editar nombre o rutina"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <p className="text-xs text-slate-400">
            {activeDay.exercises.length === 0 
              ? 'No hay ejercicios agendados para hoy.' 
              : `Hoy tenés programados un total de ${activeDay.exercises.length} ejercicios de fuerza.`}
          </p>
        </div>

        {/* Preset assign tools */}
        {editingDayName && (
          <div className="w-full md:w-auto bg-[#070c18] p-3 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] text-indigo-400 uppercase font-black block tracking-wider">Asignación rápida de entrenamiento:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Pecho y Tríceps', 'Espalda y Bíceps', 'Piernas Completas', 'Hombros y Core', 'Funcional / Cardio', 'Día de Descanso'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleAssignQuickRoutinePreset(p)}
                  className="bg-[#121c33] hover:bg-[#1a2c4e] border border-slate-100 text-[10px] px-2.5 py-1 rounded-lg text-slate-700 font-bold cursor-pointer transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Horizontal Selector of Days (Optimized high-contrast for mobile thumb clicks, min-height 44px) */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5" id="days-selector-grid">
        {routines.map((r) => {
          const isActive = selectedDayId === r.id;
          const displayLabel = r.dayName.split(' - ')[0] || r.dayName;
          const routineDetail = r.dayName.split(' - ')[1] || '';
          
          return (
            <button
              key={r.id}
              onClick={() => {
                setSelectedDayId(r.id);
                setEditingDayName(false);
              }}
              style={{ minHeight: '48px' }}
              className={`cursor-pointer flex flex-col justify-center items-center rounded-xl p-1.5 border transition-all text-center relative ${
                isActive 
                  ? 'bg-indigo-600 border-indigo-400 text-white font-extrabold shadow-lg shadow-indigo-500/20' 
                  : 'bg-[#121c33] border-slate-700 text-white hover:bg-[#1a2849] hover:border-slate-500'
              }`}
            >
              <span className="text-xs font-extrabold uppercase block tracking-wider text-white">{displayLabel}</span>
              {routineDetail ? (
                <span className={`text-[9.5px] truncate max-w-full block px-1 font-bold ${isActive ? 'text-indigo-100' : 'text-slate-300'}`}>
                  {routineDetail}
                </span>
              ) : (
                <span className="text-[9px] text-slate-400 font-semibold block italic">vacío</span>
              )}
              
              {/* Exercise count indicator dot */}
              {r.exercises.length > 0 && (
                <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-indigo-400'}`}></span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Exercises Module Workspace */}
      <div className="space-y-4" id="exercises-workspace">
        
        {/* Workspace bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white flex items-center space-x-1.5">
            <Dumbbell className="w-4 h-4 text-indigo-400" />
            <span>Ejercicios de la Rutina ({activeDay.exercises.length})</span>
          </h4>
          
          <button
            onClick={() => setAddingExercise(!addingExercise)}
            style={{ minHeight: '44px' }}
            className={`cursor-pointer text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all ${
              addingExercise 
                ? 'bg-[#1e293b] hover:bg-[#334155] border border-[#2d3a4f] text-white' 
                : 'bg-indigo-600 hover:bg-indigo-550 text-white shadow-lg shadow-indigo-500/10'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{addingExercise ? 'Cerrar Panel' : 'Añadir Ejercicio'}</span>
          </button>
        </div>

        {/* Addition form */}
        {addingExercise && (
          <form 
            onSubmit={handleAddExerciseSubmit} 
            className="bg-[#0b1323] border border-indigo-950 p-4 rounded-2xl space-y-4 animate-fade-in"
          >
            <span className="text-xs font-bold text-slate-100 uppercase tracking-wider block border-b border-slate-800 pb-2">
              Nuevo Ejercicio para {activeDay.dayName}
            </span>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-200 font-extrabold uppercase block">Nombre del Ejercicio</label>
                <input
                  type="text"
                  placeholder="Ej: Press Banca Plano"
                  required
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  className="w-full bg-[#070c18] border border-slate-800 text-xs px-3 py-2 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-200 font-extrabold uppercase block">Cantidad de Series</label>
                <select
                  value={newExerciseSetsCount}
                  onChange={(e) => setNewExerciseSetsCount(e.target.value)}
                  className="w-full bg-[#070c18] border border-slate-800 text-xs px-3 py-2 rounded-xl text-white focus:outline-none font-bold"
                >
                  <option value="2">2 Series</option>
                  <option value="3">3 Series</option>
                  <option value="4">4 Series</option>
                  <option value="5">5 Series</option>
                  <option value="6">6 Series</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-200 font-extrabold uppercase block">Reps Recomendadas</label>
                <input
                  type="number"
                  min="1"
                  value={newExerciseReps}
                  onChange={(e) => setNewExerciseReps(e.target.value)}
                  className="w-full bg-[#070c18] border border-slate-800 text-xs px-3 py-2 rounded-xl text-white font-mono text-center focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-200 font-extrabold uppercase block">Peso Inicial (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={newExerciseWeight}
                  onChange={(e) => setNewExerciseWeight(e.target.value)}
                  className="w-full bg-[#070c18] border border-slate-800 text-xs px-3 py-2 rounded-xl text-white font-mono text-center focus:outline-none font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-550 font-bold text-xs py-2.5 px-4 rounded-xl text-white transition-all text-center"
            >
              Insertar Ejercicio en Rutina
            </button>
          </form>
        )}

        {/* Existing Exercises list */}
        {activeDay.exercises.length === 0 ? (
          <div className="text-center bg-[#070c18] border border-slate-100 rounded-2xl py-12 px-6 text-slate-500 text-xs font-mono">
            No tenés ejercicios cargados para la rutina de este día. ¡Usa el botón "Añadir Ejercicio" de arriba!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activeDay.exercises.map((ex) => {
              const isLogDrawerOpen = expandedLogId === ex.id;
              
              return (
                <div 
                  key={ex.id}
                  className="bg-[#0b1323]/80 border border-slate-100 p-4 rounded-2xl space-y-4"
                  id={`gym-exercise-card-${ex.id}`}
                >
                  
                  {/* Top exercise controller row */}
                  {editingExerciseId === ex.id ? (
                    <div className="w-full bg-[#070c18] p-3.5 rounded-xl border border-slate-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">Nombre Ejercicio</label>
                          <input
                            type="text"
                            value={editExerciseName}
                            onChange={(e) => setEditExerciseName(e.target.value)}
                            className="w-full bg-[#0b1323] border border-slate-800 text-xs px-3 py-1.5 rounded-lg text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">Series</label>
                          <select
                            value={editExerciseSetsCount}
                            onChange={(e) => setEditExerciseSetsCount(e.target.value)}
                            className="w-full bg-[#0b1323] border border-slate-800 text-xs px-3 py-1.5 rounded-lg text-white"
                          >
                            <option value="2">2 Series</option>
                            <option value="3">3 Series</option>
                            <option value="4">4 Series</option>
                            <option value="5">5 Series</option>
                            <option value="6">6 Series</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-1 border-t border-slate-900">
                        <button
                          type="button"
                          onClick={() => handleSaveEditExercise(activeDay.id, ex.id)}
                          className="bg-emerald-600 hover:bg-emerald-555 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingExerciseId(null)}
                          className="bg-[#1e293b] hover:bg-[#334155] border border-[#2d3a4f] text-[#cbd5e1] hover:text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h5 className="text-sm font-extrabold text-white">{ex.name}</h5>
                        <p className="text-[10px] text-[#ccc7c7] font-semibold">
                          {ex.sets.length} Series totales de sobrecarga registrada
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleStartEditExercise(ex)}
                          className="text-[10px] hover:bg-slate-200 hover:text-white text-[#ccc7c7] p-1 px-2.5 rounded-lg font-bold transition-all"
                        >
                          Modificar
                        </button>
                        <button
                          onClick={() => setExpandedLogId(isLogDrawerOpen ? null : ex.id)}
                          className="text-[10px] bg-slate-950/60 border border-slate-700 hover:text-white text-slate-200 p-1 px-2.5 rounded-lg font-bold flex items-center space-x-1 transition-all"
                        >
                          <span>Historial</span>
                          {isLogDrawerOpen ? <ChevronUp className="w-3 h-3 text-indigo-400" /> : <ChevronDown className="w-3 h-3 text-indigo-400" />}
                        </button>
                        <button
                          onClick={() => handleRemoveExercise(activeDay.id, ex.id)}
                          className="text-red-500 hover:text-red-450 p-1.5 hover:bg-[#070c18] rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Progressive overload log panel */}
                  {isLogDrawerOpen && (
                    <div className="bg-[#070c11] border border-slate-800 rounded-xl p-3 text-xs space-y-2 animate-fade-in font-mono">
                      <div className="flex items-center justify-between text-[10px] text-indigo-400 uppercase font-black tracking-wider pb-1.5 border-b border-slate-800">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-450" />
                          <span className="text-indigo-300 font-extrabold">Evolución de Pesos Levantados:</span>
                        </span>
                        <span className="text-slate-400">Sobrecarga Activa</span>
                      </div>
                      
                      {ex.weeklyHistoryLog && ex.weeklyHistoryLog.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ex.weeklyHistoryLog.map((log, lIdx) => (
                            <div key={lIdx} className="bg-[#0b1323] border border-slate-800 p-2 rounded-lg text-center leading-tight">
                              <span className="text-[9px] text-slate-300 font-bold block">{log.date}</span>
                              <span className="font-extrabold text-slate-100 block text-xs mt-1">{log.weight} kg</span>
                              <span className="text-[9px] text-slate-300 font-bold">x {log.reps} reps ({log.setsCount}s)</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 block text-center py-1">No hay historial registrado.</span>
                      )}
                      
                      <p className="text-[10px] text-slate-300 leading-relaxed font-sans mt-1">
                        * Consejo: Para favorecer la hipertrofia o ganancia de fuerza, intenta levantar ligeramente más peso o hacer una repetición extra manteniendo la técnica perfecta sesión tras sesión.
                      </p>
                    </div>
                  )}

                  {/* WORKOUT SETS - INTERACTIVE TABS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs" id="sets-checklist-section">
                    {ex.sets.map((set, sIdx) => {
                      return (
                        <div 
                          key={sIdx}
                          style={{ minHeight: '44px' }}
                          className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                            set.completed 
                              ? 'bg-[#06241a] border-emerald-800 text-emerald-250 opacity-100' 
                              : 'bg-[#121c33] border-slate-700 hover:border-slate-500 text-slate-100'
                          }`}
                        >
                          <div className="flex items-center space-x-2 font-extrabold select-none">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#18102c] border border-slate-100 text-indigo-200 font-mono font-bold">
                              SERIE {sIdx + 1}
                            </span>
                            
                            {/* Inputs for weight */}
                            <div className="flex items-center space-x-0.5 font-mono">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={set.weight || ''}
                                onChange={(e) => handleUpdateSetValues(activeDay.id, ex.id, sIdx, parseFloat(e.target.value) || 0, set.reps)}
                                className="w-10 bg-transparent text-center font-bold text-white border-b border-slate-500 focus:border-indigo-400 focus:outline-none"
                                placeholder="..."
                              />
                              <span className="text-[10px] text-slate-300 font-bold">kg</span>
                            </div>

                            <span className="text-slate-500">|</span>

                            {/* Inputs for reps */}
                            <div className="flex items-center space-x-0.5 font-mono">
                              <input
                                type="number"
                                min="1"
                                value={set.reps || ''}
                                onChange={(e) => handleUpdateSetValues(activeDay.id, ex.id, sIdx, set.weight, parseInt(e.target.value) || 0)}
                                className="w-8 bg-transparent text-center font-bold text-white border-b border-slate-500 focus:border-indigo-400 focus:outline-none"
                                placeholder="..."
                              />
                              <span className="text-[10px] text-slate-300 font-bold">reps</span>
                            </div>
                          </div>

                          {/* Quick tap checklist circle target */}
                          <button
                            onClick={() => handleToggleSetCompleted(activeDay.id, ex.id, sIdx)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                              set.completed 
                                ? 'bg-emerald-500 text-white' 
                                : 'border border-slate-400 hover:border-indigo-400 hover:bg-slate-900 text-transparent hover:text-slate-200'
                            }`}
                          >
                            <CheckCircle className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
