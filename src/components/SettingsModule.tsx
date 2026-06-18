/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sliders, 
  Check, 
  Layout, 
  Palette,
  Type,
  Sparkles,
  Award,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { customAlert } from '../utils/customAlerts';

interface SettingsModuleProps {
  appName: string;
  onUpdateAppName: (name: string) => void;
  accentColor: 'indigo' | 'emerald' | 'amber' | 'rose';
  onUpdateAccentColor: (color: 'indigo' | 'emerald' | 'amber' | 'rose') => void;
  fontFamily: 'inter' | 'grotesk' | 'mono';
  onUpdateFontFamily: (font: 'inter' | 'grotesk' | 'mono') => void;
  appStyle: 'ia' | 'rich';
  onUpdateAppStyle: (style: 'ia' | 'rich') => void;
  userName: string;
  onUpdateUserName: (name: string) => void;
}

export default function SettingsModule({
  appName,
  onUpdateAppName,
  accentColor,
  onUpdateAccentColor,
  fontFamily,
  onUpdateFontFamily,
  appStyle,
  onUpdateAppStyle,
  userName,
  onUpdateUserName,
}: SettingsModuleProps) {
  // Input for App Name
  const [editName, setEditName] = useState(appName);
  // Input for User Name
  const [editUserName, setEditUserName] = useState(userName);

  // Custom API Key states for "Bring Your Own Key" (BYOK) paradigm
  const [customKey, setCustomKey] = useState(() => {
    return localStorage.getItem('user_custom_gemini_key') || '';
  });
  const [showKey, setShowKey] = useState(false);
  const [isSavedKey, setIsSavedKey] = useState(() => {
    return !!localStorage.getItem('user_custom_gemini_key');
  });

  const handleSaveCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = customKey.trim();
    if (trimmedKey) {
      localStorage.setItem('user_custom_gemini_key', trimmedKey);
      setCustomKey(trimmedKey);
      setIsSavedKey(true);
      customAlert('¡Clave de API de Gemini guardada de forma segura en la memoria de tu navegador!', 'success', 'Clave Guardada');
    } else {
      localStorage.removeItem('user_custom_gemini_key');
      setIsSavedKey(false);
      customAlert('Clave de API personalizada eliminada. La aplicación volverá a utilizar la clave por defecto del servidor.', 'info', 'Clave Eliminada');
    }
  };

  const handleClearCustomKey = () => {
    setCustomKey('');
    localStorage.removeItem('user_custom_gemini_key');
    setIsSavedKey(false);
    customAlert('Clave de API personalizada eliminada. Volviendo a la clave por defecto del servidor.', 'info', 'Clave Eliminada');
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editUserName.trim()) return;
    onUpdateAppName(editName.trim());
    onUpdateUserName(editUserName.trim());
    customAlert('¡Configuración guardada e identidad actualizada!', 'success', 'Ajustes Guardados');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" id="settings-module-root">
      
      {/* Visual Configuration Board */}
      <div className="bg-[#0b1323] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        
        {/* Header Title */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2 bg-indigo-950/40 border border-indigo-900 rounded-xl text-indigo-400">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Diseño & Personalización Visual</h3>
            <p className="text-xs text-slate-600">Modifica la estética y nombre de tu espacio personal</p>
          </div>
        </div>

        {/* Branding & User Name edit form info */}
        <form onSubmit={handleSaveBranding} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">
                Nombre de tu Espacio Personal
              </label>
              <input
                type="text"
                placeholder="Ej: Elías Hub, Centro de Control"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-800 rounded-xl bg-[#070c18] text-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">
                Tu Nombre de Usuario (Hola, {editUserName})
              </label>
              <input
                type="text"
                placeholder="Ej: Elías"
                value={editUserName}
                onChange={(e) => setEditUserName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-800 rounded-xl bg-[#070c18] text-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/15"
          >
            Guardar Configuración de Identidad
          </button>
        </form>

        {/* Color Palletes Accent */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>Gama de Luces y Contornos (Neon Accents)</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'indigo', name: 'Giga Indigo', color: 'bg-indigo-650' },
              { id: 'emerald', name: 'Láser Verde', color: 'bg-emerald-600' },
              { id: 'amber', name: 'Naranja Sol', color: 'bg-amber-500' },
              { id: 'rose', name: 'Eva Carmesí', color: 'bg-rose-600' },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => onUpdateAccentColor(theme.id as any)}
                className={`cursor-pointer p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center ${
                  accentColor === theme.id 
                    ? 'border-indigo-550 bg-indigo-950/40 text-white font-black scale-[1.02]' 
                    : 'border-slate-800 bg-[#070c18]/45 text-slate-400 hover:text-slate-200 hover:bg-[#070c18]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full ${theme.color} mb-1.5 shadow-md border border-white/10`}></div>
                <span className="text-[10px] font-bold block truncate w-full">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Style Selection Mode */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modo de Estilo de la Interfaz (Visual Mode)</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onUpdateAppStyle('ia')}
              className={`cursor-pointer p-4 rounded-2xl border transition-all text-left flex flex-col justify-between min-h-[90px] ${
                appStyle === 'ia'
                  ? 'border-indigo-500 bg-indigo-950/40 text-white font-black scale-[1.01] shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                  : 'border-slate-800 bg-[#070c18]/45 text-slate-400 hover:text-slate-200 hover:bg-[#070c18]'
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <span className="text-xs font-extrabold uppercase tracking-wider block">Estilo IA (Ciber-Sleek)</span>
                {appStyle === 'ia' && <Check className="w-4 h-4 text-indigo-400 shrink-0 select-none" />}
              </div>
              <p className="text-[10px] text-slate-500 leading-normal font-medium mt-1">
                Líneas técnicas ciber-slate, contrastes mínimos refinados y estética limpia de laboratorio de datos.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onUpdateAppStyle('rich')}
              className={`cursor-pointer p-4 rounded-2xl border transition-all text-left flex flex-col justify-between min-h-[90px] ${
                appStyle === 'rich'
                  ? 'border-fuchsia-500 bg-fuchsia-950/30 text-white font-black scale-[1.01] shadow-[0_0_15px_rgba(217,70,239,0.2)]'
                  : 'border-slate-800 bg-[#070c18]/45 text-slate-400 hover:text-slate-200 hover:bg-[#070c18]'
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <span className="text-xs font-extrabold uppercase tracking-wider block text-fuchsia-400">Estilo Rich (Luxe Glass)</span>
                {appStyle === 'rich' && <Check className="w-4 h-4 text-fuchsia-400 shrink-0 select-none" />}
              </div>
              <p className="text-[10px] text-purple-400/80 leading-normal font-medium mt-1">
                Opulencia con degradados cromáticos, vidrio esmerilado medianoche, bordes dorados/bronce y animaciones infladas.
              </p>
            </button>
          </div>
        </div>

        {/* Letter atmospheric fonts */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            <span>Atmósfera de Letras (Familia de Tipografías)</span>
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'inter', name: 'Sans Clásico', desc: 'Inter UI' },
              { id: 'grotesk', name: 'Tech Displays', desc: 'Space Grotesk' },
              { id: 'mono', name: 'Terminal Dev', desc: 'JetBrains Mono' },
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => onUpdateFontFamily(style.id as any)}
                className={`cursor-pointer p-3 rounded-2xl border transition-all text-center flex flex-col justify-between items-center ${
                  fontFamily === style.id 
                    ? 'border-indigo-550 bg-indigo-950/40 text-white font-black scale-[1.02]' 
                    : 'border-slate-800 bg-[#070c18]/45 text-slate-400 hover:text-slate-200 hover:bg-[#070c18]'
                }`}
              >
                <span className={`text-base tracking-tight mb-1 font-bold ${style.id === 'mono' ? 'font-mono' : style.id === 'grotesk' ? 'font-sans' : 'font-sans'}`}>
                  Aa
                </span>
                <span className="text-[9.5px] font-semibold block mt-1">{style.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI & Gemini Configuration (Bring Your Own Key paradigm) */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">
              Configuración de Inteligencia Artificial (BYOK)
            </span>
          </div>

          <div className="bg-[#070c18] border border-slate-800 p-4 rounded-2xl space-y-4">
            <div className="space-y-1.5 text-left">
              <h4 className="text-xs font-black text-rose-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                <span>Registro Obligatorio de Clave Personal (BYOK)</span>
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-450">
                Para garantizar que la aplicación pueda escalar a miles de usuarios sin que el creador asuma costos de facturación elevados o se agoten las cuotas, <strong>cada usuario debe registrar su propia Clave de API de Gemini gratuita</strong>.
              </p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                <strong>¿Dónde conseguirla?</strong> Puedes crear tu clave de API 100% gratuita y al instante entrando en <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-black inline-flex items-center space-x-0.5"><span>Google AI Studio (Click aquí)</span></a>. No se requiere tarjeta de crédito ni pago.
              </p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                <strong>Privacidad de Nivel Bancario:</strong> Tu clave se almacena encriptada de forma local en tu navegador y es enviada bajo protocolo seguro SSL al servidor únicamente para actuar como proxy de inteligencia artificial. Ningún otro usuario ni administrador podrá verla o acceder a ella.
              </p>
            </div>

            <form onSubmit={handleSaveCustomKey} className="space-y-2.5 pt-1">
              <label className="text-[9px] font-black text-indigo-300 uppercase tracking-widest block text-left">
                Tu Clave de API de Gemini Personalizada
              </label>
              
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder={isSavedKey ? '••••••••••••••••••••••••••••••••••••••••' : 'AIzaSy... (Ingresa tu clave de Gemini)'}
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 text-xs border border-slate-800 rounded-xl bg-slate-950 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350"
                  title={showKey ? 'Ocultar clave' : 'Mostrar clave'}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                  <ShieldCheck className={`w-4 h-4 ${isSavedKey ? 'text-emerald-400' : 'text-rose-500'}`} />
                  <span className={isSavedKey ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {isSavedKey ? 'Clave personalizada guardada (Listo para usar IA)' : 'Falta Clave Personalizada (IA Desactivada)'}
                  </span>
                </div>

                <div className="flex space-x-2">
                  {isSavedKey && (
                    <button
                      type="button"
                      onClick={handleClearCustomKey}
                      className="cursor-pointer bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all"
                    >
                      Restablecer clave
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-550 border border-indigo-500/10 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition-all shadow-md shadow-indigo-500/15"
                  >
                    Guardar Clave de IA
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-2xl text-[11px] text-slate-400 leading-relaxed italic text-center">
          "El control de la estética y la disciplina personal moldean el éxito. Personaliza tu entorno para mantenerte enfocado."
        </div>
      </div>
    </div>
  );
}
