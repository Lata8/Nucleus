/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  PlusCircle, 
  Trash2, 
  TrendingDown, 
  HelpCircle, 
  AlertTriangle, 
  Calendar, 
  Coins, 
  Sliders, 
  ArrowLeftRight,
  Sparkles,
  Pocket
} from 'lucide-react';
import { Income, Expense, FixedService, ExchangeRates, AppSettings } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { customAlert, customConfirm } from '../utils/customAlerts';

interface FinanceModuleProps {
  incomes: Income[];
  expenses: Expense[];
  services: FixedService[];
  exchangeRates: ExchangeRates;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onAddIncome: (income: Omit<Income, 'id'>) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onAddService: (service: Omit<FixedService, 'id'>) => void;
  onToggleServicePaid: (id: string) => void;
  onRemoveExpense: (id: string) => void;
  onRemoveIncome: (id: string) => void;
  onRemoveService: (id: string) => void;
}

export default function FinanceModule({
  incomes,
  expenses,
  services,
  exchangeRates,
  settings,
  onUpdateSettings,
  onAddIncome,
  onAddExpense,
  onAddService,
  onToggleServicePaid,
  onRemoveExpense,
  onRemoveIncome,
  onRemoveService,
}: FinanceModuleProps) {
  // Config & State
  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes' | 'services' | 'savings' | 'charts'>('expenses');
  
  const todayStr = getLocalDateString();
  const todayParts = todayStr.split('-');
  const todayDay = parseInt(todayParts[2], 10) || 15;

  // States for new entries
  const [incomeSource, setIncomeSource] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeCurrency, setIncomeCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [isSalary, setIsSalary] = useState(false);
  const [incomeDate, setIncomeDate] = useState(todayStr);

  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCurrency, setExpenseCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('Comida');
  const [isExpenseOptional, setIsExpenseOptional] = useState(true);
  const [expenseDate, setExpenseDate] = useState(todayStr);

  const [serviceName, setServiceName] = useState('');
  const [serviceAmount, setServiceAmount] = useState('');
  const [serviceDueDate, setServiceDueDate] = useState('');



  // Interactive settings state edit
  const [editMonthlySalary, setEditMonthlySalary] = useState(settings.monthlySalaryARS.toString());
  const [editPayDay, setEditPayDay] = useState(settings.salaryPayDay.toString());
  const [editSavingsGoal, setEditSavingsGoal] = useState(settings.targetSavingsGoal.toString());
  const [editSavingsCurrency, setEditSavingsCurrency] = useState<'ARS' | 'USD'>(settings.targetSavingsCurrency);

  // Calculate parameters (hourly rate display disabled as per user instruction)
  const workingHoursPerMonth = 20 * 7; 
  const currentHourlySalary = Math.round(settings.monthlySalaryARS / workingHoursPerMonth) || 1200;

  // Auto Calculations (Differentiate between available cash and projected totals)
  const activeIncomes = incomes.filter(inc => {
    if (!inc.date) return true;
    return inc.date <= todayStr;
  });

  const pendingIncomes = incomes.filter(inc => {
    if (!inc.date) return false;
    return inc.date > todayStr;
  });

  const totalIncomesARS = activeIncomes.reduce((acc, curr) => {
    return acc + (curr.currency === 'USD' ? curr.amount * exchangeRates.blue : curr.amount);
  }, 0);

  const pendingIncomesARS = pendingIncomes.reduce((acc, curr) => {
    return acc + (curr.currency === 'USD' ? curr.amount * exchangeRates.blue : curr.amount);
  }, 0);

  const totalExpensesARS = expenses.reduce((acc, curr) => {
    return acc + (curr.currency === 'USD' ? curr.amount * exchangeRates.blue : curr.amount);
  }, 0);

  const totalIncomesUSD = totalIncomesARS / exchangeRates.blue;
  const totalExpensesUSD = totalExpensesARS / exchangeRates.blue;

  // Projection of fixed services
  const totalUnpaidServicesARS = services
    .filter(s => !s.isPaid)
    .reduce((acc, curr) => acc + curr.amountARS, 0);

  const totalFixedServicesMonth = services.reduce((acc, curr) => acc + curr.amountARS, 0);
  const weeklyReservedNeeded = totalFixedServicesMonth / 4;

  // Stoplight helper for due dates
  const getDaysRemaining = (dueDateStr: string): number => {
    const parts = dueDateStr.split('-');
    const due = parts.length === 3
      ? new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
      : new Date(dueDateStr);
    const today = new Date();
    // Reset times to compare clean days
    due.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDueDateStatus = (dueDateStr: string, isPaid: boolean) => {
    if (isPaid) return { color: 'bg-emerald-950/60 text-emerald-400 border-emerald-900/50', label: 'Pagado' };
    const daysLeft = getDaysRemaining(dueDateStr);
    if (daysLeft < 0) return { color: 'bg-red-950/70 text-red-400 border-red-900/50 animate-pulse', label: `Faltan ${Math.abs(daysLeft)} días (Vencido)` };
    if (daysLeft <= 3) return { color: 'bg-red-950/60 text-red-400 border-red-900/50', label: `Vence en ${daysLeft} d (Urgente)` };
    if (daysLeft <= 7) return { color: 'bg-amber-950/60 text-amber-300 border-amber-900/50', label: `Vence en ${daysLeft} d` };
    return { color: 'bg-indigo-950/60 text-indigo-300 border-indigo-900/50', label: `Vence en ${daysLeft} d` };
  };

  // Savings advisor suggester
  // Deduct fixed essential expenses & unpaid services to calculate discretionary budget.
  const essentialExpensesARS = expenses
    .filter(e => !e.isOptional)
    .reduce((acc, curr) => acc + (curr.currency === 'USD' ? curr.amount * exchangeRates.blue : curr.amount), 0);

  const targetSavingsARS = settings.targetSavingsGoal * 
    (settings.targetSavingsCurrency === 'USD' ? exchangeRates.blue : 1);

  const remainingDiscretionaryARS = totalIncomesARS - essentialExpensesARS - totalFixedServicesMonth - targetSavingsARS;
  const recommendedDailyARS = Math.max(0, remainingDiscretionaryARS / 30);

  const getWeeklyIncomes = (weekNum: number) => {
    return incomes.filter(inc => {
      // Handle fallback if date is missing or invalid
      if (!inc.date) return false;
      if (!inc.date.startsWith('2026-06-')) return false;
      const day = parseInt(inc.date.split('-')[2]);
      if (isNaN(day)) return false;
      if (weekNum === 1) return day >= 1 && day <= 7;
      if (weekNum === 2) return day >= 8 && day <= 14;
      if (weekNum === 3) return day >= 15 && day <= 21;
      if (weekNum === 4) return day >= 22 && day <= 28;
      return day >= 29 && day <= 30;
    });
  };

  const getWeeklySumARS = (weekNum: number) => {
    const list = getWeeklyIncomes(weekNum);
    return list.reduce((sum, inc) => {
      const value = inc.currency === 'USD' ? inc.amount * exchangeRates.blue : inc.amount;
      return sum + value;
    }, 0);
  };

  // Handlers
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!expenseDesc || isNaN(amt) || amt <= 0) return;

    onAddExpense({
      description: expenseDesc,
      amount: amt,
      currency: expenseCurrency,
      date: expenseDate,
      category: expenseCategory,
      isOptional: isExpenseOptional,
      exchangeRateUsed: exchangeRates.blue,
    });

    setExpenseDesc('');
    setExpenseAmount('');
    setIsExpenseOptional(true);
  };

  const handleAddIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(incomeAmount);
    if (!incomeSource || isNaN(amt) || amt <= 0) return;

    onAddIncome({
      source: incomeSource,
      amount: amt,
      currency: incomeCurrency,
      date: incomeDate,
      isRecurringSalary: isSalary,
    });

    setIncomeSource('');
    setIncomeAmount('');
    setIsSalary(false);
  };

  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(serviceAmount);
    if (!serviceName || isNaN(amt) || amt <= 0 || !serviceDueDate) return;

    onAddService({
      name: serviceName,
      amountARS: amt,
      dueDate: serviceDueDate,
      isPaid: false,
    });

    setServiceName('');
    setServiceAmount('');
    setServiceDueDate('');
  };

  const handleUpdateConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sal = parseFloat(editMonthlySalary);
    const pd = parseInt(editPayDay);
    const sg = parseFloat(editSavingsGoal);

    if (isNaN(sal) || isNaN(pd) || isNaN(sg)) return;

    const calculatedHourly = Math.round(sal / (20 * 7));

    onUpdateSettings({
      monthlySalaryARS: sal,
      hourlySalaryARS: calculatedHourly,
      salaryPayDay: pd,
      targetSavingsGoal: sg,
      targetSavingsCurrency: editSavingsCurrency,
      emergencyFundMonths: settings.emergencyFundMonths,
    });
    customAlert('Configuración de Finanzas actualizada con éxito.', 'success');
  };



  // Grouping data for deflated graph
  // Let's group expenses of last entries into a custom SVG bar showing ARS nominal vs USD Real (Blue)
  const chartPoints = expenses.slice(-6).reverse(); // last 6 expenses

  return (
    <div className="space-y-6" id="finance-module-root">
      
      {/* Top Banner metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" id="metric-top-cards">
        <div className="bg-[#0b1323] border border-slate-800/80 rounded-xl p-3 text-center">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Ingresos en Efectivo</span>
          <span className="text-base font-black text-emerald-400 block mt-0.5">${Math.round(totalIncomesARS).toLocaleString('es-AR')} ARS</span>
          <span className="text-[9.5px] text-slate-500 block font-mono font-medium">≈ ${Math.round(totalIncomesUSD).toLocaleString('en-US')} USD Blue</span>
        </div>
        <div className="bg-[#0b1323] border border-slate-800/80 rounded-xl p-3 text-center">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Gastos Acumulados</span>
          <span className="text-base font-black text-rose-400 block mt-0.5">${Math.round(totalExpensesARS).toLocaleString('es-AR')} ARS</span>
          <span className="text-[9.5px] text-slate-500 block font-mono font-medium">≈ ${Math.round(totalExpensesUSD).toLocaleString('en-US')} USD</span>
        </div>
        <div className="bg-[#0b1323] border border-slate-800/80 rounded-xl p-3 text-center">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Cobros Programados ⏳</span>
          <span className="text-base font-black text-indigo-400 block mt-0.5">${Math.round(pendingIncomesARS).toLocaleString('es-AR')} ARS</span>
          <span className="text-[9.5px] text-indigo-300 block font-medium">Suma de días futuros</span>
        </div>
        <div className="bg-[#0b1323] border border-slate-800/80 rounded-xl p-3 text-center">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Servicios por Semana</span>
          <span className="text-base font-black text-amber-400 block mt-0.5">${Math.round(weeklyReservedNeeded).toLocaleString('es-AR')} ARS</span>
          <span className="text-[9.5px] text-amber-300 block font-medium">Reserva sugerida x 4</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-800 overflow-x-auto flex-nowrap shrink-0 scrollbar-none" id="finance-local-tabs">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`cursor-pointer px-4 text-center py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'expenses' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Gastos y Reg.
        </button>
        <button
          onClick={() => setActiveTab('incomes')}
          className={`cursor-pointer px-4 text-center py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'incomes' ? 'border-amber-500 text-amber-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Calendario Ingresos 📅
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`cursor-pointer px-4 text-center py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'services' ? 'border-red-500 text-rose-450 font-extrabold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Servicios Fijos
        </button>
        <button
          onClick={() => setActiveTab('savings')}
          className={`cursor-pointer px-4 text-center py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'savings' ? 'border-emerald-500 text-emerald-450 font-extrabold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Meta Ahorro
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`cursor-pointer px-4 text-center py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'charts' ? 'border-sky-500 text-sky-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Historial Real
        </button>
      </div>

      {/* RENDER TAB 1: GASTOS E INGRESOS */}
      {activeTab === 'expenses' && (
        <div className="space-y-6" id="tab-expenses-content">


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Form to Registrate an expense */}
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-[#aeb4bd] flex items-center">
                <Coins className="w-4 h-4 mr-1 text-indigo-400" />
                Registrar Nuevo Gasto
              </h3>
              
              <form onSubmit={handleAddExpenseSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Monto gastado</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-semibold">$</span>
                      <input
                        type="number"
                        placeholder="Monto"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        className="w-full pl-5 pr-2 py-1.5 text-xs border border-slate-800 rounded-xl bg-[#070c18] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Moneda</label>
                    <select
                      value={expenseCurrency}
                      onChange={(e: any) => setExpenseCurrency(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-800 bg-[#070c18] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="ARS">ARS (Pesos)</option>
                      <option value="USD">USD (Dólares)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Descripción</label>
                  <input
                    type="text"
                    placeholder="Ej: Almuerzo de trabajo, Café, Uber..."
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-800 bg-[#070c18] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Categoría</label>
                    <select
                      value={expenseCategory}
                      onChange={(e: any) => setExpenseCategory(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-800 bg-[#070c18] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Comida">Comida</option>
                      <option value="Transporte">Transporte</option>
                      <option value="Salud">Salud</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Ocio">Ocio</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Fecha</label>
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-[#070c18] text-white font-mono cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={isExpenseOptional}
                      onChange={(e) => setIsExpenseOptional(e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-[#070c18]"
                    />
                    <span>¿Es Gasto Opcional?</span>
                  </label>
                </div>



                <button
                  type="submit"
                  className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-2 px-4 rounded-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center space-x-1.5 border border-indigo-400"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Añadir Gasto</span>
                </button>
              </form>
            </div>

            {/* Expenses list logs */}
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col h-[350px]">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historial Reciente de Gastos</span>
              
              <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                {expenses.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs font-medium">Sin gastos registrados todavía en el mes.</div>
                ) : (
                  expenses.map((exp) => (
                    <div 
                      key={exp.id} 
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/60 hover:bg-[#070c18] transition-all text-xs text-slate-200"
                      id={`expense-${exp.id}`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-white">{exp.description}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                            exp.isOptional ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40' : 'bg-[#0e1a38] border border-slate-800 text-slate-400'
                          }`}>
                            {exp.isOptional ? 'Opcional' : 'Obligatorio'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {exp.date} • {exp.category} 
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-white">
                          {exp.currency === 'USD' ? `U$S ${exp.amount}` : `$${exp.amount.toLocaleString('es-AR')}`}
                        </span>
                        <button
                          onClick={() => onRemoveExpense(exp.id)}
                          className="text-red-500 hover:text-red-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RENDER TAB: CALENDARIO DE INGRESOS */}
      {activeTab === 'incomes' && (
        <div className="space-y-6" id="tab-incomes-content">
          {/* Monthly Calendar View - June 2026 */}
          <div className="bg-[#0b1323] border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <h3 className="text-base font-bold text-[#aeb4bd] flex items-center gap-1.5 font-sans">
                  <Calendar className="w-5 h-5 text-amber-500 animate-pulse" />
                  Calendario de Ingresos Semanales
                </h3>
                <p className="text-xs text-slate-300">
                  Controla cuándo ingresa tu dinero. Haz clic en cualquier día para registrar cobros de esa semana.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Mes en Curso</span>
                <span className="text-xs bg-indigo-950 text-indigo-300 px-3 py-1 rounded-full font-bold font-mono border border-indigo-555/25">Junio 2026</span>
              </div>
            </div>

            {/* Weekly Sum cards representing "Cobro por semana" */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3" id="weekly-flow-cards">
              {[1, 2, 3, 4, 5].map((w) => {
                let currentWeekNum = 2; // default
                if (todayDay >= 1 && todayDay <= 7) currentWeekNum = 1;
                else if (todayDay >= 8 && todayDay <= 14) currentWeekNum = 2;
                else if (todayDay >= 15 && todayDay <= 21) currentWeekNum = 3;
                else if (todayDay >= 22 && todayDay <= 28) currentWeekNum = 4;
                else if (todayDay >= 29 && todayDay <= 30) currentWeekNum = 5;
                const isCurrentWeek = w === currentWeekNum;
                const weeklySum = getWeeklySumARS(w);
                return (
                  <div 
                    key={w} 
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      isCurrentWeek 
                        ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/35 shadow-lg' 
                        : 'bg-[#131e32] border-slate-700/50 hover:bg-[#1a2942] hover:border-slate-500/80 shadow-md'
                    }`}
                  >
                    <span className={`text-[11px] font-black block uppercase tracking-wider ${isCurrentWeek ? 'text-amber-300' : 'text-white'}`}>
                      Semana {w} {isCurrentWeek ? '• Hoy' : ''}
                    </span>
                    <span className={`text-[10px] font-bold block mt-0.5 font-mono ${isCurrentWeek ? 'text-amber-400' : 'text-slate-300'}`}>
                      {w === 1 ? '1-7 Jun' : w === 2 ? '8-14 Jun' : w === 3 ? '15-21 Jun' : w === 4 ? '22-28 Jun' : '29-30 Jun'}
                    </span>
                    <span className={`text-sm font-extrabold block mt-1.5 font-mono ${isCurrentWeek ? 'text-amber-200' : 'text-emerald-400'}`}>
                      ${Math.round(weeklySum).toLocaleString('es-AR')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calendar Grid June 2026 */}
            <div className="space-y-2">
              <div className="grid grid-cols-7 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pt-2">
                <div>Lun</div>
                <div>Mar</div>
                <div>Mié</div>
                <div>Jue</div>
                <div>Vie</div>
                <div>Sáb</div>
                <div>Dom</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {/* June 2026 starts on Monday June 1, so no empty days padding needed! */}
                {Array.from({ length: 30 }, (_, index) => {
                  const dayNum = index + 1;
                  const dateStr = `2026-06-${dayNum.toString().padStart(2, '0')}`;
                  
                  // Incomes on this day
                  const dayIncomes = incomes.filter(inc => inc.date === dateStr);
                  const hasIncomes = dayIncomes.length > 0;
                  const isSelected = incomeDate === dateStr;
                  const isToday = dayNum === todayDay;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => {
                        setIncomeDate(dateStr);
                        // Focus description input helper
                        const el = document.getElementById('income-source-input');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`cursor-pointer min-h-[68px] p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
                        isSelected 
                          ? 'border-indigo-450 bg-indigo-950/80 ring-2 ring-indigo-500/45 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]' 
                          : isToday 
                          ? 'border-amber-400/90 bg-amber-950/40 text-white shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                          : hasIncomes 
                          ? 'border-emerald-500/60 bg-emerald-950/30 hover:bg-emerald-950/40 text-emerald-200' 
                          : 'border-slate-800 bg-[#070c18]/60 hover:bg-[#0c1426] text-slate-300'
                      }`}
                    >
                      {/* Decorative background gradients */}
                      {isSelected && <div className="absolute top-0 right-0 w-8 h-8 -mr-4 -mt-4 rounded-full bg-indigo-500/10 blur-sm pointer-events-none"></div>}
                      {isToday && <div className="absolute top-0 right-0 w-8 h-8 -mr-4 -mt-4 rounded-full bg-amber-500/10 blur-sm pointer-events-none"></div>}
                      {hasIncomes && <div className="absolute bottom-0 right-0 w-10 h-10 -mr-4 -mb-4 rounded-full bg-emerald-500/5 blur-sm pointer-events-none"></div>}

                      <div className="flex justify-between items-center w-full relative z-10">
                        <span className={`text-[11px] font-black w-5 h-5 rounded-lg flex items-center justify-center font-mono transition-all ${
                          isToday 
                            ? 'bg-amber-500 text-slate-950 shadow-sm font-black' 
                            : isSelected 
                            ? 'bg-indigo-600 text-white font-extrabold' 
                            : hasIncomes 
                            ? 'bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/20' 
                            : 'text-slate-200 group-hover:text-white'
                        }`}>
                          {dayNum}
                        </span>
                        
                        {/* Status Label Pills */}
                        <div className="flex items-center space-x-1">
                          {isToday && (
                            <span className="text-[7px] uppercase font-black tracking-wider text-amber-400 bg-amber-950/80 border border-amber-500/45 px-1 py-0.5 rounded font-sans scale-90">
                              Hoy
                            </span>
                          )}
                          {hasIncomes && (
                            <span className="text-[7px] uppercase font-black tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-1 py-0.5 rounded font-sans scale-90 animate-pulse">
                              Cobro
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Income summaries inside the day */}
                      <div className="space-y-1 mt-1.5 overflow-hidden w-full relative z-10">
                        {hasIncomes ? (
                          dayIncomes.slice(0, 1).map((inc) => (
                            <div 
                              key={inc.id} 
                              className={`text-[8px] leading-tight font-extrabold border rounded-lg px-1.5 py-0.5 truncate font-mono flex items-center justify-between ${
                                isSelected 
                                  ? 'bg-indigo-900/60 text-indigo-200 border-indigo-500/30' 
                                  : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/35'
                              }`}
                            >
                              <span className="truncate max-w-[55%]">{inc.source}</span>
                              <span className="shrink-0 font-bold ml-1 text-emerald-400">
                                {inc.currency === 'USD' ? `U$S${inc.amount}` : `$${Math.round(inc.amount/1000)}k`}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[8px] text-slate-550 italic block opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            + Reg. Cobro
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-[#070c18]/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" id="calendar-legend-box">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Referencia de Estados:</span>
              <div className="flex flex-wrap gap-3.5 text-[10px]">
                <div className="flex items-center space-x-2 bg-indigo-950/60 border border-indigo-500/40 px-2.5 py-1.5 rounded-xl text-indigo-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366f1]"></span>
                  <span>Día Seleccionado</span>
                </div>
                <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1.5 rounded-xl text-emerald-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
                  <span>Con Ingreso / Cobros</span>
                </div>
                <div className="flex items-center space-x-2 bg-amber-950/50 border border-amber-500/40 px-2.5 py-1.5 rounded-xl text-amber-300 font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]"></span>
                  <span>Día de Hoy ({todayDay} Jun)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form to Register Income + Incomes list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-[#aeb4bd] flex items-center">
                <PlusCircle className="w-4 h-4 mr-1 text-indigo-400" />
                Registrar Cobro / Ingreso
              </h3>
              
              <form onSubmit={handleAddIncomeSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Monto recibido</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-semibold">$</span>
                      <input
                        type="number"
                        placeholder="Monto"
                        value={incomeAmount}
                        onChange={(e) => setIncomeAmount(e.target.value)}
                        className="w-full pl-5 pr-2 py-1.5 text-xs border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono bg-[#070c18] text-white"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Moneda</label>
                    <select
                      value={incomeCurrency}
                      onChange={(e: any) => setIncomeCurrency(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-800 bg-[#070c18] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="ARS">ARS (Pesos)</option>
                      <option value="USD">USD (Dólares)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Descripción / Origen</label>
                    <input
                      id="income-source-input"
                      type="text"
                      placeholder="Ej: Cobro Semanal, Clase Extra..."
                      value={incomeSource}
                      onChange={(e) => setIncomeSource(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-[#070c18] text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Fecha de Ingreso</label>
                    <input
                      type="date"
                      value={incomeDate}
                      onChange={(e) => setIncomeDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-[#070c18] text-white font-mono cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={isSalary}
                      onChange={(e) => setIsSalary(e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-[#070c18]"
                    />
                    <span>¿Es Sueldo Fijo/Recurrente?</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-2 px-4 rounded-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center space-x-1.5 border border-indigo-400"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Añadir Ingreso</span>
                </button>
              </form>
            </div>

            {/* List of Registered Incomes */}
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col h-[350px]">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Lista de Ingresos del Mes</span>
              
              <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                {incomes.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs font-medium">No hay cobros registrados todavía.</div>
                ) : (
                  incomes.map((inc) => (
                    <div 
                      key={inc.id} 
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/80 bg-[#070c18] hover:bg-[#0c1426] transition-all text-xs text-slate-200"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <span className="font-bold text-white">{inc.source}</span>
                          {inc.isRecurringSalary && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-indigo-950/80 text-indigo-300 border border-indigo-900/40 font-extrabold font-mono">Sueldo</span>
                          )}
                          {inc.date > todayStr ? (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-950/80 text-amber-300 border border-amber-900/40 font-bold font-mono">⏳ Programado (${inc.date.split('-')[2]}/{inc.date.split('-')[1]})</span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-900/40 font-semibold font-mono">✓ Cobrado (Efectivo)</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">Fecha del calendario: {inc.date}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-emerald-400">
                          +{inc.currency === 'USD' ? `U$S ${inc.amount}` : `$${inc.amount.toLocaleString('es-AR')}`}
                        </span>
                        <button
                          onClick={() => onRemoveIncome(inc.id)}
                          className="text-red-500 hover:text-red-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 2: SERVICIOS FIJOS */}
      {activeTab === 'services' && (
        <div className="space-y-6" id="tab-services-content">
          
          <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-indigo-300 flex items-center">
                <Pocket className="w-4 h-4 mr-1 text-indigo-400" />
                Cálculo de Proyección Semanal
              </h4>
              <p className="text-xs text-indigo-200">
                Llevas un acumulado mensual de fixed services de <span className="font-extrabold text-white">${totalFixedServicesMonth.toLocaleString('es-AR')} ARS</span>. La app proyecta que debes guardar exactamente <span className="font-bold text-indigo-300">${Math.round(weeklyReservedNeeded).toLocaleString('es-AR')} ARS por semana</span> para cubrirlos con comodidad.
              </p>
            </div>
            <div className="bg-[#070c18] border border-indigo-900/30 rounded-xl p-3 text-center min-w-[150px]">
              <span className="text-[10px] text-slate-400 font-bold block">RESERVA SEMANAL</span>
              <span className="text-lg font-black text-indigo-400 font-mono">${Math.round(weeklyReservedNeeded).toLocaleString('es-AR')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Form to enter new fixed service */}
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-[#aeb4bd] flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-indigo-400" />
                Añadir Nuevo Servicio Mensual
              </h3>

              <form onSubmit={handleAddServiceSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Nombre del Servicio</label>
                  <input
                    type="text"
                    placeholder="Ej: Internet Fibertel, Gas, Expensas..."
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-800 bg-[#070c18] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Importe Estimado (ARS)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-semibold">$</span>
                    <input
                      type="number"
                      placeholder="Monto ARS"
                      value={serviceAmount}
                      onChange={(e) => setServiceAmount(e.target.value)}
                      className="w-full pl-5 pr-2 py-1.5 text-xs border border-slate-800 bg-[#070c18] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Fecha de Próximo Vencimiento</label>
                  <input
                    type="date"
                    value={serviceDueDate}
                    onChange={(e) => setServiceDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-800 bg-[#070c18] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-555 text-white font-bold text-xs py-2 px-4 rounded-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center space-x-1.5 border border-indigo-400"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Configurar Servicio fijo</span>
                </button>
              </form>
            </div>

            {/* Stoplight table panel for scheduled bills */}
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Semáforo de Servicios Fijos</span>
              
              <div className="space-y-2 h-[280px] overflow-y-auto pr-1">
                {services.map((ser) => {
                  const status = getDueDateStatus(ser.dueDate, ser.isPaid);
                  return (
                    <div 
                      key={ser.id} 
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs ${
                        ser.isPaid ? 'bg-slate-900/40 border-slate-800/60 opacity-60' : 'bg-[#0f0b3d] border-indigo-900/40'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            ser.isPaid 
                              ? 'bg-emerald-400' 
                              : getDaysRemaining(ser.dueDate) <= 3 
                              ? 'bg-red-500 animate-ping' 
                              : getDaysRemaining(ser.dueDate) <= 7 
                              ? 'bg-amber-400' 
                              : 'bg-indigo-500'
                          }`}></span>
                          <span className="font-bold text-white mb-0.5">{ser.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Vencimiento: {ser.dueDate}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right space-y-0.5">
                          <span className="font-mono font-bold text-white block">
                            ${ser.amountARS.toLocaleString('es-AR')}
                          </span>
                          <span className={`inline-block px-1.5 py-0.5 rounded-full text-[8.5px] font-bold border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={ser.isPaid}
                            onChange={() => onToggleServicePaid(ser.id)}
                            className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4 bg-[#070c18]"
                          />
                          <button
                            onClick={() => onRemoveService(ser.id)}
                            className="text-red-500 hover:text-red-400 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
      {activeTab === 'savings' && (() => {
        // Calculations for targeted savings
        const monthlyGoal = settings.targetSavingsGoal;
        const monthlyCurrency = settings.targetSavingsCurrency;
        
        const monthlyGoalARS = monthlyCurrency === 'ARS' ? monthlyGoal : monthlyGoal * exchangeRates.blue;
        const monthlyGoalUSD = monthlyCurrency === 'USD' ? monthlyGoal : monthlyGoal / exchangeRates.blue;
        
        const weeklyGoalARS = monthlyGoalARS / 4;
        const weeklyGoalUSD = monthlyGoalUSD / 4;
        
        const dailyGoalARS = monthlyGoalARS / 30;
        const dailyGoalUSD = monthlyGoalUSD / 30;

        // Budget status capacity status based solely on income vs savings goal
        const capacityStatus = settings.monthlySalaryARS >= monthlyGoalARS
          ? { isOk: true, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40', text: '¡Excelente! Tu sueldo cubre holgadamente tu meta de ahorro mensual.' }
          : { isOk: false, color: 'text-amber-400 bg-amber-950/40 border-amber-800/40', text: '⚠️ ¡Atención! Tu sueldo mensual registrado no supera tu meta de ahorro mensual. ¡Se recomienda ajustar tu meta de ahorro u optimizar tus egresos generales!' };

        return (
          <div className="space-y-6" id="tab-savings-content">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0e1628] border border-slate-800/60 p-4 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] text-white uppercase font-bold tracking-wider block">Tu Meta Mensual</span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-2xl font-black font-mono text-white">
                    {monthlyCurrency === 'USD' ? 'U$S' : '$'} {monthlyGoal.toLocaleString('es-AR')}
                  </span>
                  <span className="text-xs text-slate-400">/ mes</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Equivale a: <strong className="text-slate-300 font-mono">{monthlyCurrency === 'USD' ? '$' : 'U$S'} {Math.round(monthlyCurrency === 'USD' ? monthlyGoalARS : monthlyGoalUSD).toLocaleString('es-AR')}</strong>
                </span>
              </div>

              <div className="bg-[#0e1628] border border-slate-800/60 p-4 rounded-2xl">
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Meta Semanal</span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-2xl font-black font-mono text-emerald-300">
                    {monthlyCurrency === 'USD' ? 'U$S' : '$'} {Math.round(weeklyGoalUSD * 10) / 10 === weeklyGoalUSD ? weeklyGoalUSD : weeklyGoalUSD.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">/ semana</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Equivale a: <strong className="text-slate-300 font-mono">${Math.round(weeklyGoalARS).toLocaleString('es-AR')} ARS/sem</strong>
                </span>
              </div>

              <div className="bg-[#0e1628] border border-slate-800/60 p-4 rounded-2xl">
                <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block">Meta Diaria</span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-2xl font-black font-mono text-[#3f6bad]">
                    {monthlyCurrency === 'USD' ? 'U$S' : '$'} {Math.round(dailyGoalUSD * 10) / 10 === dailyGoalUSD ? dailyGoalUSD : dailyGoalUSD.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">/ día</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Equivale a: <strong className="text-slate-300 font-mono">${Math.round(dailyGoalARS).toLocaleString('es-AR')} ARS/día</strong>
                </span>
              </div>
            </div>

            {/* Config & Calculations layout split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Set Saving Goal panel */}
              <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 text-indigo-400 pb-2 border-b border-slate-800">
                  <Pocket className="w-5 h-5" />
                  <h4 className="text-sm font-bold text-[#aeb4bd]">Definir Monto de Ahorro</h4>
                </div>

                <form onSubmit={handleUpdateConfigSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Monto Mensual Objetivo</label>
                      <input
                        type="number"
                        min="0"
                        value={editSavingsGoal}
                        onChange={(e) => setEditSavingsGoal(e.target.value)}
                        placeholder="Ej. 200"
                        className="w-full bg-[#070c18] border border-slate-800 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Moneda Seleccionada</label>
                      <select
                        value={editSavingsCurrency}
                        onChange={(e) => setEditSavingsCurrency(e.target.value as 'ARS' | 'USD')}
                        className="w-full bg-[#070c18] border border-slate-800 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-white"
                      >
                        <option value="USD">Dólares (USD Blue)</option>
                        <option value="ARS">Pesos (ARS)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tu Ingreso Neto / Sueldo Mensual (ARS)</label>
                    <input
                      type="number"
                      min="0"
                      value={editMonthlySalary}
                      onChange={(e) => setEditMonthlySalary(e.target.value)}
                      placeholder="Ej. 900000"
                      className="w-full bg-[#070c18] border border-slate-800 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="cursor-pointer w-full bg-indigo-600 font-bold text-xs py-2.5 px-3 rounded-xl hover:bg-indigo-500 text-white transition-all text-center shadow-lg hover:shadow-indigo-500/10"
                  >
                    Establecer Ajustes de Ahorro
                  </button>
                </form>

                {/* Capacity alert Box */}
                <div className={`p-4 rounded-xl border text-[11px] leading-relaxed font-sans ${capacityStatus.color}`}>
                  {capacityStatus.text}
                </div>
              </div>

              {/* Dynamic calculations card */}
              <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 text-emerald-400 pb-2 border-b border-slate-800">
                  <Coins className="w-5 h-5" />
                  <h4 className="text-sm font-bold text-[#aeb4bd]">Resumen de Flujos Requeridos</h4>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    La siguiente tabla calcula de forma automática cuánta liquidez de fondos debes retener y apartar para cumplir tus metas de ahorro según tus ingresos:
                  </p>

                  <div className="space-y-3 bg-[#070c18] p-4 border border-slate-800 rounded-xl">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800/50">
                      <span className="text-slate-400">Ahorro Mensual Requerido:</span>
                      <span className="font-bold font-mono text-white">
                        ${Math.round(monthlyGoalARS).toLocaleString('es-AR')} ARS
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800/50">
                      <span className="text-slate-400">Ahorro Requerido Semanal:</span>
                      <span className="font-bold font-mono text-emerald-400">
                        ${Math.round(weeklyGoalARS).toLocaleString('es-AR')} ARS
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800/50">
                      <span className="text-slate-400">Ahorro Requerido Diario:</span>
                      <span className="font-bold font-mono text-indigo-400">
                        ${Math.round(dailyGoalARS).toLocaleString('es-AR')} ARS
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-[#0d162a] p-3 rounded-xl border border-indigo-950">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-indigo-300 font-extrabold uppercase block tracking-wider">Ahorro Requerido Semanal</span>
                        <span className="text-[10px] text-slate-400 block">Pesos vs Dólares</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black font-mono text-white block">
                          ${Math.round(weeklyGoalARS).toLocaleString('es-AR')} ARS
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          ~ U$S {weeklyGoalUSD.toFixed(1)} USD
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <strong className="text-[#aeb4bd] text-[12px]">Consejo de Reservación Diaria:</strong> <i></i>
                    <p>
                      Para sostener tus metas sin deudas, debes evitar gastar un promedio de <span className="font-bold text-white">${Math.round(dailyGoalARS).toLocaleString('es-AR')} ARS reales por día</span> en consumos variables u opcionales de tu billetera diaria.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        );
      })()}

      {/* RENDER TAB 4: DEFLATED CHARTS (USD BLUE REAL COST) */}
      {activeTab === 'charts' && (
        <div className="space-y-6" id="tab-charts-content">
          <div className="bg-[#0b1323] border border-slate-800 rounded-3xl p-5 space-y-4">
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#aeb4bd] flex items-center">
                <Sliders className="w-4 h-4 mr-1 text-indigo-400" />
                Doble Historial de Gastos Deflacionados (ARS Nominal vs USD Blue Real)
              </h3>
              <p className="text-xs text-slate-300">
                Debido a la alta inflación en Argentina, medir los gastos estables en pesos desvirtúa por completo el consumo real. Esta pantalla convierte cada gasto histórico a su valor equivalente en <span className="font-bold text-emerald-400">Dólares Blue</span> al momento del ticket para mostrar un balance financiero descorrelacionado.
              </p>
            </div>

            {/* Custom SVG line Chart */}
            {chartPoints.length < 2 ? (
              <div className="text-center py-16 text-xs text-slate-400 font-medium">
                Carga por lo menos 2 gastos variables para ver un gráfico deflacionado de tendencia real.
              </div>
            ) : (
              <div className="space-y-4 border border-slate-800 p-4 rounded-xl bg-[#070c18]/80" id="deflationary-chart-wrapper">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Curva de consumo real medible</span>
                
                <div className="relative h-48 w-full flex items-end justify-between px-6 pt-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none pr-2">
                    <div className="border-b border-dashed border-slate-800/60 w-full h-0"></div>
                    <div className="border-b border-dashed border-slate-800/60 w-full h-0"></div>
                    <div className="border-b border-dashed border-slate-800/60 w-full h-0"></div>
                  </div>

                  {/* SVG Drawing Line */}
                  <svg className="absolute inset-0 h-full w-full px-6 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                      d={(() => {
                        const maxVal = Math.max(...chartPoints.map((p) => p.amount));
                        const coords = chartPoints.map((p, idx) => {
                          const x = (idx / (chartPoints.length - 1)) * 100;
                          const y = 90 - (p.amount / maxVal) * 75; // scale factor
                          return `${x},${y}`;
                        });
                        return `M ${coords.join(' L ')}`;
                      })()}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                    />
                    <path
                      d={(() => {
                        const maxValUsd = Math.max(...chartPoints.map((p) => p.currency === 'USD' ? p.amount : p.amount / p.exchangeRateUsed));
                        const coords = chartPoints.map((p, idx) => {
                          const amtUsd = p.currency === 'USD' ? p.amount : p.amount / p.exchangeRateUsed;
                          const x = (idx / (chartPoints.length - 1)) * 100;
                          const y = 90 - (amtUsd / maxValUsd) * 75;
                          return `${x},${y}`;
                        });
                        return `M ${coords.join(' L ')}`;
                      })()}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                  </svg>

                  {/* Render Visual columns indicators */}
                  {chartPoints.map((point, index) => {
                    const equivUsd = point.currency === 'USD' ? point.amount : point.amount / point.exchangeRateUsed;
                    return (
                      <div key={point.id} className="flex flex-col items-center justify-end h-full z-15 relative group">
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-12 bg-slate-950 text-white rounded-xl border border-slate-800 p-2 text.5-[9px] pointer-events-none leading-none flex flex-col space-y-1 block max-width-[120px] shadow-lg transition-all z-20">
                          <span className="font-bold">{point.description}</span>
                          <span className="font-mono text-indigo-300">Nominal: ${point.amount}</span>
                          <span className="font-mono text-emerald-400">Blue Deflado: U$S {equivUsd.toFixed(1)}</span>
                        </div>
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full border border-white hover:scale-125 transition-all"></div>
                        <span className="text-[8px] font-semibold text-slate-400 mt-2 rotate-12">{point.description.substring(0, 8)}..</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center space-x-6 text-[10px] font-bold mt-4 pt-2 border-t border-slate-850">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-1 bg-indigo-400 inline-block rounded"></span>
                    <span className="text-slate-300">Pesos (Ruido Inflacionario)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-1 bg-emerald-500 inline-block rounded"></span>
                    <span className="text-emerald-400">Dólar Blue (Consumo Deflado Real)</span>
                  </div>
                </div>
              </div>
            )}

            <div className="border border-slate-800 p-3.5 rounded-2xl bg-[#090f1d] text-xs text-slate-300 space-y-1">
              <span className="font-bold text-slate-150">Consejo de uso:</span>
              <p>
                Quando compras un accesorio de U$S 100 hoy contra uno de U$S 100 de hace tres meses, el valor deflacionario te muestra que gastaste exactamente la misma energía de vida, aunque la cuenta en Pesos muestre una variación salvaje del 30% al 40% debido al ajuste del cambio o la inflación. ¡Mira siempre el gráfico verde para saber si realmente estás gastando de más!
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
