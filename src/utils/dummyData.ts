/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings, Income, Expense, FixedService, RoutineDay, TimeBlock, ToDoTask, Habit, JournalEntry } from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  monthlySalaryARS: 0,
  hourlySalaryARS: 0,
  salaryPayDay: 5,
  targetSavingsGoal: 0,
  targetSavingsCurrency: 'ARS',
  emergencyFundMonths: 3,
  emergencyFundPercent: 5,
  emergencyFundFrequency: 'semanal',
  emergencyFundEstimatedIncome: 500000,
};

export const INITIAL_INCOMES: Income[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_SERVICES: FixedService[] = [];

export const INITIAL_ROUTINES: RoutineDay[] = [
  {
    id: 'day-1',
    dayName: 'Lunes',
    exercises: []
  },
  {
    id: 'day-2',
    dayName: 'Martes',
    exercises: []
  },
  {
    id: 'day-3',
    dayName: 'Miércoles',
    exercises: []
  },
  {
    id: 'day-4',
    dayName: 'Jueves',
    exercises: []
  },
  {
    id: 'day-5',
    dayName: 'Viernes',
    exercises: []
  },
  {
    id: 'day-6',
    dayName: 'Sábado',
    exercises: []
  },
  {
    id: 'day-7',
    dayName: 'Domingo',
    exercises: []
  }
];

export const INITIAL_TIME_BLOCKS: TimeBlock[] = [];

export const INITIAL_TASKS: ToDoTask[] = [];

export const INITIAL_HABITS: Habit[] = [];
export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [];


