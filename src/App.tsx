/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Trophy,
  DollarSign, 
  TrendingUp, 
  Briefcase, 
  Clock, 
  MapPin, 
  Navigation, 
  Smartphone, 
  Eye, 
  EyeOff, 
  HelpCircle,
  PiggyBank,
  CheckCircle,
  Menu,
  Activity,
  CalendarDays,
  UserCheck,
  SlidersHorizontal,
  Sparkles,
  BookOpen,
  X,
  LayoutGrid,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';

import { 
  AppSettings, 
  Income, 
  Expense, 
  FixedService, 
  RoutineDay, 
  TimeBlock, 
  ToDoTask, 
  ExchangeRates,
  Habit,
  JournalEntry
} from './types';

import { getLocalDateString } from './utils/dateUtils';
import { setDialogHandler, removeDialogHandler, DialogConfig, customAlert, customConfirm } from './utils/customAlerts';

import {
  INITIAL_SETTINGS,
  INITIAL_INCOMES,
  INITIAL_EXPENSES,
  INITIAL_SERVICES,
  INITIAL_ROUTINES,
  INITIAL_TIME_BLOCKS,
  INITIAL_TASKS,
  INITIAL_HABITS,
  INITIAL_JOURNAL_ENTRIES,
} from './utils/dummyData';

// Submodules
import DashboardModule from './components/DashboardModule';
import FinanceModule from './components/FinanceModule';
import DeporteModule from './components/DeporteModule';
import ProductivityModule from './components/ProductivityModule';
import SettingsModule from './components/SettingsModule';
import HabitsModule from './components/HabitsModule';
import JournalModule from './components/JournalModule';
import NucleusLogo from './components/NucleusLogo';

// Error Boundary definition to prevent fatal React DOM rendering crashes from browser translators
class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.warn("ErrorBoundary caught a virtual DOM rendering crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 my-12">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-550 border border-red-500/20 flex items-center justify-center mx-auto mb-2 font-mono text-xl">
            ⚠️
          </div>
          <p className="text-sm font-bold text-[#eef1f5] max-w-md">
            Se ha producido un error al sincronizar la interfaz. Esto suele estar provocado por extensiones de traducción automática (como Google Translate) al alterar los nodos del VDOM.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
          >
            Recargar Aplicación
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // --- One-time clean storage check to ensure clean slate of zero demo data for old cache if any ---
  useState(() => {
    const isCleaned = localStorage.getItem('control_personal_cleaned_v4');
    if (!isCleaned) {
      localStorage.removeItem('control_personal_settings');
      localStorage.removeItem('control_personal_incomes');
      localStorage.removeItem('control_personal_expenses');
      localStorage.removeItem('control_personal_services');
      localStorage.removeItem('control_personal_routines');
      localStorage.removeItem('control_personal_timeblocks');
      localStorage.removeItem('control_personal_tasks');
      localStorage.removeItem('control_personal_habits');
      localStorage.setItem('control_personal_cleaned_v4', 'true');
    }
  });

  // --- Local states with standard cache loading ---
  const [settings, setSettings] = useState<AppSettings>(() => {
    const data = localStorage.getItem('control_personal_settings');
    return data ? JSON.parse(data) : INITIAL_SETTINGS;
  });

  const [incomes, setIncomes] = useState<Income[]>(() => {
    const data = localStorage.getItem('control_personal_incomes');
    return data ? JSON.parse(data) : INITIAL_INCOMES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const data = localStorage.getItem('control_personal_expenses');
    return data ? JSON.parse(data) : INITIAL_EXPENSES;
  });

  const [services, setServices] = useState<FixedService[]>(() => {
    const data = localStorage.getItem('control_personal_services');
    return data ? JSON.parse(data) : INITIAL_SERVICES;
  });

  const [routines, setRoutines] = useState<RoutineDay[]>(() => {
    const data = localStorage.getItem('control_personal_routines');
    return data ? JSON.parse(data) : INITIAL_ROUTINES;
  });

  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(() => {
    const data = localStorage.getItem('control_personal_timeblocks');
    return data ? JSON.parse(data) : INITIAL_TIME_BLOCKS;
  });

  const [tasks, setTasks] = useState<ToDoTask[]>(() => {
    const data = localStorage.getItem('control_personal_tasks');
    return data ? JSON.parse(data) : INITIAL_TASKS;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const data = localStorage.getItem('control_personal_habits');
    return data ? JSON.parse(data) : INITIAL_HABITS;
  });

  const [journals, setJournals] = useState<JournalEntry[]>(() => {
    const data = localStorage.getItem('control_personal_journals');
    return data ? JSON.parse(data) : INITIAL_JOURNAL_ENTRIES;
  });

  // Global settings for UI with dynamic SettingsModule bindings
  const [activeTab, setActiveTab] = useState<'panel' | 'finance' | 'gym' | 'todo' | 'habits' | 'journal' | 'settings'>('panel');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    oficial: 950,
    blue: 1240,
    mep: 1210,
    lastUpdated: '15:20',
  });

  const [appName, setAppName] = useState(() => {
    const saved = localStorage.getItem('control_personal_app_name');
    if (!saved || saved === 'Elías Hub' || saved === 'Control Personal Todo en Uno' || saved === 'Control Personal' || saved === 'My Google AI Studio App' || saved === 'My App') {
      return 'Nucleus';
    }
    return saved;
  });

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('control_personal_user_name') || 'Elías';
  });

  const [accentColor, setAccentColor] = useState<'indigo' | 'emerald' | 'amber' | 'rose'>(() => {
    return (localStorage.getItem('control_personal_accent_color') as any) || 'indigo';
  });

  const [fontFamily, setFontFamily] = useState<'inter' | 'grotesk' | 'mono'>(() => {
    return (localStorage.getItem('control_personal_font_family') as any) || 'grotesk';
  });

  const [appStyle, setAppStyle] = useState<'ia' | 'rich'>(() => {
    return (localStorage.getItem('control_personal_app_style') as any) || 'ia';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Floating notifications banner helper state
  const [activeNotification, setActiveNotification] = useState<{ title: string; body: string } | null>(null);

  // Custom visual dialogues state override (Nucleus OS Alert & Confirm Modal)
  const [activeDialog, setActiveDialog] = useState<DialogConfig | null>(null);

  useEffect(() => {
    setDialogHandler((config) => {
      setActiveDialog(config);
    });
    return () => {
      removeDialogHandler();
    };
  }, []);

  // Warm up audio context on ANY click in the document to bypass browser autoplay blocks
  useEffect(() => {
    const handleFirstGesture = () => {
      try {
        if (!(window as any).globalAudioCtx) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          (window as any).globalAudioCtx = new AudioContextClass();
          console.log("AudioContext warmed up successfully by user gesture.");
        } else if ((window as any).globalAudioCtx.state === 'suspended') {
          (window as any).globalAudioCtx.resume();
        }
      } catch (e) {
        console.warn("Could not warm up AudioContext:", e);
      }
    };
    window.addEventListener('click', handleFirstGesture, { capture: true });
    return () => window.removeEventListener('click', handleFirstGesture);
  }, []);

  const triggerLiveNotification = (title: string, body: string) => {
    // Attempt audio tone play - Multiple ring sequences
    try {
      let audioCtx = (window as any).globalAudioCtx;
      if (!audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioCtxClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      if (audioCtx) {
        const now = audioCtx.currentTime;
        // Tone 1
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.frequency.setValueAtTime(880, now); // A5 high note
        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc1.start(now);
        osc1.stop(now + 0.15);

        // Tone 2
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(1046.50, now + 0.18); // C6 highest note
        gain2.gain.setValueAtTime(0.15, now + 0.18);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc2.start(now + 0.18);
        osc2.stop(now + 0.32);
      }
    } catch (e) {
      console.log('Audio Blocked by autoplay policy:', e);
    }

    // Attempt system native alert if approved
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch (err) {
        console.warn("Could not fire standard browser Notification:", err);
      }
    }

    setActiveNotification({ title, body });
  };

  // Banner fade countdown
  useEffect(() => {
    if (activeNotification) {
      const id = setTimeout(() => {
        setActiveNotification(null);
      }, 5500);
      return () => clearTimeout(id);
    }
  }, [activeNotification]);

  // Alarms ticking daemon
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      let currentHrsMins = '';
      try {
        const tz = localStorage.getItem('control_personal_time_timezone') || 'America/Argentina/Buenos_Aires';
        currentHrsMins = now.toLocaleTimeString('es-AR', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        currentHrsMins = now.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      
      const cached = localStorage.getItem('control_personal_custom_alerts');
      if (cached) {
        const parsed: any[] = JSON.parse(cached);
        parsed.forEach(al => {
          if (al.enabled && al.time === currentHrsMins) {
            const lastFiredHour = localStorage.getItem(`fired_alert_${al.id}`);
            const todayStr = getLocalDateString(now);
            if (lastFiredHour !== todayStr) {
              triggerLiveNotification(al.title, `Aviso Automático Celular (${al.time}).`);
              localStorage.setItem(`fired_alert_${al.id}`, todayStr);
            }
          }
        });
      }
    };

    const intervalId = setInterval(checkAlarms, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // --- Real-time ticking time sync ---
  const [realClock, setRealClock] = useState<string>('00:00');
  const [activeClockLocation, setActiveClockLocation] = useState<string>('Buenos Aires');

  useEffect(() => {
    const updateTimeAndLocation = () => {
      const now = new Date();
      const tz = localStorage.getItem('control_personal_time_timezone') || 'America/Argentina/Buenos_Aires';
      
      try {
        setRealClock(now.toLocaleTimeString('es-AR', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
        }));
      } catch {
        setRealClock(now.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
        }));
      }

      const isGeo = localStorage.getItem('control_personal_weather_use_geo') === 'true';
      if (isGeo) {
        try {
          const coordsObj = localStorage.getItem('control_personal_weather_geo_coords');
          if (coordsObj) {
            const parsed = JSON.parse(coordsObj);
            setActiveClockLocation(parsed.name || 'Mi Ubicación 📍');
            return;
          }
        } catch {}
        setActiveClockLocation('Ubicación GPS 📍');
      } else {
        const manualCity = localStorage.getItem('control_personal_weather_city') || 'Buenos Aires (CABA)';
        setActiveClockLocation(manualCity.split(' (')[0]);
      }
    };
    
    updateTimeAndLocation();
    const id = setInterval(updateTimeAndLocation, 10000);

    window.addEventListener('personal-timezone-updated', updateTimeAndLocation);
    window.addEventListener('storage', updateTimeAndLocation);

    return () => {
      clearInterval(id);
      window.removeEventListener('personal-timezone-updated', updateTimeAndLocation);
      window.removeEventListener('storage', updateTimeAndLocation);
    };
  }, []);

  // --- Cache persistence synchronization ---
  useEffect(() => {
    localStorage.setItem('control_personal_app_name', appName);
  }, [appName]);

  useEffect(() => {
    localStorage.setItem('control_personal_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('control_personal_accent_color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('control_personal_font_family', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('control_personal_app_style', appStyle);
  }, [appStyle]);

  useEffect(() => {
    localStorage.setItem('control_personal_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('control_personal_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('control_personal_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('control_personal_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('control_personal_routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('control_personal_timeblocks', JSON.stringify(timeBlocks));
  }, [timeBlocks]);

  useEffect(() => {
    localStorage.setItem('control_personal_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('control_personal_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('control_personal_journals', JSON.stringify(journals));
  }, [journals]);

  // --- Actions ---
  const handleAddQuickIncome = (source: string, amount: number, currency: 'ARS' | 'USD') => {
    const newInc: Income = {
      id: `inc-${Date.now()}`,
      source,
      amount,
      currency,
      date: getLocalDateString(),
      isRecurringSalary: false,
    };
    setIncomes([newInc, ...incomes]);
    customAlert(`Ingreso Extra registrado: $${amount} ${currency}`, 'success', 'Ingreso Registrado');
  };

  const handleAddIncome = (inc: Omit<Income, 'id'>) => {
    setIncomes([{ ...inc, id: `inc-${Date.now()}` }, ...incomes]);
  };

  const handleAddExpense = (exp: Omit<Expense, 'id'>) => {
    setExpenses([{ ...exp, id: `exp-${Date.now()}` }, ...expenses]);
  };

  const handleAddService = (ser: Omit<FixedService, 'id'>) => {
    setServices([{ ...ser, id: `ser-${Date.now()}` }, ...services]);
  };

  const handleToggleServicePaid = (id: string) => {
    setServices(services.map(s => s.id === id ? { ...s, isPaid: !s.isPaid } : s));
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleRemoveIncome = (id: string) => {
    setIncomes(incomes.filter(i => i.id !== id));
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleToggleTaskCompleted = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed, failedReason: undefined };
      }
      return t;
    }));
  };

  const handleClearAllData = () => {
    customConfirm(
      '¿Estás seguro de que deseas borrar todos los datos actuales? Se vaciarán tus ingresos, gastos, servicios, tareas, rutinas, bloques de tiempo, hábitos y bitácora de reflexión para que puedas configurarlo todo desde cero.',
      () => {
        setIncomes([]);
        setExpenses([]);
        setServices([]);
        setTasks([]);
        setTimeBlocks([]);
        setHabits([]);
        setJournals([]);
        setRoutines([
          { id: 'day-1', dayName: 'Lunes', exercises: [] },
          { id: 'day-2', dayName: 'Martes', exercises: [] },
          { id: 'day-3', dayName: 'Miércoles', exercises: [] },
          { id: 'day-4', dayName: 'Jueves', exercises: [] },
          { id: 'day-5', dayName: 'Viernes', exercises: [] },
          { id: 'day-6', dayName: 'Sábado', exercises: [] },
          { id: 'day-7', dayName: 'Domingo', exercises: [] },
        ]);
        setSettings({
          monthlySalaryARS: 0,
          hourlySalaryARS: 0,
          salaryPayDay: 5,
          targetSavingsGoal: 0,
          targetSavingsCurrency: 'ARS',
          emergencyFundMonths: 3,
          emergencyFundPercent: 5,
          emergencyFundFrequency: 'semanal',
          emergencyFundEstimatedIncome: 500000,
        });
        customAlert('Se han borrado todos los datos. ¡Ya puedes empezar a agregar tus propios registros desde cero!', 'success', 'Datos Limpiados');
      },
      undefined,
      'Reiniciar Todos los Datos'
    );
  };

  const formattedSimulatedTime = () => {
    return realClock;
  };

  const getThemeTextClass = (tab: typeof activeTab) => {
    if (activeTab === tab) {
      switch (accentColor) {
        case 'emerald': return 'text-emerald-400 font-black';
        case 'amber': return 'text-amber-500 font-black';
        case 'rose': return 'text-rose-500 font-black';
        default: return 'text-indigo-400 font-black';
      }
    }
    return 'text-slate-400 hover:text-slate-200';
  };

  const getThemeBgClass = (tab: typeof activeTab) => {
    if (activeTab === tab) {
      switch (accentColor) {
        case 'emerald': return 'bg-emerald-600/15 border border-emerald-500/20';
        case 'amber': return 'bg-amber-500/15 border border-amber-500/20';
        case 'rose': return 'bg-rose-500/15 border border-rose-500/20';
        default: return 'bg-indigo-600/15 border border-indigo-500/20';
      }
    }
    return 'border border-transparent text-slate-400';
  };

  const getThemeIconColor = () => {
    switch (accentColor) {
      case 'emerald': return 'text-emerald-400';
      case 'amber': return 'text-amber-500';
      case 'rose': return 'text-rose-500';
      default: return 'text-indigo-400';
    }
  };

  const getDialogAccentBtnClass = () => {
    switch (accentColor) {
      case 'emerald': return 'bg-emerald-600 hover:bg-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.25)] text-white';
      case 'amber': return 'bg-amber-600 hover:bg-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.25)] text-white';
      case 'rose': return 'bg-rose-600 hover:bg-[#f43f5e] shadow-[0_0_12px_rgba(244,63,94,0.25)] text-white';
      default: return 'bg-indigo-600 hover:bg-[#6366f1] shadow-[0_0_12px_rgba(99,102,241,0.25)] text-white';
    }
  };

  const getAppFontFamilyClass = () => {
    switch (fontFamily) {
      case 'mono': return 'font-mono';
      case 'grotesk': return 'font-display';
      default: return 'font-sans';
    }
  };

  const navigationTabs = [
    { id: 'panel', label: 'Panel', icon: Activity },
    { id: 'finance', label: 'Finanzas', icon: DollarSign },
    { id: 'gym', label: 'Deporte', icon: Trophy },
    { id: 'todo', label: 'Agenda', icon: CalendarDays },
    { id: 'journal', label: 'Bitácora', icon: BookOpen },
    { id: 'settings', label: 'Configuración', icon: SlidersHorizontal },
  ] as const;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-indigo-500/20 selection:text-white ${getAppFontFamilyClass()} ${appStyle === 'rich' ? 'style-rich' : 'style-ia'}`} id="applet-root">
      
      {/* Premium Customized Nucleus Dialog Modal */}
      {activeDialog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-full max-w-md bg-[#090e1c] border border-slate-800/80 rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
            id="custom-nucleus-dialog"
          >
            {/* Ambient Background Glow matching accent or type */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
              activeDialog.type === 'success' ? 'from-emerald-500 to-teal-500' :
              activeDialog.type === 'error' ? 'from-rose-500 to-red-500' :
              activeDialog.type === 'warning' ? 'from-amber-500 to-orange-500' :
              accentColor === 'emerald' ? 'from-emerald-500 to-teal-500' :
              accentColor === 'amber' ? 'from-amber-500 to-yellow-500' :
              accentColor === 'rose' ? 'from-rose-500 to-pink-500' :
              'from-indigo-500 to-blue-500'
            }`} />

            {/* Glowing Icon Container */}
            <div className={`mb-4 p-3 rounded-full ${
              activeDialog.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
              activeDialog.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
              activeDialog.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
              accentColor === 'emerald' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
              accentColor === 'amber' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
              accentColor === 'rose' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
              'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
            }`}>
              {activeDialog.type === 'success' && <CheckCircle2 className="w-10 h-10" />}
              {activeDialog.type === 'error' && <XCircle className="w-10 h-10" />}
              {activeDialog.type === 'warning' && <AlertTriangle className="w-10 h-10" />}
              {activeDialog.type === 'info' && <Info className="w-10 h-10" />}
            </div>

            {/* Title */}
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2 font-display">
              {activeDialog.title}
            </h3>

            {/* Message Body */}
            <p className="text-xs text-slate-300 leading-relaxed mb-6 font-sans whitespace-pre-line max-w-sm">
              {activeDialog.message}
            </p>

            {/* Actions Footer */}
            <div className="flex items-center justify-center space-x-3 w-full">
              {activeDialog.isConfirm ? (
                <>
                  <button
                    onClick={() => {
                      const cb = activeDialog.onCancel;
                      setActiveDialog(null);
                      if (cb) cb();
                    }}
                    className="cursor-pointer basis-1/2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 transition-all font-sans"
                  >
                    {activeDialog.cancelText || 'Cancelar'}
                  </button>
                  <button
                    onClick={() => {
                      const cb = activeDialog.onConfirm;
                      setActiveDialog(null);
                      if (cb) cb();
                    }}
                    className={`cursor-pointer basis-1/2 px-4 py-2 rounded-xl text-xs font-black transition-all ${getDialogAccentBtnClass()} font-sans`}
                  >
                    {activeDialog.confirmText || 'Aceptar'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    const cb = activeDialog.onConfirm;
                    setActiveDialog(null);
                    if (cb) cb();
                  }}
                  className={`cursor-pointer px-8 py-2 rounded-xl text-xs font-black transition-all min-w-[120px] ${getDialogAccentBtnClass()} font-sans`}
                >
                  {activeDialog.confirmText || 'Entendido'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Simulated Phone Alert Dropdown */}
      {activeNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#0a0f1d] border border-indigo-500/30 text-white rounded-2xl p-4 shadow-2xl z-50 flex items-start space-x-3 max-w-sm w-[90vw] animate-in slide-in-from-top duration-300">
          <Smartphone className={`w-8 h-8 ${getThemeIconColor()} shrink-0 mt-0.5`} />
          <div className="flex-grow text-xs">
            <h4 className={`font-black text-[10px] tracking-widest ${getThemeIconColor()}`}>NOTIFICACIÓN AL CELULAR</h4>
            <p className="font-bold text-white mt-0.5">{activeNotification.title}</p>
            <p className="text-slate-300 mt-1">{activeNotification.body}</p>
            <div className="flex space-x-2 mt-2">
              <button 
                onClick={() => {
                  setActiveTab('todo');
                  setActiveNotification(null);
                }}
                className="cursor-pointer text-[9.5px] bg-slate-950 hover:bg-slate-900 border border-slate-805 text-slate-200 px-2 py-0.5 rounded font-extrabold"
              >
                Abrir Agenda
              </button>
              <button 
                onClick={() => setActiveNotification(null)}
                className="cursor-pointer text-[9.5px] text-slate-400 hover:text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
          <button 
            onClick={() => setActiveNotification(null)}
            className="text-xs text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
          >
            ✖
          </button>
        </div>
      )}

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="w-64 bg-[#070b15] border-r border-slate-800/80 p-6 hidden md:flex flex-col justify-between shrink-0" id="desktop-sidebar">
        <div className="space-y-8">
          {/* Logo / Brand */}
          <div className="flex items-center space-x-3 px-2">
            <NucleusLogo size={40} className="shrink-0" />
            <div>
              <h2 className="text-sm font-black tracking-wider text-white uppercase">{appName}</h2>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 font-bold block mt-0.5 font-mono">
                SISTEMA PERSONAL
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5" id="desktop-nav-menu">
            {navigationTabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`cursor-pointer w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all text-left ${
                    isActive 
                      ? `${getThemeBgClass(tab.id as any)} ${getThemeTextClass(tab.id as any)} font-bold`
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span className="text-xs tracking-wider uppercase font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lower Sidebar Tools */}
        <div className="space-y-4 pt-6 border-t border-slate-900/80">
          {/* Real Clock */}
          <div className="flex flex-col space-y-1 bg-slate-950 px-3 py-2 rounded-xl border border-slate-900" title={`Zona Horaria Activa: ${activeClockLocation}`}>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <Clock className={`w-3.5 h-3.5 ${getThemeIconColor()} animate-pulse`} />
              <span>{realClock} hs</span>
            </div>
            <div className="text-[9px] text-slate-500 font-extrabold uppercase truncate tracking-wider leading-none">
              {activeClockLocation}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 leading-relaxed font-mono uppercase px-1">
            © {new Date().getFullYear()} {appName} OS
          </div>
        </div>
      </aside>

      {/* --- MOBILE HEADER & SLIDING DRAWER --- */}
      <header className="h-14 bg-[#070b15] border-b border-slate-800/80 px-4 flex items-center justify-between md:hidden sticky top-0 z-40 w-full" id="mobile-navigation-bar">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-all"
          title="Menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <NucleusLogo size={24} />
          <h2 
            className="text-xs font-black tracking-widest uppercase font-sans"
            style={{ color: '#e2e6e9' }}
          >
            {appName}
          </h2>
        </div>

        {/* Small Clock on Mobile top right */}
        <div className="text-xs font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-xl border border-slate-800 flex flex-col items-end leading-none">
          <span className="font-bold">{realClock}</span>
          <span className="text-[8px] text-slate-500 mt-0.5 truncate max-w-[75px] uppercase font-extrabold">{activeClockLocation}</span>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" id="mobile-menu-drawer-container">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-64 max-w-xs bg-[#070b15] border-r border-slate-850 p-6 flex flex-col justify-between h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <NucleusLogo size={26} />
                  <span className="text-xs font-black text-white tracking-wider uppercase">{appName}</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-all"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Links */}
              <nav className="space-y-1">
                {navigationTabs.map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`cursor-pointer w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all text-left ${
                        isActive 
                          ? `${getThemeBgClass(tab.id as any)} ${getThemeTextClass(tab.id as any)} font-bold`
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span className="text-xs tracking-wider uppercase font-semibold">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-900">
              <div className="flex flex-col space-y-1 text-xs font-mono text-slate-400">
                <div className="flex items-center space-x-2">
                  <Clock className={`w-3.5 h-3.5 ${getThemeIconColor()}`} />
                  <span>{realClock} hs</span>
                </div>
                <span className="text-[9px] text-slate-500 font-extrabold uppercase pl-5.5">{activeClockLocation}</span>
              </div>
              <p className="text-[9px] text-slate-500 font-mono">
                PERSISTENCIA LOCAL SEGURA
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN CORE PANEL / WRAPPER WITH BREATHING SPACE --- */}
      <main className="flex-1 min-w-0 min-h-screen flex flex-col pt-4 pb-12 md:py-8 px-4 md:px-8 overflow-y-auto" id="view-layer">
        
        {/* Breathing minimalist container header */}
        <div className="hidden md:flex items-center justify-between mb-6 px-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white capitalize">
              {activeTab === 'panel' ? 'Panel de Control' : 
               activeTab === 'finance' ? 'Gestión de Finanzas' :
               activeTab === 'gym' ? 'Deporte & Atletismo' :
               activeTab === 'todo' ? 'Agenda & Tareas' :
               activeTab === 'habits' ? 'Hábitos Diarios' :
               activeTab === 'journal' ? 'Bitácora & Reflexión' : 'Ajustes Integrales'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'panel' && 'Vista general del rendimiento del día, ahorros, cotizaciones y accesos rápidos.'}
              {activeTab === 'finance' && 'Controla ingresos extra, gastos opcionales, vencimientos fijos y calendario.'}
              {activeTab === 'gym' && 'Planificación deportiva, salidas de running/bici, marcas personales e hipertrofia.'}
              {activeTab === 'todo' && 'Bloques de tiempo continuos y lista de pendientes para máxima productividad.'}
              {activeTab === 'habits' && 'Visualiza y registra tus hábitos diarios para mantener constancia.'}
              {activeTab === 'journal' && 'Escribe reflexiones sobre tu día, agradecimientos y metas futuras.'}
              {activeTab === 'settings' && 'Personaliza colores, fuentes, nombres del OS y preconfigura datos.'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 font-mono text-[11px] text-slate-400">
            <span>MODO SEGURO</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
        </div>

        {/* Dynamic component viewport */}
        <div 
          className="flex-1 w-full bg-[#070b15]/40 border border-slate-800/60 rounded-2xl md:rounded-3xl shadow-xl flex flex-col p-4 sm:p-6 md:p-8 relative overflow-hidden backdrop-blur"
          id="mockup-frame-parent"
        >
          {/* Core Router Tabs driver */}
          <ErrorBoundary>
            {activeTab === 'panel' && (
              <DashboardModule
                incomes={incomes}
                expenses={expenses}
                exchangeRates={exchangeRates}
                setExchangeRates={setExchangeRates}
                simulatedTime={formattedSimulatedTime()}
                onClearAllData={handleClearAllData}
                settings={settings}
                onUpdateSettings={setSettings}
                userName={userName}
                tasks={tasks}
                habits={habits}
                services={services}
                onNavigate={setActiveTab}
              />
            )}
  
            {activeTab === 'finance' && (
              <FinanceModule
                incomes={incomes}
                expenses={expenses}
                services={services}
                exchangeRates={exchangeRates}
                settings={settings}
                onUpdateSettings={setSettings}
                onAddIncome={handleAddIncome}
                onAddExpense={handleAddExpense}
                onAddService={handleAddService}
                onToggleServicePaid={handleToggleServicePaid}
                onRemoveExpense={handleRemoveExpense}
                onRemoveIncome={handleRemoveIncome}
                onRemoveService={handleRemoveService}
              />
            )}
  
            {activeTab === 'gym' && (
              <DeporteModule
                routines={routines}
                onUpdateRoutines={setRoutines}
              />
            )}
  
            {activeTab === 'todo' && (
              <ProductivityModule
                timeBlocks={timeBlocks}
                tasks={tasks}
                onUpdateTimeBlocks={setTimeBlocks}
                onUpdateTasks={setTasks}
                habits={habits}
                onUpdateHabits={setHabits}
              />
            )}
  
            {activeTab === 'settings' && (
              <SettingsModule
                appName={appName}
                onUpdateAppName={setAppName}
                accentColor={accentColor}
                onUpdateAccentColor={setAccentColor}
                fontFamily={fontFamily}
                onUpdateFontFamily={setFontFamily}
                appStyle={appStyle}
                onUpdateAppStyle={setAppStyle}
                userName={userName}
                onUpdateUserName={setUserName}
              />
            )}
  

            {activeTab === 'journal' && (
              <JournalModule
                entries={journals}
                onUpdateEntries={setJournals}
                habits={habits}
              />
            )}
          </ErrorBoundary>
        </div>

      </main>

    </div>
  );
}

