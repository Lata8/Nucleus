/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- Base Configurations ---
export interface AppSettings {
  hourlySalaryARS: number;
  monthlySalaryARS: number;
  salaryPayDay: number; // Day of the month (e.g. 10)
  targetSavingsGoal: number; // Monthly saving goal in USD or ARS
  targetSavingsCurrency: 'ARS' | 'USD';
  emergencyFundMonths: number; // Defaults to 3 or 6 months
  emergencyFundPercent?: number; // Configurable percentage (e.g. 5, 10, etc.)
  emergencyFundFrequency?: 'semanal' | 'quincenal' | 'mensual'; // How often the user earns / wants to allocate
  emergencyFundEstimatedIncome?: number; // Estimated amount per paycheck "cuanto cobro aprox"
}

// --- Finance Module ---
export interface Income {
  id: string;
  source: string;
  amount: number;
  currency: 'ARS' | 'USD';
  date: string;
  isRecurringSalary: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: 'ARS' | 'USD';
  date: string;
  category: 'Comida' | 'Transporte' | 'Salud' | 'Servicios' | 'Ocio' | 'Otros';
  isOptional: boolean;
  costInWorkingHours?: number; // Calculated hours spent based on labor cost
  exchangeRateUsed: number; // Conversion rate at the time
}

export interface FixedService {
  id: string;
  name: string;
  amountARS: number;
  dueDate: string; // ISO date YYYY-MM-DD
  isPaid: boolean;
}

// --- Gym & Training Module ---
export interface Exercise {
  id: string;
  name: string;
  category: string; // e.g. "Pecho", "Espalda", "Piernas"
  defaultRestTime: number; // in seconds
}

export interface GymSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: GymSet[];
  weeklyHistoryLog: { date: string; weight: number; reps: number; setsCount: number }[]; // For progressive overload
  consecutiveNoProgressWeeks: number; // To trigger stagnation alert
}

export interface RoutineDay {
  id: string;
  dayName: string; // e.g. "Lunes (Pecho/Tríceps)"
  exercises: RoutineExercise[];
}

// --- Productivity Module ---
export interface TimeBlock {
  id: string;
  title: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  category: 'Trabajo' | 'Gimnasio' | 'Finanzas' | 'Ocio' | 'Descanso' | 'Comida';
  actualMinutesSpent?: number; // For time auditing
}

export interface ToDoTask {
  id: string;
  title: string;
  completed: boolean;
  isWorkRelated: boolean; // Filters tasks during focus mode
  failedReason?: FaltazoReason; // Selected if left uncompleted
  date: string; // YYYY-MM-DD
  recurrence?: 'diaria' | 'manana' | 'unica'; // Optional recurrence config
}

export type FaltazoReason =
  | 'Falta de energía'
  | 'Emergencia'
  | 'Clima'
  | 'Falta de tiempo'
  | 'Procrastinación'
  | 'Otro';

// --- Atomic Habits Module ---
export interface Habit {
  id: string;
  title: string;
  identity: string; // e.g. "Programador productivo", "Atleta disciplinado"
  cue: string; // Habit stacking trigger: "Después de [hábito actual], voy a [hábito nuevo]"
  frictionTip: string; // Trick to make it easy/hard: "Tener el libro en la mesa" / "Poner contraseña a la consola"
  streak: number;
  bestStreak: number;
  history: { [date: string]: boolean }; // Record of completions by date key (YYYY-MM-DD): true/false
  category: 'Salud' | 'Mente' | 'Finanzas' | 'Trabajo' | 'Social';
  isHarmful: boolean; // If true, it is a negative habit being broken (Hacerlo difícil)
}

// --- Daily Journaling & Reflection Module ---
export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: 'Increíble' | 'Bien' | 'Neutral' | 'Ansioso' | 'Cansado';
  gratitude: string; // What I am grateful for
  dailyFocus: string; // What's the target focus or win
  brainDump: string; // Random thoughts / empty the mind
  reflection: string; // Daily reflection (what went well, what to optimize)
}

// --- Exchange Rates & API States ---
export interface ExchangeRates {
  oficial: number;
  blue: number;
  mep: number;
  lastUpdated: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  iconCode: number;
  isRaining: boolean;
  city: string;
}
