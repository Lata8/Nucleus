/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Trash2, 
  PlusCircle, 
  Calendar, 
  Heart, 
  Smile, 
  Brain, 
  Lightbulb, 
  Save, 
  HelpCircle,
  Eye,
  Edit2,
  ChevronRight,
  Key,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { JournalEntry, Habit } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { customAlert, customConfirm } from '../utils/customAlerts';

interface JournalModuleProps {
  entries: JournalEntry[];
  onUpdateEntries: (newEntries: JournalEntry[]) => void;
  habits: Habit[];
}

const MOODS: { type: JournalEntry['mood']; emoji: string; color: string; label: string }[] = [
  { type: 'Increíble', emoji: '✨', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20', label: 'Increíble' },
  { type: 'Bien', emoji: '😊', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20', label: 'Bien' },
  { type: 'Neutral', emoji: '😐', color: 'text-slate-300 border-slate-700 bg-slate-900/40', label: 'Neutral' },
  { type: 'Ansioso', emoji: '🌪️', color: 'text-amber-400 border-amber-500/30 bg-amber-950/20', label: 'Ansioso' },
  { type: 'Cansado', emoji: '💤', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20', label: 'Cansado' }
];

export default function JournalModule({ entries, onUpdateEntries, habits }: JournalModuleProps) {
  // Get current date string (YYYY-MM-DD)
  const todayStr = getLocalDateString();

  // States
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [viewMode, setViewMode] = useState<'write' | 'history' | 'reflection'>('write');
  const [selectedEntryToView, setSelectedEntryToView] = useState<JournalEntry | null>(null);

  // AI Reflection states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(() => {
    return localStorage.getItem('ai_reflection_analysis_result') || null;
  });
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState('');
  const [hasSavedKey, setHasSavedKey] = useState(() => {
    return !!localStorage.getItem('user_custom_gemini_key');
  });
  const [tempApiKey, setTempApiKey] = useState('');
  const [showTempApiKey, setShowTempApiKey] = useState(false);

  // Find if an entry already exists for the selected date
  const existingEntry = entries.find(e => e.date === selectedDate);

  // Form states (controlled with fallback to existing or initial values)
  const [mood, setMood] = useState<JournalEntry['mood']>('Neutral');
  const [gratitude, setGratitude] = useState('');
  const [dailyFocus, setDailyFocus] = useState('');
  const [brainDump, setBrainDump] = useState('');
  const [reflection, setReflection] = useState('');

  // Sync state whenever selected date changes or existing entry changes
  React.useEffect(() => {
    if (existingEntry) {
      setMood(existingEntry.mood);
      setGratitude(existingEntry.gratitude);
      setDailyFocus(existingEntry.dailyFocus);
      setBrainDump(existingEntry.brainDump);
      setReflection(existingEntry.reflection);
    } else {
      // Clear fields for a new entry on this date
      setMood('Neutral');
      setGratitude('');
      setDailyFocus('');
      setBrainDump('');
      setReflection('');
    }
  }, [selectedDate, existingEntry]);

  // Loading phrasing rotation cycles
  React.useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      const phrases = [
        'Enlazando con el Analista de Reflexión Personal...',
        'Consultando tus bitácoras de enfoque y estados recientes...',
        'Compilando hábitos y vínculos de identidad declarados...',
        'Estableciendo relaciones con las Cuatro Leyes del Cambio de Conducta...',
        'Estructurando tu estrategia personalizada para un 1% mejor hoy...'
      ];
      let idx = 0;
      setLoadingPhrase(phrases[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % phrases.length;
        setLoadingPhrase(phrases[idx]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Server-Side AI Analysis request
  const handleRunAnalysis = async () => {
    const customKey = (localStorage.getItem('user_custom_gemini_key') || '').trim();
    if (!customKey) {
      setHasSavedKey(false);
      setAnalysisError('Antes de continuar, ingresa tu Clave de API de Gemini personalizada en el campo de configuración interactivo de abajo. Las claves del servidor global están deshabilitadas para proteger la facturación del propietario.');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-User-API-Key': customKey,
      };
 
      const response = await fetch('/api/reflection/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          entries,
          habits,
        }),
      });
 
      if (!response.ok) {
        const errData = await response.json();
        const errorMessage = errData.details 
          ? `${errData.error} Detalle Técnico: ${errData.details}`
          : (errData.error || 'Error al obtener respuesta de la IA.');
        throw new Error(errorMessage);
      }
 
      const data = await response.json();
      setAnalysisResult(data.analysis);
      localStorage.setItem('ai_reflection_analysis_result', data.analysis);
      setHasSavedKey(true);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'Error técnico de red. Verifica tus credenciales.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Safe markdown converter for custom display of AI audits
  const renderAnalysisMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();

      if (trimmed === '---') {
        return <hr key={idx} className="border-slate-800 my-4" />;
      }

      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-extrabold text-indigo-300 mt-5 mb-2 tracking-tight flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{processBold(trimmed.substring(4))}</span>
          </h4>
        );
      }

      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-base font-extrabold text-white mt-6 mb-3 border-b border-slate-800 pb-1.5 flex items-center space-x-2">
            <span className="w-1.5 h-3.5 bg-indigo-500 rounded-sm inline-block"></span>
            <span>{processBold(trimmed.substring(3))}</span>
          </h3>
        );
      }

      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-lg font-black text-white mt-7 mb-4 tracking-tight">
            {processBold(trimmed.substring(2))}
          </h2>
        );
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <span key={idx} className="block pl-4 relative text-xs sm:text-[13px] leading-relaxed text-[#cbcbcb] my-1.5">
            <span className="absolute left-1 top-2 w-1.5 h-1.5 bg-indigo-500/80 rounded-full"></span>
            {processBold(trimmed.substring(2))}
          </span>
        );
      }

      const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="border-l-2 border-indigo-500/60 pl-3.5 my-3">
            <strong className="text-indigo-200 block text-[13px] font-bold">
              {numMatch[1]}. {processBold(numMatch[2].split(':')[0] || '')}
            </strong>
            {numMatch[2].includes(':') && (
              <p className="text-[#cbcbcb] text-xs sm:text-[13px] mt-1">
                {processBold(numMatch[2].substring(numMatch[2].indexOf(':') + 1))}
              </p>
            )}
          </div>
        );
      }

      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-xs sm:text-[13px] leading-relaxed text-[#cbcbcb] my-2 text-left">
          {processBold(trimmed)}
        </p>
      );
    });
  };

  const processBold = (inputStr: string) => {
    if (!inputStr.includes('**')) return inputStr;
    const parts = inputStr.split('**');
    return parts.map((part, pIdx) => {
      if (pIdx % 2 !== 0) {
        return <strong key={pIdx} className="font-extrabold text-indigo-200">{part}</strong>;
      }
      return part;
    });
  };

  // Handle save entry
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();

    const newOrUpdatedEntry: JournalEntry = {
      id: existingEntry ? existingEntry.id : `journal-${Date.now()}`,
      date: selectedDate,
      mood,
      gratitude,
      dailyFocus,
      brainDump,
      reflection
    };

    let updatedEntries: JournalEntry[];
    if (existingEntry) {
      updatedEntries = entries.map(e => e.id === existingEntry.id ? newOrUpdatedEntry : e);
    } else {
      updatedEntries = [newOrUpdatedEntry, ...entries];
    }

    onUpdateEntries(updatedEntries);
    customAlert(`Entrada de bitácora para el ${selectedDate} guardada exitosamente.`, 'success', 'Bitácora Guardada');
  };

  // Handle delete
  const handleDeleteEntry = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    customConfirm(
      '¿Estás seguro de que deseas eliminar esta entrada de bitácora? Esta acción no se puede deshacer.',
      () => {
        const updated = entries.filter(item => item.id !== id);
        onUpdateEntries(updated);
        if (selectedEntryToView?.id === id) {
          setSelectedEntryToView(null);
        }
      },
      undefined,
      'Eliminar Entrada de Bitácora'
    );
  };

  // Retrieve prompt suggestion
  const getPromptSuggestion = () => {
    switch (mood) {
      case 'Ansioso':
        return 'Escribe todo aquello que esté fuera de tu control y luego déjalo ir en papel. ¿Qué cosa mínima puedes solucionar hoy?';
      case 'Cansado':
        return 'No te exijas de más hoy. Enfócate en recargar energías y celebrar las victorias del descanso consciente.';
      case 'Increíble':
        return '¡Excelente racha! Documenta de dónde proviene tu energía para replicar estas condiciones de alto enfoque en el futuro.';
      case 'Bien':
        return 'Qué factor hizo que hoy sea un buen día? Anótalo para mantener el momentum diario.';
      default:
        return 'Describe de manera honesta en la sección de Descarga Mental todo lo que transcurre por tu mente para liberar memoria de trabajo.';
    }
  };

  return (
    <div className="space-y-6" id="journal-core-container">
      {/* Header section with instructions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-extrabold text-xs tracking-wider uppercase">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Reflexión e Higiene Mental</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Bitácora de Enfoque y Reflexión 📔</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Saca las preocupaciones de tu cabeza para dar espacio al enfoque puro. Registra tu estado emocional, practica la gratitud sistemática y realiza una descarga cognitiva diaria.
          </p>
        </div>

        {/* View Switch Navigation */}
        <div className="flex space-x-1.5 bg-[#0a0f1d] border border-slate-800/80 p-1 rounded-xl shrink-0">
          <button
            onClick={() => { setViewMode('write'); setSelectedEntryToView(null); }}
            className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'write' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Escribir Entrada
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'history' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Historial de Notas ({entries.length})
          </button>
          <button
            onClick={() => { setViewMode('reflection'); setSelectedEntryToView(null); }}
            className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'reflection' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
            <span>Analista de Reflexión IA</span>
          </button>
        </div>
      </div>

      {viewMode === 'write' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          
          {/* Write / Edit Column Form */}
          <form onSubmit={handleSaveEntry} className="lg:col-span-2 space-y-4">
            
            {/* Date Selection Box & Mood Status */}
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha de registro:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={todayStr}
                    className="bg-[#070c18] border border-slate-800 text-xs font-semibold px-2 py-1 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                {existingEntry ? (
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded-lg border border-indigo-900/50">
                    ✏️ Editando entrada existente
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-lg border border-emerald-900/50">
                    🟢 Nota nueva para este día
                  </span>
                )}
              </div>

              {/* Mood Tracker */}
              <div className="space-y-2">
                <label 
                  className="text-xs font-bold block"
                  style={{ color: '#b3b5b9' }}
                >
                  ¿Cómo evalúas tu estado mental/emocional hoy?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.type}
                      type="button"
                      onClick={() => setMood(m.type)}
                      className={`cursor-pointer border py-2.5 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                        mood === m.type 
                          ? `${m.color} scale-[1.03] ring-1 ring-indigo-500/50 border-slate-400`
                          : 'bg-[#070c18] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="text-xl mb-1">{m.emoji}</span>
                      <span className="text-[10px] font-bold tracking-tight">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Science-based Reflection Prompt Tip Box */}
              <div className="bg-[#070c18] border border-slate-800/50 rounded-xl p-3 text-xs leading-normal text-slate-300 italic flex items-start space-x-2.5">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[11px] block text-indigo-300 not-italic">Sugerencia de Enfoque Mental:</span>
                  <p className="text-[10.5px] mt-0.5">{getPromptSuggestion()}</p>
                </div>
              </div>
            </div>

            {/* Gratitude & Focus Win */}
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-450 fill-rose-500/20" />
                  <span>1. Gratitud Diaria (3 cosas por las que estás agradecido hoy)</span>
                </label>
                <textarea
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="Ej: 1. Disfrutar un café caliente en paz. 2. Resolver ese bug difícil de programación. 3. Tener salud para entrenar duro."
                  rows={3}
                  className="w-full bg-[#070c18] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Enfoque o Victoria del Día</span>
                </label>
                <input
                  type="text"
                  value={dailyFocus}
                  onChange={(e) => setDailyFocus(e.target.value)}
                  placeholder="Ej: Completar la maqueta del proyecto y acostarme temprano sin pantallas."
                  className="w-full bg-[#070c18] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* Deep Brain Dump Box */}
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    <span>3. Brain Dump / Descarga Cognitiva</span>
                  </label>
                  <span className="text-[9px] bg-[#070c18] text-slate-500 border border-slate-100 px-2 py-0.5 rounded">Vaciar la memoria RAM mental</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
                  Escribe libremente y sin filtros todo lo que esté rondando en tu cabeza: preocupaciones, ideas sueltas, pendientes ruidosos, frustraciones o notas rápidas. Al sacarlo de tu mente, reduces la carga de estrés.
                </p>
                <textarea
                  value={brainDump}
                  onChange={(e) => setBrainDump(e.target.value)}
                  placeholder="Volcar pensamientos aquí de manera libre..."
                  rows={5}
                  className="w-full bg-[#070c18] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Daily Reflection - What went well & Optimization */}
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                  <span>4. Auditoría y Optimización (¿Qué salió bien y qué puedo mejorar mañana?)</span>
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Ej: Lo bueno es que estuve muy enfocado en la mañana. Lo que puedo corregir es apagar el móvil a las 22:00 para no perder tiempo mirando redes sociales."
                  rows={3}
                  className="w-full bg-[#070c18] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-3">
                {existingEntry ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteEntry(existingEntry.id)}
                    className="cursor-pointer bg-red-950/40 hover:bg-red-950 border border-red-900/40 hover:border-red-800 text-red-400 font-bold text-xs py-2 px-3.5 rounded-xl transition-all flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar entrada</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <button
                  type="submit"
                  className="cursor-pointer bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-2 px-6 rounded-xl shadow-lg shadow-indigo-550/10 transition-all flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Registro Diario</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Stats & Previous entries recap sidebar */}
          <div className="space-y-4">
            
            {/* Habit integration motivation box */}
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 space-y-3 font-sans">
              <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">Higiene Personal</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-transparent">
                "La reflexión sincera es el espejo donde se acomodan tus hábitos". Al evaluar tu nivel de energía y registrar cada pensamiento, creas un espacio sólido para notar qué disparadores del entorno te están afectando.
              </p>
              
              <div className="border-t border-slate-800/60 pt-3 flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Notas guardadas:</span>
                  <span className="font-extrabold text-white font-mono">{entries.length} registros</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Última bitácora:</span>
                  <span className="font-extrabold text-white font-mono">
                    {entries.length > 0 ? entries[0].date : 'Ninguna registrada'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent list lookup sidebar */}
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider px-1">Registros Recientes</h3>
              
              {entries.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2.5 bg-transparent">No tienes reflexiones registradas para desplegar todavía.</p>
              ) : (
                <div className="space-y-2">
                  {entries.slice(0, 5).map((entry) => {
                    const formattedDate = new Date(entry.date + 'T00:00:00').toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });
                    const currentMood = MOODS.find(m => m.type === entry.mood);

                    return (
                      <button
                        key={entry.id}
                        onClick={() => {
                          setSelectedDate(entry.date);
                          setViewMode('write');
                        }}
                        className={`cursor-pointer w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between group ${
                          entry.date === selectedDate 
                            ? 'bg-slate-900 border-indigo-550/40 text-white' 
                            : 'bg-[#070c18] border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-500 block font-mono">{formattedDate}</span>
                          <span className="font-bold truncate max-w-[150px] block text-slate-200">
                            {entry.dailyFocus || 'Sin victoria declarada'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm shrink-0" title={entry.mood}>{currentMood?.emoji || '😐'}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    );
                  })}

                  {entries.length > 5 && (
                    <button
                      onClick={() => setViewMode('history')}
                      className="cursor-pointer w-full text-center py-2 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold block"
                    >
                      Ver todos los registros anteriores →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'history' && (
        /* History Archive Section */
        <div className="space-y-4 animate-in fade-in duration-200" id="journal-history-panel">
          
          {selectedEntryToView ? (
            /* Selected entry expanded reading view */
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <span className="text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider block">Bitácora Expandida</span>
                  <h3 className="text-lg font-black text-white">
                    Registro de Reflexión de: {new Date(selectedEntryToView.date + 'T00:00:00').toLocaleDateString('es-AR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedDate(selectedEntryToView.date);
                      setViewMode('write');
                    }}
                    className="cursor-pointer bg-[#1e293b] border border-[#2d3a4f] hover:bg-[#334155] text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Editar entrada</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteEntry(selectedEntryToView.id)}
                    className="cursor-pointer bg-red-950/30 border border-red-900/40 text-red-400 hover:text-red-300 p-2 rounded-xl transition-all"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedEntryToView(null)}
                    className="cursor-pointer bg-[#1e293b] border border-[#2d3a4f] hover:bg-[#334155] text-[#cbd5e1] hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                  >
                    Volver al Historial
                  </button>
                </div>
              </div>

              {/* Grid content breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Meta details column */}
                <div className="bg-[#070c18] border border-slate-100 p-4 rounded-xl space-y-4 text-xs h-fit">
                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold uppercase text-[9.5px] block">Estado Emocional:</span>
                    <div className="flex items-center space-x-2 bg-slate-900/55 p-2 rounded-lg border border-slate-800">
                      <span className="text-2xl shrink-0">
                        {MOODS.find(m => m.type === selectedEntryToView.mood)?.emoji || '😐'}
                      </span>
                      <div>
                        <strong className="text-slate-100 block">{selectedEntryToView.mood}</strong>
                        <span className="text-[10px] text-slate-500">Evaluación sincera</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold uppercase text-[9.5px] block">Victoria Central:</span>
                    <p className="text-slate-250 font-semibold bg-slate-900/55 p-2 rounded-lg border border-slate-800 leading-relaxed italic pr-1">
                      "{selectedEntryToView.dailyFocus || 'Ninguna victoria declarada para este día.'}"
                    </p>
                  </div>
                </div>

                {/* Substantive diary segments column */}
                <div className="md:col-span-2 space-y-4">
                  
                  {/* Gratitude panel */}
                  <div className="bg-slate-900/30 border border-slate-800/75 rounded-xl p-4.5 space-y-2 text-xs">
                    <h4 className="font-extrabold text-slate-200 flex items-center space-x-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-450 fill-rose-500/15" />
                      <span>Gratitud del Día</span>
                    </h4>
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed font-sans pl-1">
                      {selectedEntryToView.gratitude || 'No se registraron declaraciones de gratitud.'}
                    </p>
                  </div>

                  {/* Brain dump panel */}
                  <div className="bg-slate-900/30 border border-slate-800/75 rounded-xl p-4.5 space-y-2 text-xs">
                    <h4 className="font-extrabold text-slate-200 flex items-center space-x-1.5">
                      <Brain className="w-3.5 h-3.5 text-purple-400" />
                      <span>Descarga Mental (Mental RAM Dump)</span>
                    </h4>
                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed font-sans pl-1">
                      {selectedEntryToView.brainDump || 'No se registraron descargas cognitivas en este día.'}
                    </p>
                  </div>

                  {/* Reflection audit */}
                  <div className="bg-slate-900/30 border border-slate-800/75 rounded-xl p-4.5 space-y-2 text-xs">
                    <h4 className="font-extrabold text-slate-200 flex items-center space-x-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Auditoría de Hábitos y Optimización</span>
                    </h4>
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed font-sans pl-1">
                      {selectedEntryToView.reflection || 'No se registraron diagnósticos o reflexiones preventivas.'}
                    </p>
                  </div>

                </div>

              </div>
            </div>
          ) : (
            /* Standard Full index list */
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">Archivo Histórico de la Bitácora de Enfoque</h3>
                <span className="text-[10.5px] bg-[#070c18] border border-slate-100 text-slate-400 px-2.5 py-0.5 rounded-lg">
                  Total: {entries.length} reflexiones
                </span>
              </div>

              {entries.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <p className="text-sm text-slate-500 italic bg-transparent">Aún no hay entradas de bitácora creadas.</p>
                  <button
                    onClick={() => setViewMode('write')}
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all"
                  >
                    Escribir mi primera reflexión diaria
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {entries.map((entry) => {
                    const formattedDate = new Date(entry.date + 'T00:00:00').toLocaleDateString('es-AR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    });
                    const currentMood = MOODS.find(m => m.type === entry.mood);

                    return (
                      <div
                        key={entry.id}
                        onClick={() => setSelectedEntryToView(entry)}
                        className="cursor-pointer bg-[#070c18] hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 p-4 rounded-xl transition-all flex flex-col justify-between space-y-3 group"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10.5px] font-mono text-slate-500">{formattedDate}</span>
                          <span className="text-lg" title={entry.mood}>{currentMood?.emoji || '😐'}</span>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider block">Victoria Central</h4>
                          <p className="text-slate-200 text-xs font-bold leading-relaxed line-clamp-1 block mt-0.5">
                            {entry.dailyFocus || 'Sin victoria especificada'}
                          </p>
                        </div>

                        <div className="bg-[#0b1323]/50 border border-slate-800 p-2 rounded-lg text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                          {entry.brainDump || entry.gratitude || entry.reflection || 'Entrada vacía.'}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                          <span className="font-medium text-slate-400 font-mono">
                            Estado: <strong className="text-slate-200">{entry.mood}</strong>
                          </span>
                          <span className="text-indigo-400 hover:text-indigo-300 font-black inline-flex items-center space-x-1 group-hover:translate-x-0.5 transition-all">
                            <span>Leer nota</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {viewMode === 'reflection' && (
        <div className="space-y-6 animate-in fade-in duration-300" id="journal-reflection-panel">
          
          {/* Header Dashboard panel */}
          <div className="bg-gradient-to-r from-slate-950 via-[#0a0f1d] to-slate-950 border border-indigo-500/10 rounded-2xl p-6 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px]" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/5 rounded-full blur-[60px]" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex">
                  <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>IA de Crecimiento</span>
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">El Analista de Reflexión Personal 🧬</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  Esta inteligencia lee de forma integrada tus notas de bitácora recientes, estados emocionales y tus hábitos programados para detectar patrones ocultos de procrastinación, evaluar tus disparadores de comportamiento y proponerte optimizaciones sistémicas basadas en la ciencia del cambio de conducta.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] font-black text-slate-500 block uppercase">Notas cargadas</span>
                  <strong className="text-lg text-indigo-400 font-black block mt-0.5">{entries.length}</strong>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] font-black text-slate-500 block uppercase">Hábitos Activos</span>
                  <strong className="text-lg text-indigo-400 font-black block mt-0.5">{habits.length}</strong>
                </div>
              </div>
            </div>

            {!hasSavedKey ? (
              <div className="border-t border-rose-500/15 mt-5 pt-4 space-y-3.5 relative z-10">
                <div className="flex items-start md:items-center space-x-2.5 bg-rose-500/5 border border-rose-500/10 p-3.5 rounded-xl">
                  <Key className="w-5 h-5 text-rose-450 shrink-0 mt-0.5 md:mt-0" />
                  <div className="text-left">
                    <strong className="text-xs text-rose-300 block font-black">Clave de API de Gemini Obligatoria (BYOK)</strong>
                    <span className="text-[10px] text-slate-400 leading-relaxed block">
                      Cada usuario de la aplicación debe registrar su clave de API de Gemini 105% gratuita para usar la IA. Así no se gasta tu presupuesto y se asegura privacidad. Consíguela en segundos sin costo en <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-extrabold hover:underline">Google AI Studio (Click aquí)</a>.
                    </span>
                  </div>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = tempApiKey.trim();
                    if (!trimmed) {
                      customAlert('Por favor ingresa una clave de API de Gemini válida.', 'warning', 'Clave Requerida');
                      return;
                    }
                    localStorage.setItem('user_custom_gemini_key', trimmed);
                    setHasSavedKey(true);
                    setAnalysisError(null);
                    // Trigger the analysis on the next tick
                    setTimeout(() => {
                      handleRunAnalysis();
                    }, 50);
                  }}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      type={showTempApiKey ? 'text' : 'password'}
                      placeholder="AIzaSy... (Pega tu Clave de API de Gemini de Google aquí)"
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 text-xs border border-slate-800 rounded-xl bg-slate-950 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-550"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTempApiKey(!showTempApiKey)}
                      className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350"
                      title={showTempApiKey ? 'Ocultar clave' : 'Mostrar clave'}
                    >
                      {showTempApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-550 border border-indigo-500/10 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/15"
                  >
                    Guardar y Ejecutar IA
                  </button>
                </form>
              </div>
            ) : (
              <div className="border-t border-slate-800/80 mt-5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse animate-duration-1000" />
                  <span>Clave personalizada activa. Diagnosticando tus sistemas de forma segura.</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      customConfirm(
                        '¿Deseas desvincular tu clave de API de Gemini? Esto desactivará el Analista.',
                        () => {
                          localStorage.removeItem('user_custom_gemini_key');
                          setHasSavedKey(false);
                          setTempApiKey('');
                        },
                        undefined,
                        'Desvincular Clave'
                      );
                    }}
                    className="cursor-pointer text-slate-500 hover:text-rose-400 text-[10px] uppercase font-bold hover:bg-slate-950/60 border border-transparent hover:border-slate-800 py-2.5 px-3 rounded-xl transition-all"
                  >
                    Eliminar Clave
                  </button>

                  <button
                    type="button"
                    disabled={isAnalyzing}
                    onClick={handleRunAnalysis}
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-550 disabled:bg-slate-850 disabled:text-slate-500 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/10 flex items-center space-x-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-indigo-200 border-t-transparent lg:border-t-transparent rounded-full animate-spin"></span>
                        <span>Analizando con IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>Generar Auditoría de Sistemas</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Loading panel */}
          {isAnalyzing && (
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-12 text-center space-y-4 animate-pulse">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center animate-spin">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="text-sm font-extrabold text-white">Sincronizando modelos neuronales...</h4>
                <p className="text-xs text-indigo-300 italic animate-pulse">{loadingPhrase}</p>
              </div>
              <div className="w-48 h-1 bg-slate-950 mx-auto rounded-full overflow-hidden border border-slate-800 relative">
                <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full animate-pulse w-full"></div>
              </div>
            </div>
          )}

          {/* Error panel */}
          {analysisError && !isAnalyzing && (
            <div className="bg-red-950/20 border border-red-900/30 text-rose-300 rounded-xl p-5 text-xs text-center space-y-2">
              <p className="font-extrabold text-sm text-red-500">⚠️ Error de Conexión del Analista</p>
              <p className="max-w-md mx-auto">{analysisError}</p>
              <button
                onClick={handleRunAnalysis}
                className="cursor-pointer underline text-indigo-400 font-bold hover:text-indigo-300"
              >
                Volver a intentar
              </button>
            </div>
          )}

          {/* Result panel */}
          {analysisResult && !isAnalyzing && (
            <div className="bg-[#0b1323] border border-indigo-500/15 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
              <div className="flex justify-between items-center border-b border-indigo-500/10 pb-4">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="text-sm font-black text-white text-left">DIAGNÓSTICO EJECUTIVO DE CRECIMIENTO</h4>
                    <span className="text-[10px] text-slate-500 block text-left">Generado con IA en base a tus hábitos y bitácora</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    customConfirm(
                      '¿Deseas vaciar el diagnóstico archivado?',
                      () => {
                        setAnalysisResult(null);
                        localStorage.removeItem('ai_reflection_analysis_result');
                      },
                      undefined,
                      'Vaciar Diagnóstico'
                    );
                  }}
                  className="cursor-pointer text-red-500 hover:text-red-400 p-2 rounded-xl text-xs hover:bg-slate-900 border border-transparent hover:border-slate-800/80 transition-all"
                  title="Eliminar Reporte"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-left font-sans text-slate-300 space-y-2 select-text selection:bg-indigo-500/30">
                {renderAnalysisMarkdown(analysisResult)}
              </div>

              <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
                <span>Reflexión archivada localmente de manera segura.</span>
                <button
                  onClick={handleRunAnalysis}
                  className="cursor-pointer font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Actualizar Reporte de IA</span>
                </button>
              </div>
            </div>
          )}

          {/* Empty State when no evaluation yet */}
          {!analysisResult && !isAnalyzing && !analysisError && (
            <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="inline-flex w-12 h-12 bg-[#070c18] border border-slate-800 rounded-full items-center justify-center">
                <Brain className="w-5 h-5 text-indigo-450" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-white">Ningún diagnóstico generado aún</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pulsa el botón de arriba "Generar Auditoría de Sistemas" para unificar el historial de tus bitácoras y hábitos en un diagnóstico personalizado.
                </p>
              </div>
              <div>
                <button
                  onClick={handleRunAnalysis}
                  className="cursor-pointer bg-[#070c18] hover:bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300 font-black text-xs py-2 px-5 rounded-xl transition-all"
                >
                  Diagnosticar mi rendimiento
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
