/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Flame, 
  Sparkles, 
  Zap, 
  Trash2, 
  PlusCircle, 
  X, 
  CheckCircle2, 
  Award, 
  ShieldAlert, 
  BookOpen, 
  Heart, 
  Coins, 
  Briefcase, 
  Brain,
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { Habit } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { customConfirm } from '../utils/customAlerts';

interface HabitsModuleProps {
  habits: Habit[];
  onUpdateHabits: (newHabits: Habit[]) => void;
}

export default function HabitsModule({ habits, onUpdateHabits }: HabitsModuleProps) {
  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'track' | 'manage' | 'stats'>('track');

  // New Habit creation states
  const [newTitle, setNewTitle] = useState('');
  const [newIdentity, setNewIdentity] = useState('');
  const [newCue, setNewCue] = useState('');
  const [newFrictionTip, setNewFrictionTip] = useState('');
  const [newCategory, setNewCategory] = useState<Habit['category']>('Salud');
  const [isHarmful, setIsHarmful] = useState(false);

  // Edit Habit state
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editIdentity, setEditIdentity] = useState('');
  const [editCue, setEditCue] = useState('');
  const [editFrictionTip, setEditFrictionTip] = useState('');
  const [editCategory, setEditCategory] = useState<Habit['category']>('Salud');
  const [editIsHarmful, setEditIsHarmful] = useState(false);

  // Get current date string (YYYY-MM-DD)
  const todayStr = getLocalDateString();
  
  // Get yesterday date string
  const getYesterdayStr = (): string => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateString(d);
  };
  const yesterdayStr = getYesterdayStr();

  // Helper mapping categories to icons
  const getCategoryIcon = (cat: Habit['category'], harmful: boolean) => {
    if (harmful) return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    switch (cat) {
      case 'Salud': return <Heart className="w-4 h-4 text-rose-400" />;
      case 'Mente': return <Brain className="w-4 h-4 text-purple-400" />;
      case 'Finanzas': return <Coins className="w-4 h-4 text-amber-400" />;
      case 'Trabajo': return <Briefcase className="w-4 h-4 text-indigo-400" />;
      default: return <BookOpen className="w-4 h-4 text-cyan-400" />;
    }
  };

  // Handler to toggle daily completion for today
  const handleToggleHabitToday = (id: string) => {
    const updated = habits.map(h => {
      if (h.id === id) {
        const historyCopy = { ...h.history };
        const currentlyDone = !!historyCopy[todayStr];
        const isDoneNow = !currentlyDone;
        
        historyCopy[todayStr] = isDoneNow;

        // Recalculate current streak
        let newStreak = h.streak;
        if (isDoneNow) {
          // Check if yesterday was also completed to increment racha
          const wasYesterdayCompleted = !!historyCopy[yesterdayStr];
          
          // Simple local racha increment for modern UI feedback
          // If we completed yesterday, we increment. If we start fresh or break, start with 1.
          if (wasYesterdayCompleted) {
            newStreak = h.streak + 1;
          } else {
            // Did the user already complete it today, or is this the first action on a clean day?
            // If they didn't complete yesterday but had a streak, we check if they completed
            // the day before yesterday, or just set it to 1 if streak was lost.
            newStreak = h.streak === 0 ? 1 : h.streak;
          }
        } else {
          // Uncompleted today. Recalculate.
          // Since it's unmarked, let's see if yesterday was completed.
          const wasYesterdayCompleted = !!historyCopy[yesterdayStr];
          if (wasYesterdayCompleted) {
            newStreak = h.streak > 1 ? h.streak - 1 : 0;
          } else {
            newStreak = 0;
          }
        }

        const bestStreak = Math.max(h.bestStreak, newStreak);

        return {
          ...h,
          history: historyCopy,
          streak: newStreak,
          bestStreak
        };
      }
      return h;
    });
    onUpdateHabits(updated);
  };

  // Handler to toggle daily completion for yesterday (retroactive check)
  const handleToggleHabitYesterday = (id: string) => {
    const updated = habits.map(h => {
      if (h.id === id) {
        const historyCopy = { ...h.history };
        const currentlyDone = !!historyCopy[yesterdayStr];
        const isDoneNow = !currentlyDone;
        
        historyCopy[yesterdayStr] = isDoneNow;

        // Recalculate streak
        let newStreak = h.streak;
        if (isDoneNow) {
          // Incremented retroactive
          newStreak = h.streak + (historyCopy[todayStr] ? 1 : 0);
          if (newStreak === 0) newStreak = 1;
        } else {
          // Decremented retroactive
          if (historyCopy[todayStr]) {
            newStreak = 1; // broken yesterday but yes today
          } else {
            newStreak = 0;
          }
        }

        const bestStreak = Math.max(h.bestStreak, newStreak);

        return {
          ...h,
          history: historyCopy,
          streak: newStreak,
          bestStreak
        };
      }
      return h;
    });
    onUpdateHabits(updated);
  };

  // Handler to create a new habit
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: newTitle,
      identity: newIdentity || 'Una mejor versión de mí mismo',
      cue: newCue || 'Al iniciar mi rutina diaria',
      frictionTip: newFrictionTip || 'Preparar todo la noche anterior',
      category: newCategory,
      isHarmful,
      streak: 0,
      bestStreak: 0,
      history: {},
    };

    onUpdateHabits([...habits, newHabit]);

    // Reset input fields
    setNewTitle('');
    setNewIdentity('');
    setNewCue('');
    setNewFrictionTip('');
    setNewCategory('Salud');
    setIsHarmful(false);
  };

  // Delete Habit
  const handleRemoveHabit = (id: string) => {
    customConfirm(
      '¿Deseas eliminar este hábito definitivamente? Se borrará su historial de rachas.',
      () => {
        onUpdateHabits(habits.filter(h => h.id !== id));
      },
      undefined,
      'Eliminar Hábito'
    );
  };

  // Begin edits
  const startEditHabit = (h: Habit) => {
    setEditingHabitId(h.id);
    setEditTitle(h.title);
    setEditIdentity(h.identity);
    setEditCue(h.cue);
    setEditFrictionTip(h.frictionTip);
    setEditCategory(h.category);
    setEditIsHarmful(h.isHarmful);
  };

  // Save edits
  const handleSaveEdit = (id: string) => {
    if (!editTitle) return;
    const updated = habits.map(h => {
      if (h.id === id) {
        return {
          ...h,
          title: editTitle,
          identity: editIdentity,
          cue: editCue,
          frictionTip: editFrictionTip,
          category: editCategory,
          isHarmful: editIsHarmful
        };
      }
      return h;
    });
    onUpdateHabits(updated);
    setEditingHabitId(null);
  };

  // Reset all habits history to start fresh
  const handleResetHistory = () => {
    customConfirm(
      '¿Estás seguro de blanquear todas tus rachas e historiales para empezar de cero estricto?',
      () => {
        const updated = habits.map(h => ({
          ...h,
          streak: 0,
          bestStreak: 0,
          history: {}
        }));
        onUpdateHabits(updated);
      },
      undefined,
      'Reiniciar Historial de Hábitos'
    );
  };

  // Stats calculation
  const totalCreated = habits.length;
  const currentFostered = habits.filter(h => !h.isHarmful).length;
  const currentToBreak = habits.filter(h => h.isHarmful).length;
  
  // Total completed today
  const doneTodayCount = habits.filter(h => !!h.history[todayStr]).length;
  const percentageDoneToday = totalCreated > 0 ? Math.round((doneTodayCount / totalCreated) * 100) : 0;

  // Best overall streak
  const bestOverallStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak), 0);

  // Identity building stats (reinforcement)
  const uniqueIdentities = Array.from(new Set(habits.map(h => h.identity).filter(Boolean)));

  return (
    <div className="space-y-6" id="habits-core-container">
      
      {/* Module Title & Introduction banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/60 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-extrabold text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Desarrollo de Carácter Humano</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Hábitos Atómicos 🌌</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            "No te elevas al nivel de tus metas, desciendes al nivel de tus sistemas". Crea sistemas diarios basados en tu <strong>Identidad</strong> y apila disparadores obvios.
          </p>
        </div>

        {/* Sub-tab Pill Navigation */}
        <div className="flex space-x-1.5 bg-[#0a0f1d] border border-slate-800/80 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSubTab('track')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'track' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registro Diario
          </button>
          <button
            onClick={() => setActiveSubTab('manage')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'manage' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Configurar Sistemas
          </button>
          <button
            onClick={() => setActiveSubTab('stats')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'stats' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Auditoría de Identidad
          </button>
        </div>
      </div>

      {/* Main tab switchboard */}
      {activeSubTab === 'track' && (
        <div className="space-y-5 animate-in fade-in duration-200" id="habits-track-panel">
          
          {/* Status Tracker Hero Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 text-center flex flex-col justify-center items-center">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">Completado Hoy</span>
              <span className="text-3xl font-black text-white block mt-1 font-mono">{doneTodayCount} / {totalCreated}</span>
              <div className="w-full bg-[#070c18] h-1.5 rounded-full overflow-hidden mt-3 max-w-[120px]">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all"
                  style={{ width: `${percentageDoneToday}%` }}
                ></div>
              </div>
              <span className="text-[9.5px] text-slate-500 block mt-1">{percentageDoneToday}% de tus rituales</span>
            </div>

            <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 text-center flex flex-col justify-center items-center">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">Mejor Racha Consecutiva</span>
              <span className="text-3xl font-black text-emerald-400 mt-1 font-mono flex items-center justify-center space-x-1">
                <Flame className="w-6 h-6 text-orange-500 shrink-0 fill-orange-500" />
                <span>{bestOverallStreak} {bestOverallStreak === 1 ? 'día' : 'días'}</span>
              </span>
              <span className="text-[9.5px] text-slate-500 block mt-1">Sosteniendo la disciplina diaria</span>
            </div>

            <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 text-center flex flex-col justify-center items-center">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest block">Metas Identitarias Activas</span>
              <span className="text-3xl font-black text-white block mt-1 font-mono">{uniqueIdentities.length}</span>
              <span className="text-[9.5px] text-slate-500 block mt-1">Ejes de autoconstrucción personal</span>
            </div>
          </div>

          {/* Golden Rule Warning: Never miss twice! */}
          {habits.some(h => !h.history[todayStr] && !h.history[yesterdayStr] && Object.keys(h.history).length > 0) && (
            <div className="bg-amber-950/20 border border-amber-900/60 rounded-xl p-3 flex items-start space-x-3 text-xs text-amber-350">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold text-[12.5px] block text-amber-300">⚠️ ¡Ley de Oro Atómica en Riesgo!</strong>
                <p className="mt-0.5 text-slate-300 leading-normal">
                  "Nunca faltes dos veces seguidas. La primera falta es un accidente; la segunda es el comienzo de un nuevo mal hábito". Tienes hábitos que no completaste ayer ni hoy de forma sostenida. ¡Hoy es el día decisivo para recuperar la disciplina!
                </p>
              </div>
            </div>
          )}

          {/* List of Habits */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Tus Sistemas Diario</span>
              <span className="text-[10px] text-slate-500 italic">Marca para registrar progreso</span>
            </div>

            {habits.length === 0 ? (
              <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                <p className="text-sm text-slate-400 bg-transparent">
                  No tienes ningún hábito configurado en este momento.
                </p>
                <button
                  onClick={() => setActiveSubTab('manage')}
                  className="cursor-pointer bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition-all inline-flex items-center space-x-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Crear mi Primer Hábito</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="habits-cards-grid">
                {habits.map((habit) => {
                  const doneToday = !!habit.history[todayStr];
                  const doneYesterday = !!habit.history[yesterdayStr];
                  const wasMissedDanger = !doneToday && !doneYesterday && Object.keys(habit.history).length > 0;

                  return (
                    <div 
                      key={habit.id} 
                      className={`relative rounded-xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
                        doneToday 
                          ? 'bg-[#081b16] border-emerald-900/50 shadow-sm' 
                          : wasMissedDanger 
                            ? 'bg-[#1c0d0f] border-rose-905/60 shadow-xs'
                            : 'bg-[#0b1323] border-slate-800'
                      }`}
                    >
                      {/* Identity header & category */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-1.5">
                          {getCategoryIcon(habit.category, habit.isHarmful)}
                          <span className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400">
                            {habit.category} {habit.isHarmful ? '• NOCIVO' : ''}
                          </span>
                        </div>
                        {habit.streak > 0 && (
                          <div className="flex items-center space-x-1 bg-orange-950/40 border border-orange-900/40 px-2 py-0.5 rounded-full text-orange-400 text-[10.5px] font-mono font-bold">
                            <Flame className="w-3.5 h-3.5 fill-orange-500" />
                            <span>{habit.streak} d</span>
                          </div>
                        )}
                      </div>

                      {/* Main Title */}
                      <div>
                        {habit.isHarmful ? (
                          <span className="text-[10px] text-rose-450 font-bold block">Meta: Eliminar Hábito Frecuente</span>
                        ) : (
                          <span className="text-[10px] text-slate-500 block">Identidad: Proyectarse como <strong>{habit.identity}</strong></span>
                        )}
                        <h4 className="text-sm font-black text-white mt-0.5">{habit.title}</h4>
                      </div>

                      {/* Habit stacking Formula Cue & Friction Tip info block */}
                      <div className="bg-[#070c18] border border-slate-100/60 rounded-lg p-2.5 text-[11px] space-y-1">
                        <div className="flex items-start space-x-1.5">
                          <Zap className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                          <p className="text-slate-300 leading-normal">
                            <strong className="text-slate-400">Apilado (Cue):</strong> {habit.cue}
                          </p>
                        </div>
                        {habit.frictionTip && (
                          <div className="flex items-start space-x-1.5 border-t border-slate-800/40 pt-1.5 mt-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            <p className="text-slate-300 leading-normal">
                              <strong className="text-slate-400">Facilitador / Fricción:</strong> {habit.frictionTip}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Day Logs Activations */}
                      <div className="flex items-center justify-between border-t border-slate-800/50 pt-2.5 mt-1">
                        
                        {/* Yesterday retroactive check */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleHabitYesterday(habit.id)}
                            className={`cursor-pointer text-[10px] px-2 py-1 rounded-md transition-all flex items-center space-x-1 ${
                              doneYesterday 
                                ? 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 font-extrabold' 
                                : 'bg-[#1e293b] border border-[#2d3a4f] text-[#cbd5e1] hover:text-white hover:bg-[#334155]'
                            }`}
                          >
                            <span>Ayer</span>
                            <span>{doneYesterday ? '✓' : '✗'}</span>
                          </button>
                        </div>

                        {/* Today Action Switcher */}
                        <button
                          onClick={() => handleToggleHabitToday(habit.id)}
                          className={`cursor-pointer px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                            doneToday 
                              ? 'bg-emerald-600 hover:bg-emerald-550 text-white shadow-md' 
                              : 'bg-indigo-600 hover:bg-indigo-550 text-white shadow-md'
                          }`}
                        >
                          {doneToday ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>¡Completado Hoy!</span>
                            </>
                          ) : (
                            <>
                              <span>Marcar Completado</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Golden Rule Warning Overlay direct check */}
                      {wasMissedDanger && (
                        <div className="absolute top-0 right-1 translate-y-2 inline-block">
                          <span className="bg-rose-950 border border-rose-900 text-rose-400 font-black text-[8px] tracking-wider uppercase px-2 py-0.5 rounded-full animate-bounce">
                            ⚠️ ALERTA: NO FALTAR HOY
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'manage' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="habits-manage-panel">
          
          {/* Section: Add New Atomic System */}
          <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              <span>Diseñar e Inyectar Nuevo Hábito Sistémico</span>
            </h3>

            <form onSubmit={handleAddHabit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">¿Cuál es el Hábito? (Acción Atómica Simple)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Leer 10 páginas / Meditar 5 min / 30 flexiones"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#070c18] border border-slate-800 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-white"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Identidad de Destino Asociada (¿Qué tipo de persona sos?)</label>
                  <input
                    type="text"
                    placeholder="Ej: Lector constante, Persona saludable, Inversor libre"
                    value={newIdentity}
                    onChange={(e) => setNewIdentity(e.target.value)}
                    className="w-full bg-[#070c18] border border-slate-800 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-white"
                  />
                </div>
              </div>

              {/* Stacking cue detail text areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Apilamiento de Hábito: "Después de [Hábito Actual], voy a..."</label>
                  <input
                    type="text"
                    placeholder="Ej: Después de apagar la alarma matutina / Después de tomar mi café diario"
                    value={newCue}
                    onChange={(e) => setNewCue(e.target.value)}
                    className="w-full bg-[#070c18] border border-slate-800 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-300 leading-normal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Diseño de Fricción (Hacerlo obvio/fácil para construir, o difícil para eliminar)</label>
                  <input
                    type="text"
                    placeholder="Ej: Dejar el libro arriba de la almohada / Esconder el joystick en el ropero"
                    value={newFrictionTip}
                    onChange={(e) => setNewFrictionTip(e.target.value)}
                    className="w-full bg-[#070c18] border border-slate-800 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-300 leading-normal"
                  />
                </div>
              </div>

              {/* Categorization & toggle harmful habits */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Categoría del Hábito</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-[#070c18] border border-slate-800 px-2 py-2 text-xs rounded-xl focus:outline-none font-bold text-slate-200 cursor-pointer"
                  >
                    <option value="Salud">Salud / Deportivo</option>
                    <option value="Mente">Mente / Educación</option>
                    <option value="Finanzas">Finanzas / Ahorro</option>
                    <option value="Trabajo">Trabajo / Enfoque</option>
                    <option value="Social">Social / Relaciones</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 py-2.5">
                  <input
                    type="checkbox"
                    id="is_harmful_checkbox"
                    checked={isHarmful}
                    onChange={(e) => setIsHarmful(e.target.checked)}
                    className="w-4 h-4 cursor-pointer text-indigo-600 focus:ring-indigo-500 bg-[#070c18] border-slate-800 rounded"
                  />
                  <label htmlFor="is_harmful_checkbox" className="text-slate-300 font-bold cursor-pointer select-none">
                    ¿Es un hábito nocivo a eliminar?
                  </label>
                </div>

                <div className="col-span-2">
                  <button
                    type="submit"
                    className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-550 font-bold text-xs py-2.5 px-4 rounded-xl text-white transition-all text-center flex items-center justify-center space-x-1"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Agregar al Programa Sistémico</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Table index to modify existing templates */}
          <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-white">Inventario Atómico & Configuración Activa</h3>
              <button
                onClick={handleResetHistory}
                className="cursor-pointer text-[10px] text-red-400 hover:text-red-300 flex items-center space-x-1 bg-red-950/20 px-2 py-1 rounded-lg border border-red-900/40"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Blanquear Rachas</span>
              </button>
            </div>

            {habits.length === 0 ? (
              <p className="text-slate-450 italic text-xs text-center py-4 bg-transparent">
                No hay sistemas registrados actualmente.
              </p>
            ) : (
              <div className="divide-y divide-slate-800/60 font-sans" id="editorial-habit-inventory">
                {habits.map((habit) => (
                  <div key={habit.id} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    
                    {/* View Details / Output */}
                    {editingHabitId === habit.id ? (
                      <div className="flex-grow space-y-3 p-3 bg-[#070c18] border border-slate-800 rounded-xl text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold block">Título Hábito</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full bg-[#0b1323] border border-slate-100 text-xs px-2 py-1.5 rounded-lg text-white font-bold"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold block">Identidad</label>
                            <input
                              type="text"
                              value={editIdentity}
                              onChange={(e) => setEditIdentity(e.target.value)}
                              className="w-full bg-[#0b1323] border border-slate-100 text-xs px-2 py-1.5 rounded-lg text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold block">Apilado (Cue Formula)</label>
                            <input
                              type="text"
                              value={editCue}
                              onChange={(e) => setEditCue(e.target.value)}
                              className="w-full bg-[#0b1323] border border-slate-100 text-xs px-2 py-1.5 rounded-lg text-white"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold block">Facilitador / Fricción</label>
                            <input
                              type="text"
                              value={editFrictionTip}
                              onChange={(e) => setEditFrictionTip(e.target.value)}
                              className="w-full bg-[#0b1323] border border-slate-100 text-xs px-2 py-1.5 rounded-lg text-white"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`edit_harmful_${habit.id}`}
                              checked={editIsHarmful}
                              onChange={(e) => setEditIsHarmful(e.target.checked)}
                              className="w-3.5 h-3.5 text-indigo-650 bg-[#0b1323] border-slate-800 rounded"
                            />
                            <label htmlFor={`edit_harmful_${habit.id}`} className="text-[10px] text-slate-300 font-bold">
                              Hábito Nocivo/Perjudicial
                            </label>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingHabitId(null)}
                              className="bg-[#1e293b] hover:bg-[#334155] border border-[#2d3a4f] text-[#cbd5e1] hover:text-white font-bold px-3 py-1 rounded-lg text-[10px] transition-all"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveEdit(habit.id)}
                              className="bg-emerald-600 text-white font-bold px-3.5 py-1 rounded-lg text-[10px]"
                            >
                              Guardar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-grow space-y-1 text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-indigo-400 font-mono">
                              {habit.category}
                            </span>
                            {habit.isHarmful && (
                              <span className="text-[9px] bg-[#1a0a0c] border border-rose-950 px-2 py-0.5 rounded text-rose-450 font-bold uppercase">
                                NOCIVO
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500">
                              Racha actual: <strong className="text-orange-400">{habit.streak} d</strong> | Mejor: <strong className="text-slate-300">{habit.bestStreak} d</strong>
                            </span>
                          </div>
                          <h4 className="text-[#ccc7c7] font-black text-[13.5px] leading-tight">
                            {habit.title}
                          </h4>
                          <p className="text-[10.5px] text-slate-400 italic leading-snug">
                            Construye la identidad de: <strong>{habit.identity}</strong>
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => startEditHabit(habit)}
                            className="bg-[#1e293b] hover:bg-indigo-900/40 text-indigo-400 hover:text-white border border-[#2c3749] px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleRemoveHabit(habit.id)}
                            className="bg-red-950/40 hover:bg-red-950 border border-red-900/35 text-red-400 hover:text-red-300 p-1.5 rounded-lg transition-all"
                            title="Eliminar un hábito"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'stats' && (
        <div className="space-y-5 animate-in fade-in duration-200" id="habits-stats-panel">
          
          {/* Audit Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Identity Strengthening Score */}
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 space-y-3.5">
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
                <Award className="w-5 h-5 text-indigo-400" />
                <span>Nivel de Integración de Identidad</span>
              </h3>
              
              <p className="text-xs text-slate-400 leading-relaxed bg-transparent">
                Cada vez que repites un hábito positivo, estás depositando un "voto" para convertirte en esa persona proyectada. A continuación se desglosan las personalidades que estás moldeando:
              </p>

              {uniqueIdentities.length === 0 ? (
                <p className="text-slate-450 italic text-xs py-2 bg-transparent">No has declarado identidades ligadas a tus hábitos todavía.</p>
              ) : (
                <div className="space-y-3 pt-2">
                  {uniqueIdentities.map((identityName, idx) => {
                    const linkedHabits = habits.filter(h => h.identity === identityName);
                    const doneList = linkedHabits.filter(h => !!h.history[todayStr]);
                    const scorePercentage = Math.round((doneList.length / linkedHabits.length) * 100);

                    return (
                      <div key={idx} className="bg-[#070c18] border border-slate-100 p-3 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-[#8ab8b8]">"{identityName}"</span>
                          <span className="text-[10px] text-slate-400">Votos de hoy: {doneList.length}/{linkedHabits.length}</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all"
                            style={{ width: `${scorePercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>{linkedHabits.length} {linkedHabits.length === 1 ? 'hábito' : 'hábitos'} sistemático</span>
                          <span className="font-bold text-slate-400">{scorePercentage}% completado</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Scientific explanation board */}
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 space-y-3.5">
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span>La Ciencia de los Hábitos Atómicos</span>
              </h3>

              <div className="space-y-4 text-sm leading-relaxed">
                <div className="border-l-2 border-indigo-500 pl-3.5">
                  <strong className="text-indigo-300 block text-[13.5px] font-bold">1. Las Cuatro Leyes del Cambio de Conducta:</strong>
                  <p className="text-[#cbcbcb] text-xs sm:text-[13px] mt-1">
                    Para adquirir un hábito positivo: Hazlo obvio, Hazlo atractivo, Hazlo sencillo, Hazlo satisfactorio. Para eliminar uno nocivo: Hazlo invisible, Hazlo poco atractivo, Hazlo difícil, Hazlo insatisfactorio.
                  </p>
                </div>

                <div className="border-l-2 border-emerald-500 pl-3.5">
                  <strong className="text-emerald-300 block text-[13.5px] font-bold">2. El Enfoque de Identidad:</strong>
                  <p className="text-[#cbcbcb] text-xs sm:text-[13px] mt-1">
                    La verdadera transformación no nace de qué quieres conseguir (ej: bajar 5 kilos), sino de en quién te quieres convertir (ej: ser un deportista íntegro). Esto remueve la disonancia cognitiva y genera constancia de largo plazo.
                  </p>
                </div>

                <div className="border-l-2 border-purple-500 pl-3.5">
                  <strong className="text-purple-300 block text-[13.5px] font-bold">3. El Poder del 1% Diario:</strong>
                  <p className="text-[#cbcbcb] text-xs sm:text-[13px] mt-1">
                    Si logras mejorar solo un 1% cada día en tus rituales, al finalizar un año serás 37 veces mejor en ese aspecto. Las pequeñas mejoras recurrentes producen un interés compuesto de desarrollo humano.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Last 7 days grid visualization */}
          <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white">Visualización Histórica Reciente (Últimos 7 días)</h3>
            
            {habits.length === 0 ? (
              <p className="text-slate-450 text-xs italic text-center py-2 bg-transparent">Configura hábitos para ver el mapa de calor.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="py-2 font-bold text-slate-300">Hábito / Sistema</th>
                      {[6, 5, 4, 3, 2, 1, 0].map((offset) => {
                        const d = new Date();
                        d.setDate(d.getDate() - d.getDay() + d.getDay() - offset); // Simple offset calculation for labels
                        const dayLabel = d.toLocaleDateString('es-AR', { weekday: 'narrow' });
                        const dateString = getLocalDateString(d);
                        return (
                          <th key={offset} className="py-2 text-center font-bold">
                            <span className="block text-[10.5px] font-mono text-slate-400">{dayLabel.toUpperCase()}</span>
                            <span className="block text-[9px] text-slate-500 font-mono">{d.getDate()}</span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {habits.map((habit) => (
                      <tr key={habit.id} className="hover:bg-slate-950/40">
                        <td className="py-2.5 font-bold text-slate-200 text-xs">
                          <span className="block text-[11px] font-mono text-slate-400 italic">"{habit.identity}"</span>
                          <span className="text-[#cbcbcb]">{habit.title}</span>
                        </td>
                        {[6, 5, 4, 3, 2, 1, 0].map((offset) => {
                          const d = new Date();
                          d.setDate(d.getDate() - offset);
                          const dateKey = getLocalDateString(d);
                          const done = !!habit.history[dateKey];

                          return (
                            <td key={offset} className="p-2 text-center">
                              <span 
                                className={`inline-flex w-4 h-4 rounded items-center justify-center font-mono font-bold text-[9px] ${
                                  done 
                                    ? 'bg-emerald-500 text-slate-950 font-black' 
                                    : 'bg-slate-900 text-slate-700 font-medium'
                                }`}
                                title={dateKey}
                              >
                                {done ? '✓' : '•'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
