/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  DollarSign, 
  Brain, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Target, 
  Compass, 
  ChevronRight, 
  AlertCircle, 
  ArrowUpRight, 
  Lock 
} from 'lucide-react';
import { ToDoTask, Habit, Income, Expense } from '../types';
import { customAlert } from '../utils/customAlerts';

interface GrowthCoreProps {
  userName: string;
  tasks: ToDoTask[];
  habits: Habit[];
  incomes: Income[];
  expenses: Expense[];
  onNavigate: (tab: 'panel' | 'finance' | 'gym' | 'todo' | 'habits' | 'journal' | 'settings') => void;
}

export type GrowthFocusType = 'alto_rendimiento' | 'libertad_financiera' | 'mente_acero' | 'salud_vitalidad';

export default function GrowthCore({
  userName,
  tasks,
  habits,
  incomes,
  expenses,
  onNavigate
}: GrowthCoreProps) {
  // --- States ---
  const [focus, setFocus] = useState<GrowthFocusType>(() => {
    return (localStorage.getItem('control_personal_growth_focus') as GrowthFocusType) || 'mente_acero';
  });

  const [xp, setXp] = useState<number>(() => {
    return parseInt(localStorage.getItem('control_personal_growth_xp') || '0', 10);
  });

  const [completedMissions, setCompletedMissions] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('control_personal_growth_completed_missions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [aiBlueprint, setAiBlueprint] = useState<string | null>(() => {
    return localStorage.getItem('control_personal_growth_blueprint') || null;
  });

  const [loadingBlueprint, setLoadingBlueprint] = useState(false);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState('');

  const [hasSavedKey, setHasSavedKey] = useState(() => {
    return !!localStorage.getItem('user_custom_gemini_key');
  });

  // Calculate Level and XP boundaries
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;
  const nextLevelXp = 100;

  // Get Rank Title
  const getRankTitle = (lvl: number) => {
    if (lvl === 1) return 'Iniciado de la Disciplina';
    if (lvl === 2) return 'Buscador de la Virtud';
    if (lvl === 3) return 'Guerrero del Hábito';
    if (lvl === 4) return 'Maestro del Enfoque';
    if (lvl === 5) return 'Sabio de la Rutina';
    return 'Leyenda Imparable';
  };

  // Sync Focus to localstorage
  useEffect(() => {
    localStorage.setItem('control_personal_growth_focus', focus);
    // When focus changes, reset completed missions for fresh challenges
    setCompletedMissions([]);
    localStorage.setItem('control_personal_growth_completed_missions', JSON.stringify([]));
  }, [focus]);

  // Sync XP to localstorage
  useEffect(() => {
    localStorage.setItem('control_personal_growth_xp', xp.toString());
  }, [xp]);

  // Sync completed missions
  useEffect(() => {
    localStorage.setItem('control_personal_growth_completed_missions', JSON.stringify(completedMissions));
  }, [completedMissions]);

  // Loading Phrases animator for the Mentor
  useEffect(() => {
    let interval: any;
    if (loadingBlueprint) {
      const phrases = [
        'Sincronizando con tus bitácoras estoicas...',
        'Evaluando tu flujo de hábitos atómicos...',
        'Calculando eficiencia de tu balance financiero...',
        'Estructurando tácticas del 1% con el Oráculo...',
        'Diseñando tu plan de batalla semanal inquebrantable...'
      ];
      let idx = 0;
      setLoadingPhrase(phrases[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % phrases.length;
        setLoadingPhrase(phrases[idx]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loadingBlueprint]);

  // Pre-crafted strategic roadmap when user doesn't have an AI key
  const staticBlueprints: Record<GrowthFocusType, string> = {
    alto_rendimiento: `### 🎯 Plan de Batalla: Deportista de Élite (Fuera de Línea)

*¡Hola Elías! Este es tu plan maestro estático pre-diseñado para forjar un cuerpo de acero:*

1. **🔥 VISIÓN DE CAMPEÓN**:
   La excelencia física no es un acto, es un hábito diario. Tu cuerpo es el templo de tu mente y el motor de tus metas. Hoy eliges no negociar con tu pereza.

2. **🧬 ANÁLISIS DE SISTEMAS**:
   - Tienes **${habits.filter(h => h.category === 'Salud').length} hábitos de salud** activos en la app.
   - Tu constancia en el entrenamiento define el overload progresivo necesario para romper barreras.

3. **🎯 ACCIONES DE ENFOQUE (Esta semana)**:
   - **Paso 1**: Agenda tus 3 entrenamientos semanales en el módulo **Deporte** y registra cada peso/repetición sin falta.
   - **Paso 2**: Consume 1 litro de agua inmediatamente al levantarte (apilamiento de hábitos).
   - **Paso 3**: Realiza 10 minutos de movilidad articular antes de entrenar para proteger tus articulaciones.

*🔒 Para obtener planes 100% personalizados por Inteligencia Artificial que auditen tu agenda real y finanzas, registra tu Clave de API de Gemini en la pestaña de Configuración.*`,

    libertad_financiera: `### 🎯 Plan de Batalla: Libertad Financiera (Fuera de Línea)

*¡Hola Elías! Este es tu plan maestro estático pre-diseñado para dominar tu capital:*

1. **🔥 VISIÓN DE CAMPEÓN**:
   La libertad financiera se compra con disciplina, no con dinero. Cada centavo que controlas hoy es una hora de libertad que le devuelves a tu futuro.

2. **🧬 ANÁLISIS DE SISTEMAS**:
   - Tienes registrados **${incomes.length} ingresos** y **${expenses.length} gastos** en el sistema.
   - El fondo de emergencia acumulado te protege de eventos imprevistos sin romper tu progreso.

3. **🎯 ACCIONES DE ENFOQUE (Esta semana)**:
   - **Paso 1**: Abre el módulo **Finanzas** y registra hasta el gasto más pequeño del día.
   - **Paso 2**: Configura tu cobro estimado y aparta el 5% al recibirlo al Fondo de Emergencia.
   - **Paso 3**: Identifica un gasto opcional (ocio) y elimínalo hoy. Transfiere ese monto directo al ahorro.

*🔒 Para obtener planes 100% personalizados por Inteligencia Artificial que auditen tu agenda real y finanzas, registra tu Clave de API de Gemini en la pestaña de Configuración.*`,

    mente_acero: `### 🎯 Plan de Batalla: Mente de Acero (Fuera de Línea)

*¡Hola Elías! Este es tu plan de batalla pre-diseñado para cultivar templanza estoica:*

1. **🔥 VISIÓN DE CAMPEÓN**:
   El dominio de uno mismo es el imperio más grande. El dolor es inevitable, el sufrimiento es opcional, pero la disciplina es tu mejor aliada para la paz mental.

2. **🧬 ANÁLISIS DE SISTEMAS**:
   - Tienes **${tasks.length} tareas** en tu agenda de la semana.
   - Tienes **${habits.filter(h => h.category === 'Mente').length} hábitos mentales** activos. Tu mejor racha demuestra tu verdadero potencial.

3. **🎯 ACCIONES DE ENFOQUE (Esta semana)**:
   - **Paso 1**: Realiza al menos 1 bloque de Enfoque Pomodoro de 25 minutos al día sin mirar el celular.
   - **Paso 2**: Al final de tu jornada, escribe 3 cosas por las que estás agradecido en tu **Bitácora**.
   - **Paso 3**: Ante cualquier contratiempo o emoción difícil de hoy, pregúntate estoicamente: "¿Esto está bajo mi control absoluto?".

*🔒 Para obtener planes 100% personalizados por Inteligencia Artificial que auditen tu agenda real y finanzas, registra tu Clave de API de Gemini en la pestaña de Configuración.*`,

    salud_vitalidad: `### 🎯 Plan de Batalla: Nutrición y Vitalidad (Fuera de Línea)

*¡Hola Elías! Este es tu plan pre-diseñado para inundar tu biología de energía:*

1. **🔥 VISIÓN DE CAMPEÓN**:
   Eres lo que absorbes. Optimizar tu nutrición no es una restricción; es un acto de respeto hacia el vehículo biológico que transporta todos tus sueños.

2. **🧬 ANÁLISIS DE SISTEMAS**:
   - Tienes metas activas en tu módulo de **Nutrición**.
   - Tus niveles de agua diarios determinan directamente tu claridad mental y tu tasa metabólica.

3. **🎯 ACCIONES DE ENFOQUE (Esta semana)**:
   - **Paso 1**: Planifica hoy tus comidas principales de la semana y evita la improvisación alimenticia.
   - **Paso 2**: Asegura consumir una fuente de proteína limpia en cada una de tus ingestas principales.
   - **Paso 3**: Bebe al menos 2.5 litros de agua al día y regístralo de manera táctica en el módulo.

*🔒 Para obtener planes 100% personalizados por Inteligencia Artificial que auditen tu agenda real y finanzas, registra tu Clave de API de Gemini en la pestaña de Configuración.*`
  };

  // Focus-based missions definition
  const missionsList: Record<GrowthFocusType, { id: string; label: string; xp: number }[]> = {
    alto_rendimiento: [
      { id: 'm1_sport', label: 'Completar rutina de entrenamiento (Deporte)', xp: 20 },
      { id: 'm2_sport', label: 'Registrar hidratación celular de más de 1000ml', xp: 15 },
      { id: 'm3_sport', label: 'Realizar estiramientos previos o movilidad articular', xp: 10 }
    ],
    libertad_financiera: [
      { id: 'm1_fin', label: 'Registrar todos los movimientos del día (Finanzas)', xp: 20 },
      { id: 'm2_fin', label: 'Evitar un gasto hormiga (Ahorrar dinero real hoy)', xp: 15 },
      { id: 'm3_fin', label: 'Aportar o calcular tu reserva del Fondo de Emergencia', xp: 10 }
    ],
    mente_acero: [
      { id: 'm1_mind', label: 'Realizar 1 sesión Pomodoro profunda (Enfoque)', xp: 20 },
      { id: 'm2_mind', label: 'Completar tu reflexión diaria en la Bitácora', xp: 15 },
      { id: 'm3_mind', label: 'Escribir 3 cosas por las que estás agradecido hoy', xp: 10 }
    ],
    salud_vitalidad: [
      { id: 'm1_nut', label: 'Anotar alimentos en tu Bitácora nutricional', xp: 20 },
      { id: 'm2_nut', label: 'Cero azúcares añadidos ni ultraprocesados hoy', xp: 15 },
      { id: 'm3_nut', label: 'Bebe al menos 2 litros de agua pura hoy', xp: 10 }
    ]
  };

  const handleMissionToggle = (missionId: string, points: number) => {
    if (completedMissions.includes(missionId)) {
      // Already completed, ignore or alert
      return;
    }

    const updated = [...completedMissions, missionId];
    setCompletedMissions(updated);
    
    // Grant XP and calculate level ups
    const newXp = xp + points;
    setXp(newXp);
    
    const newLevel = Math.floor(newXp / 100) + 1;
    if (newLevel > level) {
      customAlert(`🎉 ¡FELICITACIONES ELÍAS!\n\nHas subido al Nivel ${newLevel}: "${getRankTitle(newLevel)}". Tu disciplina está rindiendo frutos inquebrantables.`, 'success', '¡Aumento de Nivel!');
    } else {
      customAlert(`⚡ Misión Completada: +${points} XP ganados. ¡Sigue construyendo momentum!`, 'success', 'Progreso');
    }
  };

  // Generate Personalized AI Blueprint via Gemini
  const handleGenerateBlueprint = async () => {
    const customKey = (localStorage.getItem('user_custom_gemini_key') || '').trim();
    if (!customKey) {
      // No key, load static blueprint
      setLoadingBlueprint(true);
      setBlueprintError(null);
      setTimeout(() => {
        const plan = staticBlueprints[focus];
        setAiBlueprint(plan);
        localStorage.setItem('control_personal_growth_blueprint', plan);
        setLoadingBlueprint(false);
        customAlert('¡Plan de Batalla fuera de línea cargado! Para planes personalizados en vivo, registra tu clave de Gemini.', 'info', 'Plan Estático');
      }, 1500);
      return;
    }

    setLoadingBlueprint(true);
    setBlueprintError(null);

    // Calculate real stats to pass to AI
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const failedTasks = tasks.filter(t => !t.completed && t.failedReason).length;
    const totalHabits = habits.length;
    
    let maxHabitStreak = 0;
    habits.forEach(h => {
      if (h.streak > maxHabitStreak) maxHabitStreak = h.streak;
    });

    const totalIncomes = incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    try {
      const response = await fetch('/api/growth/blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-API-Key': customKey,
        },
        body: JSON.stringify({
          focus,
          userName,
          stats: {
            totalTasks,
            completedTasks,
            failedTasks,
            totalHabits,
            maxHabitStreak,
            totalIncomes,
            totalExpenses
          }
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo conectar con el servidor de IA.');
      }

      const data = await response.json();
      if (data.blueprint) {
        setAiBlueprint(data.blueprint);
        localStorage.setItem('control_personal_growth_blueprint', data.blueprint);
        customAlert('¡Plan de Batalla generado con éxito por tu Mentor de IA!', 'success', 'Mentor Activado');
      } else {
        throw new Error('Respuesta de IA vacía.');
      }
    } catch (err: any) {
      console.error(err);
      setBlueprintError(err.message || 'Error de conexión.');
      // Fallback to static blueprint
      const fallback = staticBlueprints[focus];
      setAiBlueprint(fallback);
      localStorage.setItem('control_personal_growth_blueprint', fallback);
    } finally {
      setLoadingBlueprint(false);
    }
  };

  const currentMissions = missionsList[focus] || [];

  // Helper to parse basic markdown to JSX neatly
  const parseMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('###')) {
        return <h3 key={idx} className="text-sm font-black text-white uppercase tracking-wider mt-4 mb-2 border-b border-slate-800/80 pb-1">{trimmed.replace('###', '')}</h3>;
      }
      if (trimmed.startsWith('##')) {
        return <h2 key={idx} className="text-base font-extrabold text-indigo-400 mt-5 mb-2">{trimmed.replace('##', '')}</h2>;
      }
      if (trimmed.startsWith('1.') || trimmed.startsWith('2.') || trimmed.startsWith('3.') || trimmed.startsWith('4.')) {
        return <p key={idx} className="text-xs text-slate-100 leading-relaxed font-bold mt-2 pl-1 text-indigo-300">{trimmed}</p>;
      }
      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        return (
          <div key={idx} className="flex items-start space-x-2 my-1.5 pl-3">
            <span className="text-indigo-400 select-none mt-1 text-[10px]">■</span>
            <span className="text-xs text-slate-300 leading-relaxed font-medium">{trimmed.substring(1).trim()}</span>
          </div>
        );
      }
      if (trimmed === '') return <div key={idx} className="h-2"></div>;

      // Handle bold words **text**
      let formatted = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        parts.push(line.substring(lastIndex, match.index));
        parts.push(<strong key={match.index} className="text-white font-black">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(line.substring(lastIndex));

      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed font-medium my-1">
          {parts.length > 1 ? parts : formatted}
        </p>
      );
    });
  };

  return (
    <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5" id="self-mastery-core-card">
      {/* Header and Level progression */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl animate-pulse shrink-0 border border-indigo-500/10">
            <Trophy className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase block font-mono">NÚCLEO DE SUPERACIÓN</span>
            <h2 className="text-lg font-black text-white leading-tight">Plan de Auto-Mejora Humana</h2>
          </div>
        </div>

        {/* Level and Rank Badge */}
        <div className="bg-[#070c18] border border-slate-800 p-2.5 rounded-xl flex items-center space-x-3 shrink-0">
          <div className="text-center bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1 rounded-lg shrink-0">
            <span className="text-[9px] font-bold text-indigo-400 block uppercase font-mono">NIVEL</span>
            <span className="text-base font-black text-white font-mono">{level}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Rango de Superación</span>
            <span className="text-xs font-black text-indigo-300 block">{getRankTitle(level)}</span>
            
            {/* Visual Level XP bar */}
            <div className="w-32 bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1 relative">
              <div 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentLevelXp / nextLevelXp) * 100}%` }}
              ></div>
            </div>
            <span className="text-[8px] text-slate-500 block text-right mt-0.5 font-mono font-bold">{currentLevelXp}/{nextLevelXp} XP</span>
          </div>
        </div>
      </div>

      {/* Focus Selection Grid */}
      <div className="space-y-3">
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block flex items-center gap-1.5 font-mono">
          <Compass className="w-3.5 h-3.5" />
          <span>Elige Tu Enfoque de Vida para esta Semana</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { 
              id: 'mente_acero', 
              title: 'Mente de Acero', 
              desc: 'Enfoque estoico, hábitos profundos y disciplina diaria.', 
              icon: Brain,
              color: 'text-purple-400 border-purple-500/20 bg-purple-950/5',
              glow: 'shadow-[0_0_15px_rgba(168,85,247,0.1)] border-purple-500'
            },
            { 
              id: 'alto_rendimiento', 
              title: 'Atleta de Élite', 
              desc: 'Entrenamiento duro, fuerza y Overload Progresivo.', 
              icon: Trophy,
              color: 'text-rose-400 border-rose-500/20 bg-rose-950/5',
              glow: 'shadow-[0_0_15px_rgba(244,63,94,0.1)] border-rose-500'
            },
            { 
              id: 'libertad_financiera', 
              title: 'Libertad Financiera', 
              desc: 'Control estricto de caja, presupuestos y fondo de emergencia.', 
              icon: DollarSign,
              color: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/5',
              glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)] border-emerald-500'
            },
            { 
              id: 'salud_vitalidad', 
              title: 'Nutrición Óptima', 
              desc: 'Macronutrientes, hidratación y energía biológica.', 
              icon: Flame,
              color: 'text-amber-400 border-amber-500/20 bg-amber-950/5',
              glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)] border-amber-500'
            },
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = focus === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFocus(item.id as any)}
                className={`cursor-pointer text-left p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[110px] active:scale-[0.98] ${
                  isActive 
                    ? `${item.glow} scale-[1.02] bg-slate-900/40` 
                    : 'border-slate-800 bg-[#070c18]/40 hover:bg-[#070c18] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-indigo-500/10' : 'bg-slate-900'} ${item.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  {isActive && <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-black tracking-widest px-1.5 py-0.5 rounded-md font-mono">ACTIVO</span>}
                </div>
                <div className="mt-2">
                  <span className={`text-xs font-black block leading-none ${isActive ? 'text-white' : 'text-slate-300'}`}>{item.title}</span>
                  <p className="text-[10px] text-slate-500 leading-normal font-medium mt-1 font-sans">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column split for Daily Missions & AI Strategic Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
        {/* Left: Daily Missions Checklist */}
        <div className="lg:col-span-5 bg-[#070c18] border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block flex items-center gap-1.5 font-mono">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Misiones de Superación de Hoy</span>
              </span>
              <span className="text-[9px] font-black text-slate-500 font-mono">Reseteo Diario</span>
            </div>

            <p className="text-[10.5px] text-slate-400 font-medium leading-normal">
              Completa estos 3 desafíos tácticos diarios de tu enfoque activo para ganar puntos de experiencia (XP) y subir tu Rango de Superación:
            </p>

            <div className="space-y-2.5">
              {currentMissions.map((mission) => {
                const isDone = completedMissions.includes(mission.id);
                return (
                  <div 
                    key={mission.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isDone 
                        ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-400 line-through' 
                        : 'bg-[#0b1323]/60 border-slate-800 hover:border-slate-700 hover:bg-[#0b1323] text-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 pr-2">
                      <button
                        onClick={() => handleMissionToggle(mission.id, mission.xp)}
                        disabled={isDone}
                        className={`cursor-pointer rounded-lg transition-all ${
                          isDone 
                            ? 'text-emerald-400 shrink-0' 
                            : 'text-slate-600 hover:text-indigo-400 shrink-0 active:scale-95'
                        }`}
                        title="Marcar misión como cumplida"
                      >
                        <CheckCircle2 className={`w-5 h-5 ${isDone ? 'fill-emerald-500/10' : ''}`} />
                      </button>
                      <span className="text-xs font-bold leading-snug">{mission.label}</span>
                    </div>
                    <span className={`text-[10px] font-black font-mono shrink-0 px-2 py-0.5 rounded-lg ${
                      isDone ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30' : 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/30'
                    }`}>
                      +{mission.xp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between text-[10px] font-black text-slate-500 font-mono">
              <span>Misiones completadas hoy:</span>
              <span className="text-indigo-400">{completedMissions.length} / 3</span>
            </div>
          </div>
        </div>

        {/* Right: AI Strategic Mentor Output */}
        <div className="lg:col-span-7 bg-[#070c18] border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Mentor de Auto-Mejora IA (Gemini)</span>
              </span>
              <span className="text-[9.5px] font-bold text-slate-500 font-mono">
                {hasSavedKey ? '🦾 MODO IA EN VIVO' : '🔒 MODO FUERA DE LÍNEA'}
              </span>
            </div>

            {/* Blueprint content block */}
            <div className="max-h-[340px] overflow-y-auto pr-1 space-y-2 select-text custom-scrollbar">
              {loadingBlueprint ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-center">
                    <p className="text-xs font-black text-white uppercase tracking-wider animate-pulse">{loadingPhrase}</p>
                    <p className="text-[10px] text-slate-500 italic mt-1">El Oráculo está forjando tu plan de batalla...</p>
                  </div>
                </div>
              ) : blueprintError ? (
                <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded-xl space-y-2 text-slate-100">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs uppercase">
                    <AlertCircle className="w-4 h-4" />
                    <span>Inconveniente de Conexión</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    {blueprintError}. Cargamos un plan estratégico estático pre-diseñado para que no detengas tu crecimiento.
                  </p>
                </div>
              ) : aiBlueprint ? (
                <div className="prose prose-invert max-w-none text-slate-300 space-y-2">
                  {parseMarkdown(aiBlueprint)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 space-y-3 text-center">
                  <div className="p-3 bg-indigo-950/30 rounded-full text-indigo-400 border border-indigo-900/20">
                    <Compass className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wide">¿Listo para un Salto de Nivel, Elías?</h4>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed mt-1 font-sans">
                      Presiona el botón de abajo para generar tu Plan de Batalla táctico semanal. Analizaremos tu agenda y comportamiento para darte prioridades claras.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action triggers */}
          <div className="border-t border-slate-800 pt-3 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleGenerateBlueprint}
              disabled={loadingBlueprint}
              className="cursor-pointer w-full sm:flex-1 py-2.5 px-4 bg-indigo-650 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-indigo-500/10 active:scale-95 flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>{aiBlueprint ? 'Actualizar Plan de Batalla' : 'Generar Plan de Batalla'}</span>
            </button>

            {!hasSavedKey && (
              <button
                onClick={() => onNavigate('settings')}
                className="cursor-pointer w-full sm:w-auto px-4 py-2.5 bg-[#141b2d] hover:bg-[#1e293b] border border-[#2e3b4e] hover:border-indigo-500/30 text-[#cbd5e1] hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Activar Mentor IA Real 🦾</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
