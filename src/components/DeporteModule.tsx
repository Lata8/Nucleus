/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  ChevronUp,
  Trophy,
  Bike,
  Flame,
  Award,
  Clock,
  Plus,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  RoutineDay, 
  RoutineExercise, 
  GymSet, 
  SportScheduleItem, 
  RunningCyclingDayPlan, 
  ActivityLog, 
  SpecialRecord 
} from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { customAlert, customConfirm } from '../utils/customAlerts';

interface DeporteModuleProps {
  routines: RoutineDay[];
  onUpdateRoutines: (newRoutines: RoutineDay[]) => void;
}

const PRESET_SPORTS = [
  'Gimnasio 🏋️',
  'Salir a Correr 🏃',
  'Andar en Bici 🚴',
  'Fútbol ⚽',
  'Básquet 🏀',
  'Tenis 🎾',
  'Paddle 🎾',
  'Natación 🏊',
  'CrossFit 🏋️‍♂️',
  'Yoga / Pilates 🧘',
  'Boxeo / MMA 🥊',
  'Vóley 🏐',
  'Otro Deporte 🎖️'
];

const PRESET_FEELINGS = [
  'Increíble (¡Súper energía!) ⚡',
  'Muy Bien 👍',
  'Neutral 😐',
  'Cansado / Agotado 😴',
  'Poco Ritmo 🐢'
];

export default function DeporteModule({ routines, onUpdateRoutines }: DeporteModuleProps) {
  // Navigation inside Deporte module: 'schedule' (Calendar & Sports), 'running' (Running & Cycling special), 'gym' (Weightlifting routines)
  const [deporteTab, setDeporteTab] = useState<'schedule' | 'running' | 'gym'>('schedule');

  // ---------- STATE PERSISTENCE (Sports schedules, Running Plans, Activity Logs, Personal Records) ----------
  const [sportSchedules, setSportSchedules] = useState<SportScheduleItem[]>(() => {
    const data = localStorage.getItem('control_personal_sport_schedules');
    if (data) return JSON.parse(data);
    return [
      { id: 'sch-1', dayId: 'day-1', sportName: 'Gimnasio 🏋️', time: '18:00', notes: 'Rutina de Fuerza - Empuje' },
      { id: 'sch-2', dayId: 'day-3', sportName: 'Fútbol ⚽', time: '20:30', notes: 'Partido con amigos' },
      { id: 'sch-3', dayId: 'day-5', sportName: 'Gimnasio 🏋️', time: '18:00', notes: 'Rutina de Piernas' }
    ];
  });

  const [runningCyclingPlans, setRunningCyclingPlans] = useState<RunningCyclingDayPlan[]>(() => {
    const data = localStorage.getItem('control_personal_running_plans');
    if (data) return JSON.parse(data);
    return [
      { dayId: 'day-1', dayName: 'Lunes', active: false, time: '07:30', targetDuration: '40 min', targetDistance: 5, activityType: 'Correr' },
      { dayId: 'day-2', dayName: 'Martes', active: true, time: '08:00', targetDuration: '45 min', targetDistance: 6, activityType: 'Correr' },
      { dayId: 'day-3', dayName: 'Miércoles', active: false, time: '07:30', targetDuration: '30 min', targetDistance: 4, activityType: 'Correr' },
      { dayId: 'day-4', dayName: 'Jueves', active: true, time: '19:00', targetDuration: '1h 00m', targetDistance: 20, activityType: 'Bici' },
      { dayId: 'day-5', dayName: 'Viernes', active: false, time: '08:00', targetDuration: '45 min', targetDistance: 5, activityType: 'Correr' },
      { dayId: 'day-6', dayName: 'Sábado', active: true, time: '09:00', targetDuration: '1h 15m', targetDistance: 10, activityType: 'Correr' },
      { dayId: 'day-7', dayName: 'Domingo', active: false, time: '10:00', targetDuration: '2h 00m', targetDistance: 40, activityType: 'Bici' }
    ];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const data = localStorage.getItem('control_personal_sport_logs');
    if (data) return JSON.parse(data);
    return [
      { id: 'log-1', type: 'Correr', date: '2026-06-12', duration: '42 min', distance: 7.2, feeling: 'Increíble (¡Súper energía!) ⚡', notes: 'Vuelta al lago con ritmo alegre.' },
      { id: 'log-2', type: 'Bici', date: '2026-06-14', duration: '1h 10m', distance: 24.5, feeling: 'Muy Bien 👍', notes: 'Ruta larga por colectora, viento suave.' }
    ];
  });

  const [specialRecords, setSpecialRecords] = useState<SpecialRecord[]>(() => {
    const data = localStorage.getItem('control_personal_special_records');
    if (data) return JSON.parse(data);
    return [
      { id: 'rec-1', category: 'Correr', title: 'Distancia Máxima 🏃', value: '12.5 km', date: '2026-06-06', description: 'Entrenamiento fondo del sábado' },
      { id: 'rec-2', category: 'Correr', title: 'Mejor Tiempo 5K ⏱️', value: '23m 45s', date: '2026-06-10', description: 'Circuito plano de costanera' },
      { id: 'rec-3', category: 'Bici', title: 'Distancia Máxima 🚴', value: '45.2 km', date: '2026-06-14', description: 'Salida de fin de semana larga' },
      { id: 'rec-4', category: 'Bici', title: 'Velocidad Máxima ⚡', value: '38.6 km/h', date: '2026-06-14', description: 'En bajada del puente' }
    ];
  });

  // Saving states to localStorage
  useEffect(() => {
    localStorage.setItem('control_personal_sport_schedules', JSON.stringify(sportSchedules));
  }, [sportSchedules]);

  useEffect(() => {
    localStorage.setItem('control_personal_running_plans', JSON.stringify(runningCyclingPlans));
  }, [runningCyclingPlans]);

  useEffect(() => {
    localStorage.setItem('control_personal_sport_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('control_personal_special_records', JSON.stringify(specialRecords));
  }, [specialRecords]);


  // ---------- TAB 1: SPORT SCHEDULES FORM AND LOGIC ----------
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [scheduleDayId, setScheduleDayId] = useState('day-1');
  const [scheduleSport, setScheduleSport] = useState(PRESET_SPORTS[0]);
  const [scheduleTime, setScheduleTime] = useState('19:00');
  const [scheduleNotes, setScheduleNotes] = useState('');

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: SportScheduleItem = {
      id: `sch-${Date.now()}`,
      dayId: scheduleDayId,
      sportName: scheduleSport,
      time: scheduleTime,
      notes: scheduleNotes.trim()
    };
    setSportSchedules([...sportSchedules, newItem]);
    setScheduleNotes('');
    setAddingSchedule(false);
    customAlert(`Sport ${scheduleSport} programado con éxito`, 'success');
  };

  const handleRemoveSchedule = (id: string, name: string) => {
    customConfirm(
      `¿Deseas quitar la actividad "${name}" del cronograma?`,
      () => {
        setSportSchedules(sportSchedules.filter(item => item.id !== id));
        customAlert('Actividad removida', 'info');
      },
      undefined,
      'Quitar Deporte'
    );
  };


  // ---------- TAB 2: RUNNING & CYCLING SPECIAL TRACKER ----------
  // Form states for adding run/bike activity log
  const [logType, setLogType] = useState<'Correr' | 'Bici'>('Correr');
  const [logDate, setLogDate] = useState(getLocalDateString());
  const [logDuration, setLogDuration] = useState('30 min');
  const [logDistance, setLogDistance] = useState('');
  const [logFeeling, setLogFeeling] = useState(PRESET_FEELINGS[1]);
  const [logNotes, setLogNotes] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);

  // Personal Records Form
  const [recCategory, setRecCategory] = useState<'Correr' | 'Bici' | 'Gimnasio' | 'Fútbol' | 'Otro'>('Correr');
  const [recTitle, setRecTitle] = useState('');
  const [recValue, setRecValue] = useState('');
  const [recDate, setRecDate] = useState(getLocalDateString());
  const [recDesc, setRecDesc] = useState('');
  const [showRecForm, setShowRecForm] = useState(false);

  const handleAddActivityLog = (e: React.FormEvent) => {
    e.preventDefault();
    const distanceVal = parseFloat(logDistance);
    if (isNaN(distanceVal) || distanceVal <= 0) {
      customAlert('Por favor ingresa una distancia válida en kilómetros.', 'warning');
      return;
    }
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      type: logType,
      date: logDate,
      duration: logDuration.trim(),
      distance: distanceVal,
      feeling: logFeeling,
      notes: logNotes.trim()
    };
    setActivityLogs([newLog, ...activityLogs]);
    setLogDistance('');
    setLogDuration('30 min');
    setLogNotes('');
    setShowLogForm(false);
    customAlert(`Sesión de ${logType} registrada correctamente.`, 'success', 'Actividad Registrada');
  };

  const handleRemoveActivityLog = (id: string) => {
    customConfirm(
      '¿Estás seguro de eliminar el registro de esta sesión?',
      () => {
        setActivityLogs(activityLogs.filter(log => log.id !== id));
        customAlert('Registro eliminado', 'info');
      },
      undefined,
      'Eliminar Registro'
    );
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle.trim() || !recValue.trim()) {
      customAlert('Completa los campos de título y valor del récord.', 'warning');
      return;
    }
    const newRecord: SpecialRecord = {
      id: `rec-${Date.now()}`,
      category: recCategory,
      title: `${recTitle.trim()} ${recCategory === 'Correr' ? '🏃' : recCategory === 'Bici' ? '🚴' : recCategory === 'Gimnasio' ? '🏋️' : '⚽'}`,
      value: recValue.trim(),
      date: recDate,
      description: recDesc.trim()
    };
    setSpecialRecords([newRecord, ...specialRecords]);
    setRecTitle('');
    setRecValue('');
    setRecDesc('');
    setShowRecForm(false);
    customAlert('¡Récord Personal guardado con éxito! Sigue superándote.', 'success', '¡Nuevo Récord!');
  };

  const handleRemoveRecord = (id: string, title: string) => {
    customConfirm(
      `¿Deseas eliminar el récord "${title}"?`,
      () => {
        setSpecialRecords(specialRecords.filter(rec => rec.id !== id));
        customAlert('Récord eliminado', 'info');
      },
      undefined,
      'Eliminar Récord'
    );
  };

  // Toggle day active in Running/Cycling weekly plan
  const handleToggleRunningDay = (dayId: string) => {
    const updated = runningCyclingPlans.map(plan => {
      if (plan.dayId === dayId) {
        return { ...plan, active: !plan.active };
      }
      return plan;
    });
    setRunningCyclingPlans(updated);
  };

  const handleUpdateRunningDayValues = (dayId: string, field: keyof RunningCyclingDayPlan, value: any) => {
    const updated = runningCyclingPlans.map(plan => {
      if (plan.dayId === dayId) {
        return { ...plan, [field]: value };
      }
      return plan;
    });
    setRunningCyclingPlans(updated);
  };


  // ---------- TAB 3: ORIGINAL STRENGTH/GYM ROUTINES LOGIC ----------
  const [selectedDayId, setSelectedDayId] = useState<string>(routines[0]?.id || 'day-1');
  const [addingExercise, setAddingExercise] = useState(false);
  const [editingDayName, setEditingDayName] = useState(false);
  const [tempDayName, setTempDayName] = useState('');

  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseSetsCount, setNewExerciseSetsCount] = useState('4');
  const [newExerciseReps, setNewExerciseReps] = useState('10');
  const [newExerciseWeight, setNewExerciseWeight] = useState('0');

  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editExerciseName, setEditExerciseName] = useState('');
  const [editExerciseSetsCount, setEditExerciseSetsCount] = useState('4');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

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
    customAlert(`Ejercicio ${newExerciseName} añadido a la rutina del día.`, 'success');
  };

  const handleRemoveExercise = (dayId: string, exerciseId: string) => {
    customConfirm(
      '¿Estás seguro de eliminar este ejercicio de la rutina?',
      () => {
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
      },
      undefined,
      'Eliminar Ejercicio'
    );
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

  const handleAssignQuickRoutinePreset = (presetName: string) => {
    const updated = routines.map(day => {
      if (day.id === selectedDayId) {
        const currentPrefix = day.dayName.split(' - ')[0] || 'Día';
        return { ...day, dayName: `${currentPrefix} - ${presetName}` };
      }
      return day;
    });
    onUpdateRoutines(updated);
    setEditingDayName(false);
  };

  // Helper translations for days of the week
  const getDayNameSpanish = (id: string) => {
    switch(id) {
      case 'day-1': return 'Lunes';
      case 'day-2': return 'Martes';
      case 'day-3': return 'Miércoles';
      case 'day-4': return 'Jueves';
      case 'day-5': return 'Viernes';
      case 'day-6': return 'Sábado';
      case 'day-7': return 'Domingo';
      default: return 'Feriado';
    }
  };


  return (
    <div className="space-y-6" id="deportes-module-container">
      
      {/* MODULE HEADER */}
      <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Trophy className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-black text-white">Deporte y Entrenamiento</h2>
          </div>
          <p className="text-xs text-slate-400">
            Organiza tu cronograma de deportes semanal, lleva un registro detallado de tus sesiones de running / ciclismo, récords personales y rutinas de gimnasio.
          </p>
        </div>

        {/* SUB-TABS SELECTOR */}
        <div className="flex bg-[#070c18] border border-slate-800/80 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setDeporteTab('schedule')}
            className={`flex-1 md:flex-none cursor-pointer text-xs font-bold px-4 py-2 rounded-lg transition-all ${
              deporteTab === 'schedule' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Deportes
          </button>
          <button
            onClick={() => setDeporteTab('running')}
            className={`flex-1 md:flex-none cursor-pointer text-xs font-bold px-4 py-2 rounded-lg transition-all ${
              deporteTab === 'running' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🏃 Correr / Bici
          </button>
          <button
            onClick={() => setDeporteTab('gym')}
            className={`flex-1 md:flex-none cursor-pointer text-xs font-bold px-4 py-2 rounded-lg transition-all ${
              deporteTab === 'gym' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🏋️ Gimnasio
          </button>
        </div>
      </div>


      {/* ==================== TAB 1: CALENDARIO / DEPORTES GENERAL ==================== */}
      {deporteTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-lg font-black text-white flex items-center space-x-1.5">
                <span>Cronograma y Horarios Deportivos</span>
              </h3>
              <p className="text-xs text-[#a3b3cc] mt-0.5">Define los horarios fijos de tus prácticas deportivas semanales.</p>
            </div>
            
            <button
              onClick={() => setAddingSchedule(!addingSchedule)}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 font-bold text-xs py-2 px-4 rounded-xl text-white flex items-center justify-center space-x-1.5 transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{addingSchedule ? 'Ocultar Panel' : 'Programar Actividad'}</span>
            </button>
          </div>

          {/* Quick Schedule Add Form */}
          {addingSchedule && (
            <form onSubmit={handleAddSchedule} className="bg-[#0c1426] border border-slate-800 p-4 rounded-2xl space-y-4 animate-fade-in">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block border-b border-slate-800/80 pb-2">
                Programar Nueva Actividad Deportiva
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-300 font-extrabold uppercase block">Día de la Semana</label>
                  <select
                    value={scheduleDayId}
                    onChange={(e) => setScheduleDayId(e.target.value)}
                    className="w-full bg-[#070c18] border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white font-bold"
                  >
                    <option value="day-1">Lunes</option>
                    <option value="day-2">Martes</option>
                    <option value="day-3">Miércoles</option>
                    <option value="day-4">Jueves</option>
                    <option value="day-5">Viernes</option>
                    <option value="day-6">Sábado</option>
                    <option value="day-7">Domingo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-300 font-extrabold uppercase block">Disciplina Deportiva</label>
                  <select
                    value={scheduleSport}
                    onChange={(e) => setScheduleSport(e.target.value)}
                    className="w-full bg-[#070c18] border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white font-bold"
                  >
                    {PRESET_SPORTS.map(sp => (
                      <option key={sp} value={sp}>{sp}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-300 font-extrabold uppercase block">Horario de Inicio</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-[#070c18] border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white font-bold text-center"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-300 font-extrabold uppercase block">Notas u Objetivo (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Partido liga, entreno técnica"
                    value={scheduleNotes}
                    onChange={(e) => setScheduleNotes(e.target.value)}
                    className="w-full bg-[#070c18] border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddingSchedule(false)}
                  className="bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20"
                >
                  Confirmar Actividad
                </button>
              </div>
            </form>
          )}

          {/* WEEKLY Sports Schedule Matrix View */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {['day-1', 'day-2', 'day-3', 'day-4', 'day-5', 'day-6', 'day-7'].map((dayId) => {
              const dayName = getDayNameSpanish(dayId);
              const todaysActivities = sportSchedules
                .filter(item => item.dayId === dayId)
                .sort((a, b) => a.time.localeCompare(b.time));

              const runningPlansToday = runningCyclingPlans
                .filter(plan => plan.dayId === dayId && plan.active);

              return (
                <div key={dayId} className="bg-[#0b1323] border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[180px]">
                  <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-indigo-400">{dayName}</span>
                    <span className="text-[10px] bg-[#0e1726] px-1.5 py-0.5 rounded text-white font-bold border border-slate-100/30">
                      {todaysActivities.length + runningPlansToday.length} Act
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {/* General Sports Planned */}
                    {todaysActivities.map((act) => (
                      <div 
                        key={act.id} 
                        className="bg-[#070c18] border border-slate-800 p-2.5 rounded-xl relative group hover:border-[#312e81]/60 transition-all"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-xs font-bold text-white block truncate max-w-[120px]" title={act.sportName}>
                            {act.sportName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSchedule(act.id, act.sportName)}
                            className="text-red-500 hover:text-red-400 hover:bg-slate-900 p-1 rounded transition-all opacity-10 sm:opacity-0 group-hover:opacity-100"
                            title="Quitar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-indigo-300 font-mono font-bold">
                          <Clock className="w-3 h-3 text-indigo-450" />
                          <span>{act.time}hs</span>
                        </div>
                        {act.notes && (
                          <p className="text-[9.5px] text-slate-400 italic mt-1 line-clamp-1 break-all" title={act.notes}>
                            {act.notes}
                          </p>
                        )}
                      </div>
                    ))}

                    {/* Running/Cycling Plans mapped on the schedule for visibility */}
                    {runningPlansToday.map((plan) => (
                      <div 
                        key={`plan-${plan.dayId}`} 
                        className="bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-xl hover:border-emerald-700/60 transition-all font-sans"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-300 flex items-center gap-1 select-none">
                            {plan.activityType === 'Correr' ? '🏃 Fondo' : '🚴 Pedalear'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-mono font-bold">
                          <Clock className="w-2.5 h-2.5 text-emerald-550" />
                          <span>{plan.time}hs</span>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-1 font-semibold leading-tight">
                          Objetivo: <strong className="text-white">{plan.targetDistance} km</strong> en <strong className="text-white">{plan.targetDuration}</strong>
                        </p>
                      </div>
                    ))}

                    {todaysActivities.length === 0 && runningPlansToday.length === 0 && (
                      <div className="h-full flex items-center justify-center text-center py-6 text-[10px] text-slate-600 font-mono italic">
                        Descanso
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ==================== TAB 2: SPECIAL SECTION FOR RUNNING & CYCLING ==================== */}
      {deporteTab === 'running' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* SECTION 1: WEEKLY ROUTING/DISTANCES CONFIG */}
          <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Planificación de Salidas Semanales (Running & Ciclismo)</h3>
              </div>
              <span className="text-[10px] text-white font-mono uppercase bg-[#0e1726] border border-slate-100 px-2.5 py-0.5 rounded-lg font-bold">Prepara tu semana</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
              {runningCyclingPlans.map((plan) => {
                return (
                  <div 
                    key={plan.dayId} 
                    className={`border rounded-2xl p-3 flex flex-col justify-between space-y-4 transition-all ${
                      plan.active 
                        ? 'bg-[#121c33]/70 border-indigo-900 shadow-[0_0_15px_rgba(99,102,241,0.05)]' 
                        : 'bg-[#070c18]/80 border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">{plan.dayName}</span>
                      <input 
                        type="checkbox" 
                        checked={plan.active}
                        onChange={() => handleToggleRunningDay(plan.dayId)}
                        className="w-4 h-4 text-indigo-650 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500 cursor-pointer"
                        title="Marcar día activo"
                      />
                    </div>

                    {plan.active ? (
                      <div className="space-y-2.5 text-xs">
                        {/* Activity Type Selector */}
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block mb-0.5">Actividad</label>
                          <select
                            value={plan.activityType}
                            onChange={(e) => handleUpdateRunningDayValues(plan.dayId, 'activityType', e.target.value)}
                            className="bg-[#070c18] border border-slate-800 text-[10px] px-1.5 py-0.5 rounded text-white font-bold w-full"
                          >
                            <option value="Correr">🏃 Correr</option>
                            <option value="Bici">🚴 Bici</option>
                          </select>
                        </div>

                        {/* Scheduled time */}
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block mb-0.5">Horario</label>
                          <input 
                            type="time" 
                            value={plan.time}
                            onChange={(e) => handleUpdateRunningDayValues(plan.dayId, 'time', e.target.value)}
                            className="bg-[#070c18] border border-slate-800 text-[10px] px-1 py-0.5 rounded text-white font-mono font-bold text-center w-full focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Target Distance */}
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block mb-0.5">Objetivo Km</label>
                          <input 
                            type="number" 
                            step="any"
                            min="0"
                            placeholder="Km"
                            value={plan.targetDistance || ''}
                            onChange={(e) => handleUpdateRunningDayValues(plan.dayId, 'targetDistance', parseFloat(e.target.value) || 0)}
                            className="bg-[#070c18] border border-slate-800 text-[10px] px-1 py-0.5 rounded text-white font-mono font-bold text-center w-full focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Target Duration */}
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block mb-0.5">Tiempo est.</label>
                          <input 
                            type="text" 
                            placeholder="Ej: 45 min"
                            value={plan.targetDuration}
                            onChange={(e) => handleUpdateRunningDayValues(plan.dayId, 'targetDuration', e.target.value)}
                            className="bg-[#070c18] border border-slate-800 text-[10px] px-1 py-0.5 rounded text-white font-bold text-center w-full focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 italic font-mono text-center py-8">
                        Sin planificar
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>


          {/* LOGS HISTORIAL & PERSONAL RECORDS SIDE-BY-SIDE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: ACTIVITY LOGS & NEW LOG SUBMISSION (8 cols) */}
            <div className="lg:col-span-8 bg-[#0b1323] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Historial de Salidas Entrenadas</span>
                </div>
                
                <button
                  onClick={() => setShowLogForm(!showLogForm)}
                  className="bg-indigo-650 hover:bg-indigo-600 font-bold text-xs py-1.5 px-3 rounded-lg text-white flex items-center space-x-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showLogForm ? 'Cerrar Registro' : 'Registrar Salida'}</span>
                </button>
              </div>

              {/* Log submit form */}
              {showLogForm && (
                <form onSubmit={handleAddActivityLog} className="bg-[#070c18] border border-slate-800/80 p-4 rounded-xl space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Tipo de Salida</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setLogType('Correr')}
                          className={`flex-1 font-bold text-xs py-2 rounded-xl border transition-all ${
                            logType === 'Correr' 
                              ? 'bg-indigo-600 border-indigo-400 text-white' 
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          🏃 Salir a Correr
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogType('Bici')}
                          className={`flex-1 font-bold text-xs py-2 rounded-xl border transition-all ${
                            logType === 'Bici' 
                              ? 'bg-indigo-600 border-indigo-400 text-white' 
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          🚴 Andar en Bici
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Fecha del Entrenamiento</label>
                      <input
                        type="date"
                        value={logDate}
                        onChange={(e) => setLogDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-white font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Km Recorridos</label>
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder="Ej: 5.4"
                        value={logDistance}
                        onChange={(e) => setLogDistance(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-white font-mono font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Tiempo Empleado (Duración)</label>
                      <input
                        type="text"
                        placeholder="Ej: 42 min o 1h 15m"
                        value={logDuration}
                        onChange={(e) => setLogDuration(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-white font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Sensación / Energía</label>
                      <select
                        value={logFeeling}
                        onChange={(e) => setLogFeeling(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-white font-bold"
                      >
                        {PRESET_FEELINGS.map(fl => (
                          <option key={fl} value={fl}>{fl}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Anotación o Más Información</label>
                      <input
                        type="text"
                        placeholder="Ej: Mucho viento de ida, completé los últimos 2 km en velocidad máxima."
                        value={logNotes}
                        onChange={(e) => setLogNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white font-bold"
                      />
                    </div>

                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-550 font-bold text-xs py-2.5 px-4 rounded-xl text-white transition-all text-center cursor-pointer shadow-md"
                  >
                    Guardar Sesión en Historial
                  </button>
                </form>
              )}

              {/* Logs List renderer */}
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {activityLogs.length === 0 ? (
                  <div className="text-center font-mono text-xs text-slate-500 py-12 border border-dashed border-slate-800/80 rounded-2xl">
                    No hay salidas agendadas todavía en el historial. ¡Registra la primera del mes arriba!
                  </div>
                ) : (
                  activityLogs.map((log) => {
                    const getFeelingStyle = (f: string) => {
                      if (f.includes('Increíble')) {
                        return 'bg-amber-500/10 text-amber-300 border border-amber-500/20 font-extrabold shadow-sm shadow-amber-500/5';
                      }
                      if (f.includes('Muy Bien')) {
                        return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold';
                      }
                      if (f.includes('Neutral')) {
                        return 'bg-blue-500/10 text-blue-300 border border-blue-500/20';
                      }
                      if (f.includes('Cansado')) {
                        return 'bg-[#251522] text-fuchsia-300 border border-fuchsia-500/20';
                      }
                      if (f.includes('Ritmo')) {
                        return 'bg-[#1e1e2d] text-slate-300 border border-slate-700/50';
                      }
                      return 'bg-slate-900/80 text-slate-300 border border-slate-800';
                    };

                    return (
                      <div 
                        key={log.id} 
                        className="bg-[#070c18] border border-slate-800/80 p-4 rounded-2xl hover:border-slate-700/80 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                              log.type === 'Correr' 
                                ? 'bg-indigo-950 text-indigo-400 border border-indigo-900' 
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                            }`}>
                              {log.type === 'Correr' ? '🏃 Correr' : '🚴 Bici'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold font-mono">{log.date}</span>
                            {log.feeling && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-md ${getFeelingStyle(log.feeling)}`}>
                                {log.feeling}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-4 font-mono select-none">
                            <div className="leading-tight">
                              <span className="text-[9px] text-[#8ea0b3] uppercase font-bold block">Distancia</span>
                              <strong className="text-white text-md font-black">{log.distance} km</strong>
                            </div>
                            <div className="leading-tight border-l border-slate-800 pl-4">
                              <span className="text-[9px] text-[#8ea0b3] uppercase font-bold block">Tiempo</span>
                              <strong className="text-indigo-300 text-md font-black">{log.duration}</strong>
                            </div>
                            <div className="leading-tight border-l border-slate-800 pl-4">
                              <span className="text-[9px] text-[#8ea0b3] uppercase font-bold block">Ritmo Prom.</span>
                              <strong className="text-slate-300 text-xs font-bold font-mono block mt-0.5">
                                {log.distance > 0 ? (
                                  // Simplified pace calculator
                                  `${Math.round((parseInt(log.duration) || 30) / log.distance)} min/km`
                                ) : 'N/A'}
                              </strong>
                            </div>
                          </div>

                          {log.notes && (
                            <p className="text-xs text-slate-300 font-semibold italic bg-[#101726]/40 p-2 rounded-xl border border-slate-900/60 max-w-full">
                              &ldquo; {log.notes} &rdquo;
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveActivityLog(log.id)}
                          className="text-slate-500 hover:text-red-400 hover:bg-slate-900/60 p-2 rounded-lg transition-all border border-transparent hover:border-slate-800 self-end sm:self-auto cursor-pointer"
                          title="Eliminar este entrenamiento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>


            {/* RIGHT: PERSONAL RECORDS (4 cols) */}
            <div className="lg:col-span-4 bg-[#0b1323] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-1.5">
                  <Award className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">Hall of Fame [Récords]</span>
                </div>

                <button
                  onClick={() => setShowRecForm(!showRecForm)}
                  className="bg-amber-600/25 hover:bg-amber-600/40 border border-amber-600/30 text-amber-400 font-black text-[10px] py-1 px-2.5 rounded-lg flex items-center space-x-0.5 cursor-pointer transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>Nuevo Récord</span>
                </button>
              </div>

              {/* Record Input Form */}
              {showRecForm && (
                <form onSubmit={handleAddRecord} className="bg-[#070c18] border border-amber-950 p-3 rounded-xl space-y-3 animate-fade-in text-xs">
                  <span className="text-[10px] font-black text-amber-400 uppercase block">Configurar Marca Máxima</span>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="text-[8.5px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Categoría</label>
                      <select
                        value={recCategory}
                        onChange={(e) => setRecCategory(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 text-[11px] px-2.5 py-1.5 rounded-lg text-white"
                      >
                        <option value="Correr">Running 🏃</option>
                        <option value="Bici">Ciclismo 🚴</option>
                        <option value="Gimnasio">Fuerza / Gym 🏋️</option>
                        <option value="Fútbol">Fútbol ⚽</option>
                        <option value="Otro">Otro Deporte 🎖️</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[8.5px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Hito / Récord</label>
                      <input
                        type="text"
                        placeholder="Ej: Distancia Máxima, Mejor tiempo 10K"
                        value={recTitle}
                        onChange={(e) => setRecTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-[11px] px-2.5 py-1.5 rounded-lg text-white font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[8.5px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Marca / Valor</label>
                      <input
                        type="text"
                        placeholder="Ej: 15.6 km o 44 min 30s"
                        value={recValue}
                        onChange={(e) => setRecValue(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-[11px] px-2.5 py-1.5 rounded-lg text-white font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[8.5px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Fecha</label>
                      <input
                        type="date"
                        value={recDate}
                        onChange={(e) => setRecDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-[11px] px-2.5 py-1.5 rounded-lg text-white font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[8.5px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Detalles o Contexto</label>
                      <input
                        type="text"
                        placeholder="Ej: Media Maratón organizada, circuito plano"
                        value={recDesc}
                        onChange={(e) => setRecDesc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-[11px] px-2.5 py-1.5 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-550 text-white font-bold py-2 rounded-lg text-[10px] mt-2 shadow-[0_0_10px_rgba(245,158,11,0.15)] cursor-pointer"
                  >
                    Guardar Marca Histórica
                  </button>
                </form>
              )}

              {/* Records rendering loop */}
              <div className="space-y-3">
                {specialRecords.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-slate-500 italic">
                    Sin récords cargados. ¡Registra tus récords de distancia, velocidad o fuerza!
                  </div>
                ) : (
                  specialRecords.map((rec) => {
                    const isCorrer = rec.category === 'Correr';
                    const isBici = rec.category === 'Bici';
                    const isGym = rec.category === 'Gimnasio';

                    return (
                      <div 
                        key={rec.id} 
                        className="bg-[#070c18] border border-slate-800 rounded-xl p-3.5 space-y-1 relative group hover:border-amber-900/60 transition-all font-sans"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] uppercase font-black tracking-wider text-amber-500 block">
                            {rec.title}
                          </span>
                          
                          <button
                            onClick={() => handleRemoveRecord(rec.id, rec.title)}
                            className="text-red-500 hover:text-red-400 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Eliminar hito"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-baseline space-x-1">
                          <span className="text-lg font-black text-[#abafb4] font-mono tracking-tight">
                            {rec.value}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-900/80 pt-1.5 mt-1 select-none">
                          <span className="font-mono text-[9px]">{rec.date}</span>
                          <span className="font-semibold text-indigo-400">{rec.category}</span>
                        </div>

                        {rec.description && (
                          <p className="text-[10px] text-slate-400 italic font-semibold line-clamp-1 max-w-full">
                            {rec.description}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>
      )}


      {/* ==================== TAB 3: WEIGHTLIFTING & PROGRESSIVE OVERLOAD (PRESERVED WORKSPACE) ==================== */}
      {deporteTab === 'gym' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <h3 className="text-sm font-bold tracking-wider text-white uppercase">Organizador de Rutinas de Fuerza</h3>
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
                    className="bg-indigo-600 hover:bg-indigo-550 text-white p-2 rounded-xl cursor-pointer"
                    title="Guardar nombre"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingDayName(false)} 
                    className="bg-[#1e293b] hover:bg-[#334155] border border-[#2d3a4f] text-[#cbd5e1] hover:text-white p-2 rounded-xl transition-all cursor-pointer"
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
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-all"
                    title="Editar nombre o rutina"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-400">
                {activeDay.exercises.length === 0 
                  ? 'No hay ejercicios agendados para este día de gimnasio.' 
                  : `Rutina programada con un total de ${activeDay.exercises.length} ejercicios de fuerza.`}
              </p>
            </div>

            {/* Preset routine assign tools */}
            {editingDayName && (
              <div className="w-full md:w-auto bg-[#070c18] p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-indigo-400 uppercase font-black block tracking-wider font-mono">Asignación rápida de entrenamiento:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Pecho y Tríceps', 'Espalda y Bíceps', 'Piernas Completas', 'Hombros y Core', 'Funcional / Cardio', 'Día de Descanso'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleAssignQuickRoutinePreset(p)}
                      className="bg-[#121c33] hover:bg-[#1a2c4e] border border-slate-800 text-[10px] px-2.5 py-1 rounded-lg text-slate-300 font-bold cursor-pointer transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Days of week selector for Strength */}
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
                    <span className="text-[9px] text-slate-500 font-semibold block italic">vacío</span>
                  )}
                  
                  {r.exercises.length > 0 && (
                    <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-indigo-400'}`}></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Exercises workspace list */}
          <div className="space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white flex items-center space-x-1.5">
                <Dumbbell className="w-4 h-4 text-indigo-400" />
                <span>Ejercicios de la Rutina ({activeDay.exercises.length})</span>
              </h4>
              
              <button
                onClick={() => setAddingExercise(!addingExercise)}
                className="cursor-pointer text-xs font-bold px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white flex items-center space-x-1 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{addingExercise ? 'Cerrar Panel' : 'Añadir Ejercicio'}</span>
              </button>
            </div>

            {/* Addition form */}
            {addingExercise && (
              <form 
                onSubmit={handleAddExerciseSubmit} 
                className="bg-[#0b1323] border border-slate-850 p-4 rounded-2xl space-y-4 animate-fade-in shadow-md"
              >
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider block border-b border-slate-800 pb-2">
                  Agregar nuevo ejercicio para {activeDay.dayName}
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-300 font-extrabold uppercase block">Nombre del Ejercicio</label>
                    <input
                      type="text"
                      placeholder="Ej: Press Banca Plano o Sentadillas"
                      required
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                      className="w-full bg-[#070c18] border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-300 font-extrabold uppercase block">Cantidad de Series</label>
                    <select
                      value={newExerciseSetsCount}
                      onChange={(e) => setNewExerciseSetsCount(e.target.value)}
                      className="w-full bg-[#070c18] border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white font-bold cursor-pointer"
                    >
                      <option value="2">2 Series</option>
                      <option value="3">3 Series</option>
                      <option value="4">4 Series</option>
                      <option value="5">5 Series</option>
                      <option value="6">6 Series</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-300 font-extrabold uppercase block">Reps Recomendadas</label>
                    <input
                      type="number"
                      min="1"
                      value={newExerciseReps}
                      onChange={(e) => setNewExerciseReps(e.target.value)}
                      className="w-full bg-[#070c18] border border-slate-800 text-xs px-3 py-2 rounded-xl text-white font-mono text-center focus:outline-none font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-300 font-extrabold uppercase block">Peso Inicial (kg)</label>
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
                  className="w-full bg-indigo-600 hover:bg-indigo-550 font-bold text-xs py-2.5 px-4 rounded-xl text-white transition-all text-center cursor-pointer shadow-md"
                >
                  Insertar Ejercicio en Rutina
                </button>
              </form>
            )}

            {/* List */}
            {activeDay.exercises.length === 0 ? (
              <div className="text-center bg-[#070c18] border border-slate-800 rounded-2xl py-12 px-6 text-slate-500 text-xs font-mono">
                No tenés ejercicios cargados para la rutina de este día. ¡Usa el botón "Añadir Ejercicio" de arriba!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {activeDay.exercises.map((ex) => {
                  const isLogDrawerOpen = expandedLogId === ex.id;
                  
                  return (
                    <div 
                      key={ex.id}
                      className="bg-[#0b1323] border border-slate-800/80 p-4 rounded-2xl space-y-4"
                      id={`gym-exercise-card-${ex.id}`}
                    >
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
                              className="bg-emerald-600 hover:bg-emerald-555 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer"
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingExerciseId(null)}
                              className="bg-[#1e293b] hover:bg-[#334155] border border-[#2d3a4f] text-[#cbd5e1] hover:text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <h5 className="text-sm font-extrabold text-white">{ex.name}</h5>
                            <p className="text-[10px] text-slate-400 font-semibold font-mono">
                              {ex.sets.length} Series fetiches registradas para hoy
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleStartEditExercise(ex)}
                              className="text-[10px] bg-[#0e1726] hover:bg-indigo-650 text-white p-1 px-2.5 rounded-lg font-bold transition-all cursor-pointer border border-slate-100/50 hover:border-indigo-500/50"
                            >
                              Modificar
                            </button>
                            <button
                              onClick={() => setExpandedLogId(isLogDrawerOpen ? null : ex.id)}
                              className="text-[10px] bg-[#121c33] hover:bg-[#1a2c4e] border border-slate-850 hover:text-white text-slate-200 p-1 px-2.5 rounded-lg font-bold flex items-center space-x-1 transition-all cursor-pointer"
                            >
                              <span>Historial</span>
                              {isLogDrawerOpen ? <ChevronUp className="w-3 h-3 text-indigo-400" /> : <ChevronDown className="w-3 h-3 text-indigo-400" />}
                            </button>
                            <button
                              onClick={() => handleRemoveExercise(activeDay.id, ex.id)}
                              className="text-red-500 hover:text-red-450 p-1.5 hover:bg-[#070c18] rounded-lg transition-all cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Progressive Overload Progression Table */}
                      {isLogDrawerOpen && (
                        <div className="bg-[#070c11] border border-slate-850 rounded-xl p-3 text-xs space-y-2 animate-fade-in font-mono">
                          <div className="flex items-center justify-between text-[10px] text-indigo-400 uppercase font-black tracking-wider pb-1.5 border-b border-slate-800">
                            <span className="flex items-center gap-1 font-sans">
                              <Sparkles className="w-3 h-3 text-indigo-455" />
                              <span className="text-indigo-300 font-extrabold">Sobrecarga y Pesos Levantados:</span>
                            </span>
                          </div>
                          
                          {ex.weeklyHistoryLog && ex.weeklyHistoryLog.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {ex.weeklyHistoryLog.map((log, lIdx) => (
                                <div key={lIdx} className="bg-[#0b1323] border border-slate-850 p-2 rounded-lg text-center leading-tight">
                                  <span className="text-[9px] text-[#869ab3] font-bold block">{log.date}</span>
                                  <span className="font-extrabold text-white block text-xs mt-1">{log.weight} kg</span>
                                  <span className="text-[9px] text-slate-400 font-bold block">x {log.reps} reps ({log.setsCount}s)</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 block text-center py-1">No hay historial de overload de peso para renderizar.</span>
                          )}
                        </div>
                      )}

                      {/* WORKOUT SETS - INTERACTIVE CHECKLIST */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs" id="sets-checklist-section">
                        {ex.sets.map((set, sIdx) => {
                          return (
                            <div 
                              key={sIdx}
                              style={{ minHeight: '44px' }}
                              className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                                set.completed 
                                  ? 'bg-[#06241a] border-emerald-800 text-emerald-250 opacity-100' 
                                  : 'bg-[#121c33] border-slate-800 hover:border-slate-700 text-slate-150'
                              }`}
                            >
                              <div className="flex items-center space-x-2 font-extrabold select-none">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#18102c] border border-slate-150 text-indigo-200 font-mono font-bold">
                                  S{sIdx + 1}
                                </span>
                                
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
                                  <span className="text-[10px] text-slate-400 font-bold">kg</span>
                                </div>

                                <span className="text-slate-600 font-thin">|</span>

                                <div className="flex items-center space-x-0.5 font-mono">
                                  <input
                                    type="number"
                                    min="1"
                                    value={set.reps || ''}
                                    onChange={(e) => handleUpdateSetValues(activeDay.id, ex.id, sIdx, set.weight, parseInt(e.target.value) || 0)}
                                    className="w-8 bg-transparent text-center font-bold text-white border-b border-slate-500 focus:border-indigo-400 focus:outline-none"
                                    placeholder="..."
                                  />
                                  <span className="text-[10px] text-slate-400 font-bold">reps</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleToggleSetCompleted(activeDay.id, ex.id, sIdx)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                  set.completed 
                                    ? 'bg-emerald-555 text-white' 
                                    : 'border border-slate-700 hover:border-indigo-500 hover:bg-slate-900 text-transparent hover:text-slate-200'
                                }`}
                                title="Completar Serie"
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
      )}

    </div>
  );
}
